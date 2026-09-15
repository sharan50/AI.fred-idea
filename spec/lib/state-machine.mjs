// The task service: the state machine of 02, section 5, the step machine of
// section 5.4, the timers of Table 2.8, the watchdog and the exceptions board.
//
// Reference implementation, in memory and deterministic: time is passed in,
// never read from a clock, and every change of state is an event appended to
// one log. The public surface is the closed set of transitions and the step
// events; there is no method that sets a state directly.
import { STATES, LIVE_STATES, TERMINAL_STATES, TRANSITIONS, REFUSAL_CODES, VERDICTS, OUTCOME_CODES, BOARD_ACTIONS, TIMERS } from './vocab.mjs';
import { add, addMs, ms, earliest, min, parseDuration } from './time.mjs';
import { Ids } from './ids.mjs';

export const INVARIANT =
  'A task never leaves the system by omission. Every task is in exactly one named state. Every non-terminal state carries a live timer. Every change of state is an explicit, recorded transition, and no task reaches a terminal state without one. Silence from the user is a legitimate way for a task to end: it moves through visible nudges into lapsed, and lapsed is not withdrawn. Silence from the system is forbidden: a task with no live timer is an exception, and the watchdog places it on the exceptions board until a person gives it one.';

// Table 2.2, one row per line; a name may appear on more than one row.
export const TRANSITION_TABLE = [
  { name: 'accept', from: ['received'], to: 'planning' },
  { name: 'refuse', from: ['received', 'planning'], to: 'refused' },
  { name: 'propose', from: ['planning'], to: 'awaiting-authority' },
  { name: 'authorise', from: ['awaiting-authority'], to: 'active' },
  { name: 'revise', from: ['awaiting-authority'], to: 'planning' },
  { name: 'bounce', from: ['active'], to: 'awaiting-user' },
  { name: 'ask', from: ['active'], to: 'awaiting-user' },
  { name: 'request-extension', from: ['active'], to: 'awaiting-user' },
  { name: 'resume', from: ['awaiting-user', 'awaiting-third-party'], to: 'active' },
  { name: 'wait', from: ['active'], to: 'awaiting-third-party' },
  { name: 'escalate-resume', from: ['awaiting-third-party'], to: 'active' },
  { name: 'expire-authority', from: ['active', 'awaiting-user', 'awaiting-third-party'], to: 'awaiting-authority' },
  { name: 'report', from: ['active'], to: 'awaiting-verdict' },
  { name: 'verdict', from: ['awaiting-verdict'], to: 'closed' },
  { name: 'redo', from: ['awaiting-verdict'], to: 'closed' },
  { name: 'withdraw', from: LIVE_STATES, to: 'closed' },
  { name: 'lapse', from: ['awaiting-authority', 'awaiting-user', 'awaiting-verdict'], to: 'lapsed' },
  { name: 'revive', from: ['lapsed'], to: 'planning' },
];

// Table 2.1: the timer every live state carries.
export const STATE_TIMER = {
  received: 'planning-deadline',
  planning: 'planning-deadline',
  'awaiting-authority': 'nudge-schedule',
  active: 'step-deadline',
  'awaiting-user': 'nudge-schedule',
  'awaiting-third-party': 'response-window',
  'awaiting-verdict': 'nudge-schedule',
};

export const STEP_LIVE = ['ready', 'running', 'checking'];

// Table 2.8's illustrative defaults, per task type; every value is
// illustrative until the pilot sets it.
export const DEFAULT_TIMERS = {
  planning_deadline: 'PT30M',
  planning_deadline_complex: 'PT2H',
  extend_planning: 'PT8H',
  nudge_offsets: ['PT4H', 'P1D', 'P3D'],
  lapse_at: 'P7D',
  validity_window: 'P7D',
  check_deadline: { harness: 'PT10M', worker: 'PT30M' },
  placement_window: 'PT2M',
  hold_window: 'PT15M',
  column_limit: { default: 'PT1H', 'check-pending': 'PT30M' },
  watchdog_cycle: 'PT1M',
  escalate_holding_window: 'P2D',
  step_deadline_fallback: 'PT8H',
};

export class SpecError extends Error {
  constructor(message, detail) {
    super(message);
    this.detail = detail;
  }
}

export function allowedTransition(from, name) {
  if (!TRANSITIONS.includes(name)) throw new SpecError(`"${name}" is not one of the eighteen transitions`);
  const row = TRANSITION_TABLE.find((r) => r.name === name && r.from.includes(from));
  return row ? row.to : null;
}

export function isTerminal(state) {
  return TERMINAL_STATES.includes(state);
}

function stateOfNudge(task) {
  return task.state;
}

export class TaskService {
  constructor({ timers = DEFAULT_TIMERS, catalogue = [], planner = null, hooks = {}, ids = new Ids(), offset = '+05:30' } = {}) {
    this.timers = timers;
    this.catalogue = new Map(catalogue.map((e) => [e.step_type, e]));
    this.planner = planner;
    this.hooks = hooks;
    this.ids = ids;
    this.offset = offset;
    this.tasks = new Map();
    this.steps = new Map();
    this.events = [];
    this.timersByTask = new Map();
    this.questions = new Map();
    this.extensions = new Map();
    this.board = new Map();
    this.incidents = [];
    this.nudgeProgress = new Map();
  }

  // ---- reading -------------------------------------------------------------

  task(taskId) {
    const t = this.tasks.get(taskId);
    if (!t) throw new SpecError(`unknown task ${taskId}`);
    return t;
  }

  stepsOf(taskId) {
    return [...(this.steps.get(taskId) || new Map()).values()];
  }

  step(taskId, stepId) {
    const s = (this.steps.get(taskId) || new Map()).get(stepId);
    if (!s) throw new SpecError(`unknown step ${stepId} of ${taskId}`);
    return s;
  }

  eventsOf(taskId, kind = null) {
    return this.events.filter((e) => e.task_id === taskId && (kind === null || e.kind === kind));
  }

  // Every live state carries a timer, and every step in flight carries its
  // own beside it: a task may hold several timers, keyed by kind and step.
  timersOf(taskId) {
    return [...(this.timersByTask.get(taskId) || new Map()).values()];
  }

  timerOfKind(taskId, kind, stepId = null) {
    return (this.timersByTask.get(taskId) || new Map()).get(timerKey(kind, stepId)) || null;
  }

  // The earliest timer-set not superseded: what the invariant asks for.
  liveTimer(taskId) {
    const all = this.timersOf(taskId);
    if (all.length === 0) return null;
    return all.reduce((a, b) => (ms(b.due) < ms(a.due) ? b : a));
  }

  openQuestions(taskId) {
    return [...this.questions.values()].filter((q) => q.task_id === taskId && q.answer === null);
  }

  openExtensions(taskId) {
    return [...this.extensions.values()].filter((x) => x.task_id === taskId && x.answer === null);
  }

  // ---- the log -------------------------------------------------------------

  record(taskId, kind, at, fields = {}, actor = { kind: 'system', id: 'task-service' }) {
    const ev = { event_id: this.ids.next('e', 6), task_id: taskId, at, kind, actor, ...fields };
    this.events.push(ev);
    if (this.hooks.onEvent) this.hooks.onEvent(ev);
    return ev;
  }

  // A timer is a scheduled event in the same log. A later timer-set or a
  // transition supersedes the old one; the scheduler reads the earliest
  // future timer-set not superseded.
  setTimer(taskId, kind, due, at, extra = {}) {
    if (!TIMERS.includes(kind)) throw new SpecError(`unknown timer kind ${kind}`);
    if (!this.timersByTask.has(taskId)) this.timersByTask.set(taskId, new Map());
    const key = timerKey(kind, extra.step_id || null);
    const prev = this.timersByTask.get(taskId).get(key);
    const ev = this.record(taskId, 'timer-set', at, { timer: kind, due, supersedes: prev ? prev.event_id : null, ...extra });
    this.timersByTask.get(taskId).set(key, { event_id: ev.event_id, kind, due, step_id: extra.step_id || null, key, aliases: extra.aliases });
    return ev;
  }

  clearTimer(taskId, kind = null, stepId = null) {
    const map = this.timersByTask.get(taskId);
    if (!map) return;
    if (kind === null) map.clear();
    else map.delete(timerKey(kind, stepId));
  }

  // ---- intake and transitions ---------------------------------------------

  open(request, { task_type, complex = false } = {}) {
    if (!task_type) throw new SpecError('a task opens under a task type');
    const at = request.received_at;
    const taskId = this.ids.next('t', 2);
    const task = {
      task_id: taskId, task_type, market: request.market, locale: request.locale, user_ref: request.user_ref,
      device_binding: request.device_binding, state: 'received', opened_at: at, request_ids: [request.request_id],
      plan_id: null, envelope_id: null, envelope_version: null, lapsed_from: null, refusal_code: null, verdict: null,
      parent_task_id: null, child_task_id: null, report: null, renewal_open: false, committed_spend: { fired: 0, reserved: 0 }, validity_to: null,
    };
    this.tasks.set(taskId, task);
    this.steps.set(taskId, new Map());
    this.setTimer(taskId, 'planning-deadline', add(at, complex ? this.timers.planning_deadline_complex : this.timers.planning_deadline), at, { task_type });
    return task;
  }

  transition(taskId, name, at, { actor = { kind: 'system', id: 'task-service' }, reason = '', ...payload } = {}) {
    const task = this.task(taskId);
    const to = allowedTransition(task.state, name);
    if (to === null) throw new SpecError(`no transition "${name}" from ${task.state}`, { task: taskId, from: task.state, name });
    const from = task.state;
    const fields = { from, to, transition: name, reason, timer_set: null };
    switch (name) {
      case 'refuse':
        if (!REFUSAL_CODES.includes(payload.reason_code)) throw new SpecError('refuse requires a reason code from the refusal list');
        if (this.stepsOf(taskId).some((s) => s.state !== 'pending')) throw new SpecError('refuse only before any step executes');
        task.refusal_code = payload.reason_code;
        fields.reason = payload.reason_code;
        break;
      case 'authorise':
        if (!payload.envelope || !payload.envelope.authorised_by) throw new SpecError('authorise needs a device-signed envelope version');
        task.envelope_id = payload.envelope.envelope_id;
        task.envelope_version = payload.envelope.version;
        task.validity_to = payload.envelope.validity.to;
        task.renewal_open = false;
        break;
      case 'wait':
        this.assertWaitCondition(taskId, payload.step_id);
        break;
      case 'expire-authority':
        this.cancelUnfired(taskId, 'lapsed', at);
        this.voidAuthority(taskId, at, reason || 'authority ended');
        task.renewal_open = true;
        break;
      case 'report':
        if (this.stepsOf(taskId).some((s) => !['closed', 'cancelled'].includes(s.state))) throw new SpecError('report only when every step is closed or cancelled');
        if (task.renewal_open) throw new SpecError('report only when no renewal of the authority is open');
        task.report = { reference: this.ids.next('rep', 4), version: 1, sent_at: at, delivered_at: null };
        break;
      case 'verdict':
        if (!VERDICTS.includes(payload.verdict) || payload.verdict === 'withdrawn' || payload.verdict === 'wrong-outcome') {
          throw new SpecError('verdict carries done-satisfied, done-rough or could-not-complete; withdrawn is withdraw and wrong-outcome is redo');
        }
        task.verdict = payload.verdict;
        break;
      case 'redo':
        task.verdict = 'wrong-outcome';
        break;
      case 'withdraw':
        task.verdict = 'withdrawn';
        this.cancelInFlight(taskId, at);
        this.voidAuthority(taskId, at, 'withdrawn');
        break;
      case 'lapse':
        task.lapsed_from = from;
        fields.reason = reason || `nudge schedule exhausted in ${from}`;
        this.cancelUnfired(taskId, 'lapsed', at);
        this.voidAuthority(taskId, at, 'lapsed');
        break;
      case 'revive':
        task.lapsed_from = null;
        task.envelope_version = null;
        break;
      default:
        break;
    }
    task.state = to;
    const ev = this.record(taskId, 'transition', at, fields, actor);
    this.armStateTimer(taskId, at, ev, payload);
    if (name === 'redo') this.spawnChild(taskId, at);
    if (name === 'authorise') this.onAuthorised(taskId, at);
    return ev;
  }

  armStateTimer(taskId, at, transitionEvent, payload = {}) {
    const task = this.task(taskId);
    if (isTerminal(task.state)) {
      this.clearTimer(taskId);
      return;
    }
    const from = transitionEvent.from;
    if (STATE_TIMER[from] && STATE_TIMER[from] !== STATE_TIMER[task.state]) this.clearTimer(taskId, STATE_TIMER[from]);
    if (task.state === 'awaiting-authority' || task.state === 'planning') this.clearTimer(taskId, 'validity-window');
    const kind = STATE_TIMER[task.state];
    let due;
    switch (kind) {
      case 'planning-deadline': {
        const kept = this.timerOfKind(taskId, 'planning-deadline');
        due = payload.keep_planning_deadline && kept ? kept.due : add(at, this.timers.planning_deadline);
        break;
      }
      case 'nudge-schedule':
        this.nudgeProgress.set(taskId, { began: at, ordinal: 0 });
        due = add(at, this.timers.nudge_offsets[0]);
        break;
      case 'step-deadline':
        due = this.earliestStepDeadline(taskId) || add(at, this.timers.step_deadline_fallback);
        break;
      case 'response-window': {
        const blocked = this.stepsOf(taskId).filter((s) => s.state === 'closed' && s.outcome && s.outcome.code === 'blocked-third-party' && s.response_window_until);
        due = earliest(blocked.map((s) => s.response_window_until)) || add(at, this.timers.escalate_holding_window);
        break;
      }
      default:
        throw new SpecError(`no timer rule for ${task.state}`);
    }
    transitionEvent.timer_set = { kind, due, task_type: task.task_type };
    this.setTimer(taskId, kind, due, at);
  }

  // ---- plans and steps -----------------------------------------------------

  adoptPlan(taskId, plan, at, { supersedes = null } = {}) {
    const task = this.task(taskId);
    if (!['planning', 'active', 'awaiting-user', 'awaiting-third-party', 'awaiting-authority'].includes(task.state)) throw new SpecError(`no plan is adopted in ${task.state}`);
    const map = this.steps.get(taskId);
    const keep = new Set(plan.steps.map((s) => s.step_id));
    for (const old of map.values()) {
      if (keep.has(old.step_id)) continue;
      if (old.state === 'running') {
        old.runtime.supersede_on_close = plan.plan_id;
        continue;
      }
      if (['pending', 'ready', 'checking', 'bounced'].includes(old.state)) {
        const successor = plan.steps.find((s) => s.after && s.after.includes(old.step_id)) || plan.steps[0];
        this.cancelStep(taskId, old, 'superseded', at, successor ? successor.step_id : null);
      }
    }
    for (const s of plan.steps) {
      if (map.has(s.step_id) && ['closed', 'cancelled'].includes(map.get(s.step_id).state)) continue;
      const existing = map.get(s.step_id);
      const step = existing ? Object.assign(existing, s) : { ...s };
      if (!existing) {
        step.state = 'pending';
        step.runtime = {};
        step.fired_marker = step.fired_marker || null;
        step.cancelled = null;
        step.outcome = null;
        if (step.attempts === undefined) step.attempts = { made: 0, cap: this.entry(step.step_type).retry_cap };
        map.set(step.step_id, step);
        this.record(taskId, 'step-state', at, { step_id: step.step_id, from: 'pending', to: 'pending', cause: 'planned' });
      }
    }
    task.plan_id = plan.plan_id;
    this.record(taskId, 'plan-produced', at, { plan_id: plan.plan_id });
    if (supersedes) this.record(taskId, 'plan-superseded', at, { plan_id: plan.plan_id, supersedes });
    if (['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) {
      this.promoteReady(taskId, at);
      this.reconcile(taskId, at, 'plan adopted');
    }
    return plan;
  }

  entry(stepType) {
    const e = this.catalogue.get(stepType);
    if (!e) throw new SpecError(`unknown step type ${stepType}`);
    return e;
  }

  setStepState(taskId, step, to, at, cause) {
    const from = step.state;
    step.state = to;
    this.record(taskId, 'step-state', at, { step_id: step.step_id, from, to, cause });
  }

  onAuthorised(taskId, at) {
    const task = this.task(taskId);
    const version = `${task.envelope_id}/v${task.envelope_version}`;
    for (const s of this.stepsOf(taskId)) {
      if (s.state === 'cancelled' && s.cancelled && s.cancelled.cause === 'lapsed' && s.runtime.reissue_on_renewal) {
        s.state = 'pending';
        s.cancelled = null;
        s.runtime.reissue_on_renewal = false;
        this.record(taskId, 'step-state', at, { step_id: s.step_id, from: 'cancelled', to: 'pending', cause: 'renewal re-issued the step' });
      }
      if (!['closed', 'cancelled'].includes(s.state) && s.envelope_version !== version) {
        // Steps carry the version they were classified against; an older
        // version is re-classified before the step runs.
        s.envelope_version = version;
        s.runtime.needs_classification = true;
      }
    }
    this.setTimer(taskId, 'validity-window', task.validity_to, at);
    if (this.hooks.onReclassify) this.hooks.onReclassify(taskId, null, at);
    this.promoteReady(taskId, at);
    this.reconcile(taskId, at, 'authorised');
    this.rearmStepTimer(taskId, at);
  }

  promoteReady(taskId, at) {
    const task = this.task(taskId);
    if (!['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) return;
    const map = this.steps.get(taskId);
    for (const s of map.values()) {
      if (s.state !== 'pending') continue;
      const done = (s.after || []).every((id) => {
        const d = map.get(id);
        return d && d.state === 'closed' && ['ok', 'ok-with-variance'].includes(d.outcome.code);
      });
      if (!done) continue;
      if (s.class === 'user') {
        this.setStepState(taskId, s, 'bounced', at, 'user step offered on the device');
      } else {
        s.deadline = add(at, this.entry(s.step_type).deadline_default);
        this.setStepState(taskId, s, 'ready', at, 'every step in its after list is closed');
      }
    }
  }

  earliestStepDeadline(taskId) {
    const live = this.stepsOf(taskId).filter((s) => STEP_LIVE.includes(s.state) && s.deadline);
    return earliest(live.map((s) => s.deadline));
  }

  claim(taskId, stepId, at, { context_id = null } = {}) {
    const task = this.task(taskId);
    const step = this.step(taskId, stepId);
    if (task.state !== 'active') throw new SpecError(`a step is claimed only while the task is active, not ${task.state}`);
    if (step.state !== 'ready') throw new SpecError(`only a ready step is claimed; ${stepId} is ${step.state}`);
    if (task.validity_to && ms(at) >= ms(task.validity_to)) throw new SpecError('the step runner claims nothing outside the validity window');
    if (step.envelope_version !== `${task.envelope_id}/v${task.envelope_version}`) throw new SpecError('a step whose version is older than the current envelope is re-classified before it runs');
    step.context_id = context_id || this.ids.next('ctx', 4);
    this.record(taskId, 'context-issued', at, { step_id: stepId, context_id: step.context_id, envelope_version: step.envelope_version, expiry: min(add(at, this.timers.placement_window), task.validity_to) });
    this.setStepState(taskId, step, 'running', at, 'claimed');
    return step;
  }

  prepareAct(taskId, stepId, at, { checker = null } = {}) {
    const step = this.step(taskId, stepId);
    if (step.state !== 'running') throw new SpecError('only a running step prepares an act');
    if (step.reversibility !== 'irreversible') throw new SpecError('only an irreversible step is checked');
    const checkerKind = step.executor.kind === 'harness' ? 'worker' : 'harness';
    const deadline = add(at, this.timers.check_deadline[checkerKind]);
    step.check = { check_id: this.ids.next('chk', 4), checker, deadline, checker_kind: checkerKind };
    this.record(taskId, 'check-requested', at, { step_id: stepId, check_id: step.check.check_id, checker });
    this.setStepState(taskId, step, 'checking', at, 'act prepared; the other party checks');
    this.setTimer(taskId, 'check-deadline', deadline, at, { step_id: stepId });
    this.rearmStepTimer(taskId, at);
    return step.check;
  }

  decideCheck(taskId, stepId, at, { decision, reason = '', checker, routeWrong = false, token = null }) {
    const task = this.task(taskId);
    const step = this.step(taskId, stepId);
    if (step.state !== 'checking') throw new SpecError('only a checking step is decided');
    if (checker && step.executor && checker.id === step.executor.id) throw new SpecError('the checker is never the executor');
    if (checker && checker.kind !== step.check.checker_kind) throw new SpecError(`this check is the ${step.check.checker_kind}'s`);
    if (checker) step.check.checker = checker;
    this.record(taskId, 'check-decided', at, { step_id: stepId, check_id: step.check.check_id, decision, reason, checker: step.check.checker });
    this.clearTimer(taskId, 'check-deadline', stepId);
    if (decision === 'approve') {
      const expires = min(step.deadline, task.validity_to);
      step.approval_token = token || { check_id: step.check.check_id, token_id: this.ids.next('tok', 4), envelope_version: step.envelope_version, expires_at: expires };
      this.record(taskId, 'token-issued', at, { step_id: stepId, check_id: step.check.check_id, token: step.approval_token.token_id, envelope_version: step.envelope_version });
      this.setStepState(taskId, step, 'running', at, 'approved; the act may fire');
    } else {
      this.setStepState(taskId, step, 'ready', at, `declined: ${reason}`);
      if (routeWrong) this.replan(taskId, 'checker-declined-route-wrong', at);
    }
    this.rearmStepTimer(taskId, at);
    return step;
  }

  writeFiredMarker(taskId, stepId, at, action, writtenBy) {
    const step = this.step(taskId, stepId);
    if (step.state !== 'running') throw new SpecError('a committing action fires only from running');
    if (step.reversibility === 'irreversible' || action === 'committing-placement') {
      if (!step.approval_token) throw new SpecError('no committing action without an approval token');
      if (step.approval_token.consumed_at) throw new SpecError('a consumed token is refused');
      if (step.approval_token.envelope_version !== step.envelope_version) throw new SpecError('the token names another envelope version');
      step.approval_token.consumed_at = at;
    }
    step.fired_marker = { at, action, written_by: writtenBy, token_id: step.approval_token ? step.approval_token.token_id : undefined };
    if (step.fired_marker.token_id === undefined) delete step.fired_marker.token_id;
    if (step.amount) {
      const task = this.task(taskId);
      task.committed_spend.fired += step.amount.amount;
      task.committed_spend.reserved = Math.max(0, task.committed_spend.reserved - step.amount.amount);
    }
    return step.fired_marker;
  }

  closeStep(taskId, stepId, outcome, at) {
    const task = this.task(taskId);
    const step = this.step(taskId, stepId);
    if (!['running', 'checking', 'bounced', 'ready'].includes(step.state)) throw new SpecError(`a ${step.state} step does not close`);
    if (!OUTCOME_CODES.includes(outcome.code)) throw new SpecError(`unknown outcome code ${outcome.code}`);
    if (step.state === 'ready' && !['failed-final', 'refused-policy', 'blocked-third-party'].includes(outcome.code)) throw new SpecError('a ready step closes only by the task service on a deadline or a policy refusal');
    if (outcome.code === 'superseded') {
      this.cancelStep(taskId, step, 'superseded', at, outcome.fields.superseding_step);
      return step;
    }
    if (outcome.code === 'failed-retryable' && step.fired_marker) throw new SpecError('a step with a fired marker never closes failed-retryable');
    if (outcome.code === 'blocked-third-party') {
      const allowed = this.entry(step.step_type).response_windows;
      if (!allowed.includes(outcome.fields.response_window)) throw new SpecError('the response window is chosen from the step type\'s allowed windows, never a free number');
    }
    if (outcome.code === 'failed-retryable') {
      step.attempts.made += 1;
      if (step.attempts.made >= step.attempts.cap) {
        outcome = { ...outcome, code: 'failed-final', fields: { reason: 'retry cap', alternatives_considered: [outcome.fields.error_class], ...outcome.fields }, closed_by: { kind: 'task-service', id: 'task-service' } };
      } else {
        this.record(taskId, 'outcome', at, { step_id: stepId, code: 'failed-retryable', fields: outcome.fields, closed_by: outcome.closed_by, checked_by: outcome.checked_by || null, artefacts: outcome.artefacts || [] });
        step.deadline = add(at, this.entry(step.step_type).deadline_default);
        step.context_id = null;
        step.retry_token = this.ids.next('rt', 4);
        this.setStepState(taskId, step, 'ready', at, 'failed-retryable; re-queued on the same route to the pool');
        this.rearmStepTimer(taskId, at);
        return step;
      }
    }
    step.outcome = { ...outcome, step_id: stepId, closed_at: at, checked_by: outcome.checked_by || (step.check && step.check.checker) || null, artefacts: outcome.artefacts || [], fired_marker: step.fired_marker || null };
    this.record(taskId, 'outcome', at, { step_id: stepId, code: outcome.code, fields: outcome.fields, closed_by: outcome.closed_by, checked_by: step.outcome.checked_by, artefacts: step.outcome.artefacts });
    this.setStepState(taskId, step, 'closed', at, outcome.code);
    step.context_id = null;
    if (step.approval_token && !step.fired_marker) this.releaseReservation(taskId, step);
    if (step.runtime.supersede_on_close) this.cancelStep(taskId, step, 'superseded', at, null);
    this.applyConsequence(taskId, step, at);
    return step;
  }

  releaseReservation(taskId, step) {
    if (step.amount) {
      const task = this.task(taskId);
      task.committed_spend.reserved = Math.max(0, task.committed_spend.reserved - step.amount.amount);
    }
  }

  applyConsequence(taskId, step, at) {
    const task = this.task(taskId);
    const code = step.outcome.code;
    switch (code) {
      case 'ok':
      case 'ok-with-variance':
        if (this.hooks.onFacts && step.outcome.fields.facts_established) this.hooks.onFacts(taskId, step);
        if (step.created_by) this.reissueAfterUser(taskId, step, at);
        break;
      case 'blocked-third-party':
        step.response_window_until = add(at, step.outcome.fields.response_window);
        break;
      case 'blocked-needs-user':
        this.createUserStep(taskId, step, at);
        break;
      case 'blocked-outside-envelope':
        this.raiseExtension(taskId, step, at);
        break;
      case 'failed-final':
        this.replan(taskId, 'failed-final', at);
        break;
      case 'refused-policy':
        this.replan(taskId, 'refused-policy', at);
        break;
      default:
        break;
    }
    this.promoteReady(taskId, at);
    this.reconcile(taskId, at, `step ${step.step_id} closed ${code}`);
    if (task.state === 'active') this.rearmStepTimer(taskId, at);
  }

  createUserStep(taskId, blocked, at) {
    const id = this.ids.next('s', 2);
    const user = {
      step_id: id, task_id: taskId, plan_id: this.task(taskId).plan_id, purpose: blocked.outcome.fields.needed, step_type: blocked.step_type, template: blocked.template,
      class: 'user', reversibility: blocked.reversibility, route: 'bounce', executor: null, surface: 'device', party: blocked.party, act: blocked.act, identity_acts: blocked.identity_acts,
      fields: [], facts_in_clear: [], envelope_lines: blocked.envelope_lines, expected_outcome: blocked.expected_outcome, after: [], state: 'pending',
      envelope_version: blocked.envelope_version, policy: blocked.policy,
      bounce: { form: 'user-act', instruction: blocked.outcome.fields.needed, target: null, callback: `cb_${taskId.slice(2)}_${id.slice(2)}`, expires: null }, device_response: null,
      fired_marker: null, cancelled: null, outcome: null, created_by: blocked.step_id, runtime: {},
    };
    this.steps.get(taskId).set(id, user);
    this.record(taskId, 'step-state', at, { step_id: id, from: 'pending', to: 'pending', cause: `blocked-needs-user on ${blocked.step_id} created a user step` });
    return user;
  }

  // The user step a blocked-needs-user closure created has closed ok: the
  // step it unblocked is re-planned before it runs, which without a planner
  // is a fresh attempt on the same route with the fact now in the store.
  reissueAfterUser(taskId, userStep, at) {
    const blocked = this.steps.get(taskId).get(userStep.created_by);
    if (!blocked || blocked.state !== 'closed' || !['blocked-needs-user'].includes(blocked.outcome.code)) return;
    const plan = this.replan(taskId, 'fact-contradicted-or-expired', at);
    if (plan) return;
    blocked.outcome = null;
    blocked.deadline = add(at, this.entry(blocked.step_type).deadline_default);
    this.record(taskId, 'step-state', at, { step_id: blocked.step_id, from: 'closed', to: 'ready', cause: 'the user supplied what was needed; re-issued' });
    blocked.state = 'ready';
  }

  // A re-plan that finds no route leaves the steps that depended on the
  // failed one unreachable: they end cancelled, superseded by nothing, so
  // the task can report what was and was not done.
  cancelUnreachable(taskId, at) {
    const map = this.steps.get(taskId);
    let changed = true;
    while (changed) {
      changed = false;
      for (const s of map.values()) {
        if (s.state !== 'pending') continue;
        const dead = (s.after || []).some((id) => {
          const d = map.get(id);
          return d && (d.state === 'cancelled' || (d.state === 'closed' && ['failed-final', 'refused-policy'].includes(d.outcome.code)));
        });
        if (dead) {
          this.cancelStep(taskId, s, 'superseded', at, null);
          changed = true;
        }
      }
    }
  }

  raiseExtension(taskId, step, at) {
    const task = this.task(taskId);
    const version = `${task.envelope_id}/v${task.envelope_version}`;
    const line = step.outcome.fields.envelope_line;
    const existing = [...this.extensions.values()].find((x) => x.task_id === taskId && x.envelope_version === version && x.line.field === line && x.answer === null);
    if (existing) return existing;
    const renewal = task.renewal_open ? [...this.extensions.values()].find((x) => x.task_id === taskId && x.raised_by.kind === 'renewal' && x.answer === null) : null;
    if (renewal && line === 'validity-window') return renewal;
    const req = {
      reference: this.ids.next('ext', 4), task_id: taskId, envelope_version: version, raised_by: { kind: 'step-closure', step_id: step.step_id },
      line: { field: line, proposed_value: step.outcome.fields.proposed_value === undefined ? null : step.outcome.fields.proposed_value },
      reason: step.purpose, raised_at: at, offers_do_yourself: this.entry(step.step_type).bounce_form === 'user-act', answer: null,
    };
    this.extensions.set(req.reference, req);
    return req;
  }

  raiseRenewal(taskId, at) {
    const task = this.task(taskId);
    const req = {
      reference: this.ids.next('ext', 4), task_id: taskId, envelope_version: `${task.envelope_id}/v${task.envelope_version}`, raised_by: { kind: 'renewal', step_id: null },
      line: { field: 'validity-window', proposed_value: add(at, this.timers.validity_window) }, reason: 'renew the validity window', raised_at: at, offers_do_yourself: false, answer: null,
    };
    this.extensions.set(req.reference, req);
    return req;
  }

  answerExtension(reference, at, { kind, value = null, device, envelope = null }) {
    const req = this.extensions.get(reference);
    if (!req || req.answer !== null) throw new SpecError('no open extension request');
    const task = this.task(req.task_id);
    if (!['approve', 'approve-narrower', 'decline', 'do-this-yourself'].includes(kind)) throw new SpecError(`unknown extension answer ${kind}`);
    if (kind === 'do-this-yourself' && !req.offers_do_yourself) throw new SpecError('do this yourself is offered only where the catalogue names a user-act form');
    if ((kind === 'approve' || kind === 'approve-narrower') && (!envelope || !envelope.authorised_by)) throw new SpecError('an approval is a new device-signed envelope version');
    req.answer = { kind, value, at, device, new_version: envelope ? envelope.version : null };
    const step = req.raised_by.step_id ? this.step(task.task_id, req.raised_by.step_id) : null;
    switch (kind) {
      case 'approve':
      case 'approve-narrower':
        this.envelopeEdited(task.task_id, envelope, at, req.raised_by.kind === 'renewal' ? 'renewal' : 'extension');
        if (step) {
          step.state = 'pending';
          step.outcome = null;
          this.record(task.task_id, 'step-state', at, { step_id: step.step_id, from: 'closed', to: 'pending', cause: 'extension approved; re-classified on the new version' });
        }
        break;
      case 'decline':
        if (step) {
          step.outcome = { step_id: step.step_id, code: 'failed-final', closed_by: { kind: 'task-service', id: 'task-service' }, checked_by: null, fields: { reason: `declined extension of ${req.line.field}`, alternatives_considered: [] }, artefacts: [], closed_at: at, fired_marker: null };
          this.record(task.task_id, 'outcome', at, { step_id: step.step_id, code: 'failed-final', fields: step.outcome.fields, closed_by: step.outcome.closed_by, checked_by: null, artefacts: [] });
          this.replan(task.task_id, 'failed-final', at);
        }
        break;
      case 'do-this-yourself':
        this.createUserStep(task.task_id, { ...step, outcome: { fields: { needed: step.purpose } } }, at);
        break;
      default:
        throw new SpecError(`unknown extension answer ${kind}`);
    }
    if (task.state !== 'awaiting-authority') {
      this.promoteReady(task.task_id, at);
      this.reconcile(task.task_id, at, `extension ${kind}`);
    }
    return req;
  }

  // An extension, a narrowing or a policy flag flip voids every context and
  // every approval token the task has issued; running returns to ready,
  // checking is re-checked, and a bounced user step in progress stands.
  envelopeEdited(taskId, envelope, at, kind = 'extension') {
    const task = this.task(taskId);
    task.envelope_id = envelope.envelope_id;
    task.envelope_version = envelope.version;
    task.validity_to = envelope.validity.to;
    const version = `${envelope.envelope_id}/v${envelope.version}`;
    this.voidAuthority(taskId, at, `envelope ${kind}`);
    for (const s of this.stepsOf(taskId)) {
      if (['closed', 'cancelled'].includes(s.state)) continue;
      if (s.state === 'bounced') continue;
      if (s.runtime.placement_in_window) continue;
      s.envelope_version = version;
      s.runtime.needs_classification = true;
      if (s.state === 'running') this.setStepState(taskId, s, 'ready', at, 'envelope changed; re-issuing');
      if (s.state === 'checking') {
        s.approval_token = null;
        this.setStepState(taskId, s, 'checking', at, 're-checked against the new version');
      }
    }
    if (this.hooks.onReclassify) this.hooks.onReclassify(taskId, envelope, at);
    if (task.state === 'awaiting-authority' && task.renewal_open && envelope.authorised_by) {
      task.renewal_open = false;
      for (const s of this.stepsOf(taskId)) if (s.state === 'cancelled' && s.cancelled.cause === 'lapsed') s.runtime.reissue_on_renewal = true;
      this.transition(taskId, 'authorise', at, { envelope, actor: { kind: 'device', id: envelope.authorised_by.device }, reason: 'renewal approved' });
    } else if (['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) {
      this.setTimer(taskId, 'validity-window', envelope.validity.to, at);
      this.rearmStepTimer(taskId, at);
    }
  }

  flagFlipped(taskId, at, affectedStepIds) {
    this.voidAuthority(taskId, at, 'policy flag flipped');
    for (const s of this.stepsOf(taskId)) {
      if (!affectedStepIds.includes(s.step_id) || ['closed', 'cancelled', 'bounced'].includes(s.state)) continue;
      s.runtime.needs_classification = true;
      if (s.state === 'running') this.setStepState(taskId, s, 'ready', at, 'flag flipped; re-classified before it runs again');
      if (s.state === 'checking') {
        s.approval_token = null;
        this.setStepState(taskId, s, 'checking', at, 're-checked after the flip');
      }
    }
    this.replan(taskId, 'flag-flip-or-narrowing', at);
  }

  delegationEnded(taskId, at, aliases) {
    for (const s of this.stepsOf(taskId)) {
      if (['closed', 'cancelled', 'bounced'].includes(s.state)) continue;
      if (!s.fields.some((a) => aliases.includes(a))) continue;
      if (s.context_id) {
        this.record(taskId, 'context-voided', at, { step_id: s.step_id, context_id: s.context_id, envelope_version: s.envelope_version });
        s.context_id = null;
      }
      if (s.approval_token) {
        this.record(taskId, 'token-voided', at, { step_id: s.step_id, check_id: s.approval_token.check_id, token: s.approval_token.token_id });
        s.approval_token = null;
      }
      s.runtime.needs_classification = true;
      if (s.state === 'running') this.setStepState(taskId, s, 'ready', at, "the dependant's delegation ended; re-classified");
    }
    if (this.hooks.onReclassify) this.hooks.onReclassify(taskId, null, at);
    this.reconcile(taskId, at, 'delegation ended');
  }

  voidAuthority(taskId, at, reason) {
    for (const s of this.stepsOf(taskId)) {
      if (s.context_id) {
        this.record(taskId, 'context-voided', at, { step_id: s.step_id, context_id: s.context_id, envelope_version: s.envelope_version });
        s.context_id = null;
      }
      if (s.approval_token && !s.approval_token.consumed_at) {
        this.record(taskId, 'token-voided', at, { step_id: s.step_id, check_id: s.approval_token.check_id, token: s.approval_token.token_id });
        if (!s.fired_marker) this.releaseReservation(taskId, s);
        s.approval_token = null;
      }
    }
    if (this.hooks.onVoid) this.hooks.onVoid(taskId, reason, at);
  }

  cancelStep(taskId, step, cause, at, supersededBy = null) {
    if (['closed', 'cancelled'].includes(step.state)) return;
    step.cancelled = { cause, at };
    if (step.context_id) {
      this.record(taskId, 'context-voided', at, { step_id: step.step_id, context_id: step.context_id, envelope_version: step.envelope_version });
      step.context_id = null;
    }
    this.clearTimer(taskId, 'check-deadline', step.step_id);
    if (cause === 'superseded' && supersededBy) step.cancelled.superseded_by = supersededBy;
    if (step.approval_token && !step.approval_token.consumed_at) {
      this.record(taskId, 'token-voided', at, { step_id: step.step_id, check_id: step.approval_token.check_id, token: step.approval_token.token_id });
      step.approval_token = null;
    }
    this.setStepState(taskId, step, 'cancelled', at, cause);
  }

  cancelUnfired(taskId, cause, at) {
    for (const s of this.stepsOf(taskId)) {
      if (s.fired_marker) continue;
      if (s.runtime.placement_in_window) continue;
      if (['pending', 'ready', 'running', 'checking', 'bounced'].includes(s.state)) this.cancelStep(taskId, s, cause, at);
    }
  }

  cancelInFlight(taskId, at) {
    for (const s of this.stepsOf(taskId)) {
      if (s.runtime.placement_in_window) continue;
      if (['pending', 'ready', 'running', 'checking', 'bounced'].includes(s.state)) this.cancelStep(taskId, s, 'withdrawn', at);
    }
  }

  // ---- the projection rule of section 5.4 ---------------------------------

  projectState(taskId) {
    const task = this.task(taskId);
    const steps = this.stepsOf(taskId);
    if (steps.some((s) => STEP_LIVE.includes(s.state))) return 'active';
    if (steps.some((s) => s.state === 'bounced') || this.openQuestions(taskId).length || this.openExtensions(taskId).some((x) => x.raised_by.kind !== 'renewal')) return 'awaiting-user';
    if (steps.some((s) => s.state === 'closed' && s.outcome.code === 'blocked-third-party' && s.response_window_until && !s.runtime.window_expired && !s.runtime.party_responded)) return 'awaiting-third-party';
    if (task.renewal_open) return 'awaiting-authority';
    if (steps.every((s) => ['closed', 'cancelled'].includes(s.state))) return 'awaiting-verdict';
    return 'active';
  }

  // Applies the rule as transitions of Table 2.2 and never as a second
  // mechanism; two implied transitions are recorded in order through active.
  reconcile(taskId, at, reason) {
    const task = this.task(taskId);
    const executing = ['active', 'awaiting-user', 'awaiting-third-party'];
    if (!executing.includes(task.state)) return;
    for (let guard = 0; guard < 4; guard++) {
      const want = this.projectState(taskId);
      if (want === task.state) return;
      if (task.state === 'active') {
        if (want === 'awaiting-user') {
          const name = this.stepsOf(taskId).some((s) => s.state === 'bounced') ? 'bounce' : this.openQuestions(taskId).length ? 'ask' : 'request-extension';
          this.transition(taskId, name, at, { reason });
        } else if (want === 'awaiting-third-party') {
          const blocked = this.stepsOf(taskId).find((s) => s.state === 'closed' && s.outcome.code === 'blocked-third-party' && s.response_window_until && !s.runtime.window_expired);
          this.transition(taskId, 'wait', at, { reason, step_id: blocked.step_id });
        } else if (want === 'awaiting-verdict') {
          this.transition(taskId, 'report', at, { reason: 'all steps closed' });
          return;
        } else if (want === 'awaiting-authority') {
          return;
        }
      } else {
        for (const s of this.stepsOf(taskId)) if (s.runtime.party_responded) this.reopenBlocked(taskId, s, at, 'the party had answered while a user step was waiting');
        this.transition(taskId, task.state === 'awaiting-third-party' && reason.startsWith('re-plan') ? 'escalate-resume' : 'resume', at, { reason });
      }
    }
  }

  assertWaitCondition(taskId, stepId) {
    const steps = this.stepsOf(taskId);
    if (steps.some((s) => ['ready', 'running', 'checking', 'bounced'].includes(s.state))) throw new SpecError('wait only when no other step is ready, running, checking or bounced');
    if (this.openQuestions(taskId).length || this.openExtensions(taskId).length) throw new SpecError('wait only when no question or extension request is open');
    if (stepId && !steps.find((s) => s.step_id === stepId && s.outcome && s.outcome.code === 'blocked-third-party')) throw new SpecError('wait needs a step closed blocked-third-party');
  }

  rearmStepTimer(taskId, at) {
    const task = this.task(taskId);
    if (task.state !== 'active') return;
    const due = this.earliestStepDeadline(taskId) || add(at, this.timers.step_deadline_fallback);
    const live = this.timerOfKind(taskId, 'step-deadline');
    if (!live || live.due !== due) this.setTimer(taskId, 'step-deadline', due, at);
  }

  // ---- user steps, questions, messages ------------------------------------

  deviceResponse(taskId, stepId, at, response) {
    const task = this.task(taskId);
    const step = this.step(taskId, stepId);
    if (step.state !== 'bounced') throw new SpecError('only a bounced step closes on the device');
    if (response.device !== task.device_binding) throw new SpecError('a response is validated against the task\'s device binding');
    step.device_response = response;
    const closedBy = { kind: 'device', id: response.device };
    if (response.result === 'done') {
      this.closeStep(taskId, stepId, { code: 'ok', closed_by: closedBy, fields: { reference: response.reference || null, timestamp: at, party: step.party ? step.party.id : 'the device' } }, at);
    } else if (response.result === 'declined') {
      this.closeStep(taskId, stepId, { code: 'blocked-needs-user', closed_by: closedBy, fields: { needed: step.bounce.instruction, why: response.reason || 'declined on the device' } }, at);
    } else if (response.result === 'expired') {
      step.bounce = { ...step.bounce, expires: response.new_expiry || null };
      this.record(taskId, 'step-state', at, { step_id: stepId, from: 'bounced', to: 'bounced', cause: "the institution's expiry passed; re-run with a fresh bounce record" });
    }
    return step;
  }

  askQuestion(taskId, at, { text, predicate, answer_kind, step_blocked = null, choices = [], expires_in = 'P7D' }) {
    const task = this.task(taskId);
    const q = { question_id: this.ids.next('q', 4), task_id: taskId, step_blocked, text, predicate, answer_kind, choices, asked_at: at, expires_at: add(at, expires_in), answer: null };
    this.questions.set(q.question_id, q);
    this.record(taskId, 'question-asked', at, { question_id: q.question_id, step_blocked });
    this.reconcile(taskId, at, `question ${q.question_id}`);
    return q;
  }

  answerQuestion(questionId, at, { value, device, fact_id }) {
    const q = this.questions.get(questionId);
    if (!q || q.answer !== null) throw new SpecError('no open question');
    q.answer = { value, at, device, fact_id };
    this.record(q.task_id, 'question-answered', at, { question_id: questionId, fact_written: fact_id });
    this.promoteReady(q.task_id, at);
    this.reconcile(q.task_id, at, `question ${questionId} answered`);
    return q;
  }

  // A message on the thread that does not resolve the wait resets the nudge
  // schedule; a message referencing a lapsed task revives it; it is never a
  // resume, because resume is only the awaited action itself.
  userMessage(taskId, at, { channel = 'whatsapp' } = {}) {
    const task = this.task(taskId);
    if (task.state === 'lapsed') {
      this.transition(taskId, 'revive', at, { reason: 'a user message references the task', actor: { kind: 'device', id: task.device_binding || 'channel' } });
      return 'revive';
    }
    if (STATE_TIMER[task.state] === 'nudge-schedule') {
      this.record(taskId, 'nudge-reset', at, { channel });
      this.nudgeProgress.set(taskId, { began: at, ordinal: 0 });
      this.setTimer(taskId, 'nudge-schedule', add(at, this.timers.nudge_offsets[0]), at);
      return 'nudge-reset';
    }
    return 'attached';
  }

  // A party responds to a step closed blocked-third-party. While the task is
  // awaiting-third-party the step resumes; while a user step is waiting the
  // response produces nothing, because the task is awaiting-user and the
  // responding step's window was its own timer: the step resumes when the
  // task next returns to active.
  partyResponded(taskId, stepId, at) {
    const task = this.task(taskId);
    const step = this.step(taskId, stepId);
    if (step.state !== 'closed' || step.outcome.code !== 'blocked-third-party') throw new SpecError('only a step blocked on a party is resumed by its response');
    this.clearTimer(taskId, 'response-window');
    if (task.state === 'awaiting-user') {
      step.runtime.party_responded = at;
      step.response_window_until = null;
      return null;
    }
    this.reopenBlocked(taskId, step, at, 'the party answered');
    if (task.state === 'awaiting-third-party') this.transition(taskId, 'resume', at, { reason: 'the party responded' });
    this.rearmStepTimer(taskId, at);
    return step;
  }

  reopenBlocked(taskId, step, at, cause) {
    step.outcome = null;
    step.response_window_until = null;
    step.runtime.window_expired = false;
    step.runtime.party_responded = null;
    step.deadline = add(at, this.entry(step.step_type).deadline_default);
    this.record(taskId, 'step-state', at, { step_id: step.step_id, from: 'closed', to: 'ready', cause });
    step.state = 'ready';
  }

  reportDelivered(taskId, at, receipt) {
    const task = this.task(taskId);
    if (task.state !== 'awaiting-verdict' || !task.report) throw new SpecError('no report awaits delivery');
    if (receipt.device !== task.device_binding) throw new SpecError('the receipt is validated against the binding');
    task.report.delivered_at = at;
    this.nudgeProgress.set(taskId, { began: at, ordinal: 0 });
    this.setTimer(taskId, 'nudge-schedule', add(at, this.timers.nudge_offsets[0]), at);
  }

  verdict(taskId, at, { verdict, device }) {
    const task = this.task(taskId);
    if (device !== task.device_binding) throw new SpecError('a verdict is signed by the bound device');
    const actor = { kind: 'device', id: device };
    if (verdict === 'withdrawn') return this.transition(taskId, 'withdraw', at, { actor, reason: 'withdrawn by me' });
    if (verdict === 'wrong-outcome') return this.transition(taskId, 'redo', at, { actor, reason: 'wrong outcome, needs redoing' });
    return this.transition(taskId, 'verdict', at, { actor, reason: verdict, verdict });
  }

  spawnChild(parentId, at) {
    const parent = this.task(parentId);
    const child = {
      ...parent, task_id: this.ids.next('t', 2), state: 'planning', opened_at: at, plan_id: null, envelope_id: null, envelope_version: null,
      lapsed_from: null, refusal_code: null, verdict: null, parent_task_id: parentId, child_task_id: null, report: null, renewal_open: false,
      committed_spend: { fired: 0, reserved: 0 }, validity_to: null,
    };
    parent.child_task_id = child.task_id;
    this.tasks.set(child.task_id, child);
    this.steps.set(child.task_id, new Map());
    this.setTimer(child.task_id, 'planning-deadline', add(at, this.timers.planning_deadline), at);
    // The same event creates the linked child: recorded on the child too.
    this.record(child.task_id, 'transition', at, { from: 'awaiting-verdict', to: 'planning', transition: 'redo', reason: `linked child of ${parentId}`, timer_set: { kind: 'planning-deadline' } });
    return child;
  }

  suspendBinding(userRef, at) {
    for (const task of this.tasks.values()) {
      if (task.user_ref !== userRef) continue;
      if (['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) {
        this.transition(task.task_id, 'expire-authority', at, { reason: 'the user suspended the bound device' });
        this.raiseRenewal(task.task_id, at);
      }
    }
  }

  // ---- re-planning ---------------------------------------------------------

  replan(taskId, trigger, at) {
    const task = this.task(taskId);
    const plan = this.planner ? this.planner.replan({ task, steps: this.stepsOf(taskId), trigger, at, service: this }) : null;
    if (!plan) {
      if (['failed-final', 'refused-policy'].includes(trigger)) this.cancelUnreachable(taskId, at);
      return null;
    }
    const previous = task.plan_id;
    this.adoptPlan(taskId, { ...plan, trigger, supersedes: previous }, at, { supersedes: previous });
    return plan;
  }

  // ---- the tick -------------------------------------------------------------

  tick(now) {
    const fired = [];
    for (let guard = 0; guard < 10000; guard++) {
      const due = [];
      for (const [taskId, map] of this.timersByTask) for (const t of map.values()) if (ms(t.due) <= ms(now)) due.push([taskId, t]);
      if (due.length === 0) break;
      due.sort((a, b) => ms(a[1].due) - ms(b[1].due) || a[0].localeCompare(b[0]));
      const [taskId, timer] = due[0];
      const at = timer.due;
      const fields = { timer: timer.kind, due: timer.due, supersedes: timer.event_id };
      if (timer.step_id) fields.step_id = timer.step_id;
      this.record(taskId, 'timer-expired', at, fields);
      this.timersByTask.get(taskId).delete(timer.key);
      this.expire(taskId, timer, at);
      fired.push({ taskId, kind: timer.kind, at });
      const again = this.timerOfKind(taskId, timer.kind, timer.step_id);
      if (again && ms(again.due) <= ms(at)) throw new SpecError(`timer ${timer.kind} on ${taskId} re-armed in the past`);
    }
    return fired;
  }

  expire(taskId, timer, at) {
    const task = this.task(taskId);
    switch (timer.kind) {
      case 'planning-deadline': {
        const plan = this.planner ? this.planner.plan({ task, at, service: this, attempt: 'final' }) : null;
        if (plan) {
          this.adoptPlan(taskId, plan, at);
          if (task.state === 'received') this.transition(taskId, 'accept', at, { reason: 'planner produced a plan on the deadline' });
          if (task.state === 'planning') this.transition(taskId, 'propose', at, { reason: 'plan produced on the deadline' });
        } else {
          const due = add(at, this.timers.extend_planning);
          this.record(taskId, 'extend-planning', at, { new_due: due });
          this.setTimer(taskId, 'planning-deadline', due, at);
          this.boardEntry(taskId, 'no-route', 'planning deadline expired and the re-plan produced no route', at);
        }
        break;
      }
      case 'nudge-schedule': {
        const p = this.nudgeProgress.get(taskId) || { began: at, ordinal: 0 };
        if (p.ordinal < this.timers.nudge_offsets.length) {
          p.ordinal += 1;
          this.record(taskId, 'nudge', at, { ordinal: p.ordinal, channel: 'app', device: task.device_binding || 'dev_none' });
          const next = p.ordinal < this.timers.nudge_offsets.length ? add(p.began, this.timers.nudge_offsets[p.ordinal]) : add(p.began, this.timers.lapse_at);
          this.nudgeProgress.set(taskId, p);
          this.setTimer(taskId, 'nudge-schedule', next, at);
        } else {
          this.transition(taskId, 'lapse', at, { reason: p.incident ? `nudge schedule closed early: ${p.incident}` : undefined });
        }
        break;
      }
      case 'validity-window': {
        if (['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) {
          this.transition(taskId, 'expire-authority', at, { reason: 'the validity window ended on the tick' });
          this.raiseRenewal(taskId, at);
        }
        break;
      }
      case 'step-deadline': {
        const step = this.stepsOf(taskId).filter((s) => STEP_LIVE.includes(s.state) && s.deadline && ms(s.deadline) <= ms(at))[0];
        if (!step || step.state === 'checking') {
          if (step) step.deadline = add(at, this.entry(step.step_type).deadline_default);
          this.rearmStepTimer(taskId, at);
          break;
        }
        const entry = this.entry(step.step_type);
        if (entry.on_timeout === 'requeue' && step.state !== 'checking') {
          step.attempts.made += 1;
          if (step.attempts.made >= step.attempts.cap) {
            this.forceClose(taskId, step, { code: 'failed-final', fields: { reason: 'deadline', alternatives_considered: [] } }, at);
          } else {
            if (step.state === 'running') this.record(taskId, 'step-state', at, { step_id: step.step_id, from: 'running', to: 'ready', cause: 'card revoked at the deadline' });
            step.state = 'ready';
            step.context_id = null;
            step.deadline = add(at, entry.deadline_default);
            this.rearmStepTimer(taskId, at);
          }
        } else if (entry.on_timeout === 'escalate') {
          this.forceClose(taskId, step, { code: 'blocked-third-party', fields: { party: step.party ? step.party.id : 'unknown', response_window: entry.response_windows[entry.response_windows.length - 1] || this.timers.escalate_holding_window } }, at);
          this.boardEntry(taskId, 'no-route', `step ${step.step_id} escalated at its deadline`, at);
        } else {
          this.forceClose(taskId, step, { code: 'failed-final', fields: { reason: 'deadline', alternatives_considered: [] } }, at);
        }
        break;
      }
      case 'response-window': {
        for (const s of this.stepsOf(taskId)) {
          if (s.state === 'closed' && s.outcome.code === 'blocked-third-party' && s.response_window_until && ms(s.response_window_until) <= ms(at)) s.runtime.window_expired = true;
        }
        const plan = this.planner ? this.planner.replan({ task, steps: this.stepsOf(taskId), trigger: 'response-window-expired', at, service: this }) : null;
        if (plan) {
          const previous = task.plan_id;
          this.adoptPlanQuiet(taskId, { ...plan, trigger: 'response-window-expired', supersedes: previous }, at, previous);
          this.transition(taskId, 'escalate-resume', at, { reason: 're-plan found a new route' });
          this.promoteReady(taskId, at);
          this.rearmStepTimer(taskId, at);
        } else {
          const due = add(at, this.timers.escalate_holding_window);
          const blocked = this.stepsOf(taskId).find((s) => s.runtime.window_expired);
          this.record(taskId, 'extend-window', at, { new_due: due, party: blocked && blocked.party ? blocked.party.id : 'party_unknown' });
          if (blocked) {
            blocked.response_window_until = due;
            blocked.runtime.window_expired = false;
          }
          this.setTimer(taskId, 'response-window', due, at);
          this.boardEntry(taskId, 'no-route', 'response window expired and the re-plan produced no route', at);
        }
        break;
      }
      case 'check-deadline': {
        const step = this.stepsOf(taskId).find((s) => s.state === 'checking');
        if (step) this.boardEntry(taskId, 'check-pending', `check ${step.check.check_id} on ${step.step_id} passed its deadline; the act does not fire`, at);
        break;
      }
      case 'delegation-validity':
        this.delegationEnded(taskId, at, timer.aliases || []);
        break;
      default:
        throw new SpecError(`no expiry rule for ${timer.kind}`);
    }
  }

  adoptPlanQuiet(taskId, plan, at, previous) {
    const task = this.task(taskId);
    const saved = task.state;
    task.state = 'active';
    this.adoptPlan(taskId, plan, at, { supersedes: previous });
    task.state = saved;
  }

  forceClose(taskId, step, outcome, at) {
    this.clearTimer(taskId, 'check-deadline', step.step_id);
    if (step.state === 'running' || step.state === 'checking') {
      if (step.approval_token && !step.approval_token.consumed_at) {
        this.record(taskId, 'token-voided', at, { step_id: step.step_id, check_id: step.approval_token.check_id, token: step.approval_token.token_id });
        step.approval_token = null;
      }
      step.state = 'ready';
    }
    return this.closeStep(taskId, step.step_id, { ...outcome, closed_by: { kind: 'task-service', id: 'task-service' } }, at);
  }

  // ---- the watchdog and the board ------------------------------------------

  boardEntry(taskId, column, condition, at) {
    const key = `${taskId}:${column}`;
    if (this.board.has(key)) return this.board.get(key);
    const card = { task_id: taskId, column, condition, since: at, owner: null };
    this.board.set(key, card);
    this.record(taskId, 'board-entry', at, { column, condition });
    return card;
  }

  clearBoard(taskId, column) {
    this.board.delete(`${taskId}:${column}`);
  }

  watchdog(now) {
    const cycle = this.timers.watchdog_cycle;
    const raised = [];
    for (const task of this.tasks.values()) {
      const id = task.task_id;
      if (isTerminal(task.state)) {
        for (const col of ['no-live-timer', 'check-pending', 'no-route', 'nudges-exhausted']) this.clearBoard(id, col);
        continue;
      }
      const timer = this.liveTimer(id);
      if (!timer || ms(timer.due) <= ms(now)) raised.push(this.boardEntry(id, 'no-live-timer', timer ? 'the live timer is not future-dated' : 'no live timer', now));
      else this.clearBoard(id, 'no-live-timer');
      for (const s of this.stepsOf(id)) {
        if (s.state === 'checking' && (!s.check || !s.check.checker || ms(s.check.deadline) <= ms(now))) raised.push(this.boardEntry(id, 'check-pending', `step ${s.step_id} in checking has no checker or its deadline passed`, now));
      }
      const expiries = this.eventsOf(id, 'timer-expired').filter((e) => ['response-window', 'planning-deadline'].includes(e.timer) && ms(e.at) <= ms(now));
      for (const e of expiries) {
        const followed = this.events.some((f) => f.task_id === id && ms(f.at) >= ms(e.at) && ms(f.at) <= ms(addMs(e.at, cycleMs(cycle))) && ((f.kind === 'transition' && ['resume', 'escalate-resume', 'propose', 'accept'].includes(f.transition)) || ['extend-window', 'extend-planning'].includes(f.kind)));
        if (!followed && ms(now) >= ms(addMs(e.at, cycleMs(cycle)))) raised.push(this.boardEntry(id, 'no-route', `${e.timer} expired at ${e.at} with no resume, escalate-resume, extend-window or extend-planning within one cycle`, now));
      }
      const p = this.nudgeProgress.get(id);
      if (p && STATE_TIMER[task.state] === 'nudge-schedule' && p.ordinal >= this.timers.nudge_offsets.length) {
        const lapseDue = add(p.began, this.timers.lapse_at);
        if (ms(now) >= ms(addMs(lapseDue, cycleMs(cycle))) && task.state !== 'lapsed') raised.push(this.boardEntry(id, 'nudges-exhausted', 'nudge schedule exhausted without a lapse event within one cycle', now));
      }
      if (['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) {
        const want = this.projectState(id);
        if (want !== task.state && !(want === 'awaiting-verdict' && task.state === 'active')) raised.push(this.boardEntry(id, 'no-live-timer', `state ${task.state} disagrees with the projection rule (${want})`, now));
      }
      for (const [key, card] of this.board) {
        if (!key.startsWith(`${id}:`) || card.owner) continue;
        const limit = this.timers.column_limit[card.column] || this.timers.column_limit.default;
        if (ms(now) >= ms(add(card.since, limit)) && !card.escalated) {
          card.escalated = now;
          this.record(id, 'board-entry', now, { column: card.column, condition: `unowned past the column limit; escalated to the shift lead` });
        }
      }
    }
    return raised;
  }

  boardAction(taskId, at, { actor, action, column, ...payload }) {
    if (!actor || actor.kind !== 'person' || !actor.id || !['shift-lead', 'escalation-desk'].includes(actor.role)) throw new SpecError('a board action is a person with a staff id and a role');
    if (!BOARD_ACTIONS.includes(action)) throw new SpecError(`no board action "${action}"; there is no dismiss`);
    const task = this.task(taskId);
    const card = this.board.get(`${taskId}:${column}`);
    if (!card) throw new SpecError('no card in that column');
    switch (action) {
      case 'set-timer': {
        if (payload.kind !== STATE_TIMER[task.state]) throw new SpecError(`a timer of the right kind for ${task.state} is ${STATE_TIMER[task.state]}`);
        if (ms(payload.due) <= ms(at)) throw new SpecError('the board will not accept a timer in the past');
        this.setTimer(taskId, payload.kind, payload.due, at);
        if (payload.kind === 'nudge-schedule') this.nudgeProgress.set(taskId, { began: at, ordinal: 0 });
        this.clearBoard(taskId, column);
        break;
      }
      case 'reassign-check': {
        const step = this.step(taskId, payload.step_id);
        if (step.state !== 'checking') throw new SpecError('only a checking step is reassigned');
        step.check.checker = payload.checker;
        step.check.deadline = add(at, this.timers.check_deadline[step.check.checker_kind]);
        this.record(taskId, 'check-requested', at, { step_id: step.step_id, check_id: step.check.check_id, checker: payload.checker });
        this.clearBoard(taskId, column);
        this.rearmStepTimer(taskId, at);
        break;
      }
      case 'withdraw-prepared-act': {
        const step = this.step(taskId, payload.step_id);
        if (step.state !== 'checking') throw new SpecError('only a checking step is withdrawn');
        this.setStepState(taskId, step, 'ready', at, 'prepared act withdrawn from the board');
        this.clearBoard(taskId, column);
        this.rearmStepTimer(taskId, at);
        break;
      }
      case 'extend-window': {
        if (ms(payload.new_due) <= ms(at)) throw new SpecError('the date the party gave is in the past');
        const blocked = this.stepsOf(taskId).find((s) => s.state === 'closed' && s.outcome.code === 'blocked-third-party');
        this.record(taskId, 'extend-window', at, { new_due: payload.new_due, party: blocked && blocked.party ? blocked.party.id : 'party_unknown' });
        if (blocked) blocked.response_window_until = payload.new_due;
        this.setTimer(taskId, 'response-window', payload.new_due, at);
        this.clearBoard(taskId, column);
        break;
      }
      case 'resume':
      case 'escalate-resume': {
        const blocked = this.stepsOf(taskId).find((s) => s.state === 'closed' && s.outcome.code === 'blocked-third-party');
        if (!blocked) throw new SpecError('nothing is blocked on a party');
        this.clearTimer(taskId, 'response-window');
        this.reopenBlocked(taskId, blocked, at, action === 'resume' ? 'the party answered' : 'a re-plan found a route');
        this.transition(taskId, action, at, { actor, reason: action === 'resume' ? 'the party responded' : 'a route was found' });
        this.clearBoard(taskId, column);
        this.rearmStepTimer(taskId, at);
        break;
      }
      case 'add-alternative': {
        this.record(taskId, 'catalogue-request', at, { step_type: payload.step_type, market: task.market });
        const plan = this.replan(taskId, 'response-window-expired', at);
        if (plan && task.state === 'awaiting-third-party') this.transition(taskId, 'escalate-resume', at, { actor, reason: 'an alternative route was added' });
        if (plan) this.clearBoard(taskId, column);
        break;
      }
      case 'close-nudge-schedule': {
        if (!payload.incident_id) throw new SpecError('closing the nudge schedule early needs an incident');
        if (STATE_TIMER[task.state] !== 'nudge-schedule') throw new SpecError('the task is not on a nudge schedule');
        const p = this.nudgeProgress.get(taskId) || { began: at, ordinal: 0 };
        p.ordinal = this.timers.nudge_offsets.length;
        p.incident = payload.incident_id;
        this.nudgeProgress.set(taskId, p);
        this.setTimer(taskId, 'nudge-schedule', addMs(at, 1000), at);
        this.clearBoard(taskId, column);
        break;
      }
      default:
        throw new SpecError(`board action ${action} is not implemented`);
    }
    return this.record(taskId, 'board-action', at, { column, action }, actor);
  }

  // ---- checks the tests and the watchdog share -----------------------------

  invariantViolations(now) {
    const out = [];
    for (const task of this.tasks.values()) {
      if (!STATES.includes(task.state)) out.push(`${task.task_id}: state ${task.state} is not named`);
      const timer = this.liveTimer(task.task_id);
      if (!isTerminal(task.state) && (!timer || ms(timer.due) <= ms(now))) out.push(`${task.task_id}: live state ${task.state} without a future timer`);
      if (isTerminal(task.state)) {
        const last = this.eventsOf(task.task_id, 'transition').filter((e) => e.to === task.state).pop();
        if (!last) out.push(`${task.task_id}: terminal state ${task.state} without a transition`);
      }
      const transitions = this.eventsOf(task.task_id, 'transition');
      for (let i = 1; i < transitions.length; i++) {
        if (transitions[i].from !== transitions[i - 1].to) out.push(`${task.task_id}: transition ${transitions[i].transition} from ${transitions[i].from} after ${transitions[i - 1].to}`);
      }
    }
    return out;
  }
}

function cycleMs(duration) {
  return parseDuration(duration);
}

function timerKey(kind, stepId) {
  return stepId ? `${kind}:${stepId}` : kind;
}
