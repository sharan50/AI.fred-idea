import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TaskService, TRANSITION_TABLE, STATE_TIMER, INVARIANT, allowedTransition, SpecError, DEFAULT_TIMERS } from '../lib/state-machine.mjs';
import { STATES, LIVE_STATES, TERMINAL_STATES, TRANSITIONS } from '../lib/vocab.mjs';
import { loadGraph } from '../vocab/derive.mjs';
import { add, addMs, ms } from '../lib/time.mjs';
import { registry, fixture, clone, rng } from './helpers.mjs';

const T0 = '2026-09-02T14:31:08+05:30';
const at = (minutes) => addMs(T0, minutes * 60000);
const DEV = 'dev_12a';
const PERSON = { kind: 'person', id: 'w_0x', role: 'shift-lead' };

function planner(overrides = {}) {
  const calls = [];
  return {
    calls,
    plan: () => null,
    replan: (ctx) => {
      calls.push(ctx.trigger);
      return overrides.replan ? overrides.replan(ctx) : null;
    },
    ...overrides,
  };
}

// Task 12 up to the user's one tap.
function world(opts = {}) {
  const svc = new TaskService({ catalogue: fixture('catalogue.json'), planner: opts.planner || planner(), hooks: opts.hooks || {} });
  const task = svc.open(fixture('task-12/request.json'), { task_type: 'IN/health/book-appointment' });
  svc.transition(task.task_id, 'accept', at(0), { reason: 'well formed, market served' });
  svc.adoptPlan(task.task_id, clone(fixture('task-12/plan-p12-1.json')), at(2));
  svc.transition(task.task_id, 'propose', at(3), { reason: 'plan and envelope proposal sent' });
  return { svc, task, id: task.task_id };
}

function authorised(opts) {
  const w = world(opts);
  const env = fixture('task-12/envelope-v2.json');
  w.svc.transition(w.id, 'authorise', at(4), { envelope: env, actor: { kind: 'device', id: DEV }, reason: 'confirmed on the bound device' });
  return w;
}

function ok(party = 'Max Healthcare') {
  return { code: 'ok', closed_by: { kind: 'harness', id: 'ai-executor' }, fields: { timestamp: at(10), party } };
}

function checkAll(svc, now) {
  const v = svc.invariantViolations(now);
  assert.deepEqual(v, [], v.join('\n'));
  for (const ev of svc.events) {
    const r = registry.validate('aifred:event', ev);
    assert.ok(r.ok, `event ${ev.event_id} (${ev.kind}): ${JSON.stringify(r.errors)}`);
  }
}

function transitionsOf(svc, id) {
  return svc.eventsOf(id, 'transition').map((e) => e.transition);
}

test('Table 2.2 is the whole set of transitions: eighteen names, every row recorded, nothing else', () => {
  assert.deepEqual([...new Set(TRANSITION_TABLE.map((r) => r.name))].sort(), [...TRANSITIONS].sort());
  for (const from of STATES) {
    for (const name of TRANSITIONS) {
      const row = TRANSITION_TABLE.find((r) => r.name === name && r.from.includes(from));
      assert.equal(allowedTransition(from, name), row ? row.to : null);
    }
    for (const name of TRANSITIONS) if (TERMINAL_STATES.includes(from) && from !== 'lapsed') assert.equal(allowedTransition(from, name), null, `${from} has no way out`);
  }
  assert.equal(allowedTransition('lapsed', 'revive'), 'planning', 'the one legal outbound transition from lapsed');
  assert.throws(() => allowedTransition('active', 'forget'), SpecError);
  for (const s of LIVE_STATES) assert.ok(STATE_TIMER[s], `${s} carries a timer`);
  for (const s of TERMINAL_STATES) assert.equal(STATE_TIMER[s], undefined);
});

test('the invariant text is byte-identical to the map\'s verbatim node, which the map checks against 02 and the console', () => {
  const node = loadGraph().nodes.find((n) => n.id === 'inv-state-machine-invariant');
  assert.equal(INVARIANT, node.text);
});

test('task 12 end to end: every change of state is a recorded transition and every live state has a timer', () => {
  const { svc, id } = authorised();
  assert.equal(svc.task(id).state, 'active');
  assert.equal(svc.step(id, 's_02').state, 'ready');
  assert.equal(svc.step(id, 's_02').envelope_version, 'env_12/v2', 'steps are stamped with the version they were classified against');
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', ok(), at(10));
  assert.equal(svc.step(id, 's_03').state, 'ready');
  svc.claim(id, 's_03', at(11));
  svc.closeStep(id, 's_03', clone(fixture('task-12/outcome-s03.json')), at(41));
  assert.equal(svc.step(id, 's_04').state, 'ready');
  assert.equal(svc.step(id, 's_05').state, 'bounced');
  assert.equal(svc.task(id).state, 'active', 'a ready step keeps the task active whatever else waits');
  svc.claim(id, 's_04', at(42));
  svc.closeStep(id, 's_04', ok(), at(50));
  assert.equal(svc.step(id, 's_06').state, 'ready');
  assert.equal(svc.task(id).state, 'active');
  svc.claim(id, 's_06', at(51));
  svc.closeStep(id, 's_06', ok('the connected calendar'), at(55));
  assert.equal(svc.task(id).state, 'awaiting-user', 'only the user step is left');
  assert.equal(svc.liveTimer(id).kind, 'nudge-schedule');
  svc.deviceResponse(id, 's_05', at(60), { result: 'done', reference: null, at: at(60), device: DEV, signature: 'c2ln' });
  assert.equal(svc.task(id).state, 'awaiting-verdict');
  assert.ok(svc.task(id).report, 'the outcome report exists with one version');
  svc.reportDelivered(id, at(66), { device: DEV });
  svc.verdict(id, at(70), { verdict: 'done-satisfied', device: DEV });
  assert.equal(svc.task(id).state, 'closed');
  assert.equal(svc.task(id).verdict, 'done-satisfied');
  assert.deepEqual(transitionsOf(svc, id), ['accept', 'propose', 'authorise', 'bounce', 'resume', 'report', 'verdict']);
  assert.equal(svc.liveTimer(id), null, 'a terminal state carries no timer');
  checkAll(svc, at(71));
  const r = registry.validate('aifred:task', svc.task(id));
  assert.ok(r.ok, JSON.stringify(r.errors));
});

test('the report transition event has the shape the page prints for e_000412', () => {
  const printed = fixture('task-12/event-e000412.json');
  const { svc, id } = authorised();
  for (const s of ['s_02', 's_03', 's_04']) {
    svc.claim(id, s, at(5));
    svc.closeStep(id, s, ok(), at(6));
  }
  svc.deviceResponse(id, 's_05', at(7), { result: 'done', at: at(7), device: DEV, signature: 'c2ln' });
  svc.claim(id, 's_06', at(8));
  svc.closeStep(id, 's_06', ok(), at(9));
  const report = svc.eventsOf(id, 'transition').find((e) => e.transition === 'report');
  assert.deepEqual(Object.keys(report).sort(), Object.keys(printed).sort());
  assert.equal(report.from, 'active');
  assert.equal(report.to, 'awaiting-verdict');
  assert.equal(report.reason, 'all steps closed');
  assert.equal(report.timer_set.kind, 'nudge-schedule');
  assert.equal(report.timer_set.task_type, 'IN/health/book-appointment');
});

test('refuse needs a reason code from the list and only before any step executes', () => {
  const svc = new TaskService({ catalogue: fixture('catalogue.json') });
  const t = svc.open(fixture('task-12/request.json'), { task_type: 'IN/health/book-appointment' });
  assert.throws(() => svc.transition(t.task_id, 'refuse', at(1), {}), /reason code/);
  assert.throws(() => svc.transition(t.task_id, 'refuse', at(1), { reason_code: 'because' }), /reason code/);
  svc.transition(t.task_id, 'refuse', at(1), { reason_code: 'refused-advice' });
  assert.equal(svc.task(t.task_id).state, 'refused');
  assert.equal(svc.task(t.task_id).refusal_code, 'refused-advice');
  const { svc: s2, id } = authorised();
  s2.claim(id, 's_02', at(5));
  assert.throws(() => s2.transition(id, 'refuse', at(6), { reason_code: 'refused-advice' }), /no transition/);
});

test('silence from the user: three nudges, then lapse, recording the state lapsed from; revive goes to planning', () => {
  const { svc, id } = world();
  assert.equal(svc.task(id).state, 'awaiting-authority');
  svc.tick(add(at(3), 'PT4H'));
  svc.tick(add(at(3), 'P1D'));
  svc.tick(add(at(3), 'P3D'));
  const nudges = svc.eventsOf(id, 'nudge');
  assert.deepEqual(nudges.map((n) => n.ordinal), [1, 2, 3]);
  assert.equal(svc.task(id).state, 'awaiting-authority');
  svc.tick(add(at(3), 'P6DT23H'));
  assert.equal(svc.task(id).state, 'awaiting-authority', 'not yet');
  svc.tick(add(at(3), 'P7D'));
  assert.equal(svc.task(id).state, 'lapsed');
  assert.equal(svc.task(id).lapsed_from, 'awaiting-authority');
  assert.ok(svc.stepsOf(id).every((s) => s.state === 'cancelled' && s.cancelled.cause === 'lapsed'), 'every step not yet fired is cancelled, cause lapsed');
  assert.equal(svc.liveTimer(id), null);
  assert.throws(() => svc.transition(id, 'authorise', add(at(3), 'P8D'), { envelope: fixture('task-12/envelope-v2.json') }), /no transition/);
  assert.equal(svc.userMessage(id, add(at(3), 'P8D')), 'revive');
  assert.equal(svc.task(id).state, 'planning');
  assert.equal(svc.liveTimer(id).kind, 'planning-deadline');
  checkAll(svc, add(at(3), 'P8DT1M'));
});

test('a user message that does not resolve the wait resets the nudge schedule and is never a resume', () => {
  const { svc, id } = world();
  svc.tick(add(at(3), 'PT4H'));
  assert.equal(svc.eventsOf(id, 'nudge').length, 1);
  const reset = svc.userMessage(id, add(at(3), 'PT5H'));
  assert.equal(reset, 'nudge-reset');
  svc.tick(add(at(3), 'PT8H'));
  assert.equal(svc.eventsOf(id, 'nudge').length, 1, 'the schedule restarted from the message');
  svc.tick(add(at(3), 'PT9H'));
  assert.equal(svc.eventsOf(id, 'nudge').length, 2);
  assert.equal(svc.task(id).state, 'awaiting-authority');
  assert.ok(!transitionsOf(svc, id).includes('resume'));
});

test('the validity window ends on the tick: unfired steps cancel, expire-authority, a renewal re-issues them', () => {
  const { svc, id } = world();
  const end = at(20);
  svc.transition(id, 'authorise', at(4), { envelope: { ...fixture('task-12/envelope-v2.json'), validity: { from: at(4), to: end } }, actor: { kind: 'device', id: DEV } });
  svc.claim(id, 's_02', at(5));
  svc.tick(end);
  assert.equal(svc.task(id).state, 'awaiting-authority');
  assert.equal(svc.task(id).renewal_open, true);
  const s02 = svc.step(id, 's_02');
  assert.equal(s02.state, 'cancelled');
  assert.equal(s02.cancelled.cause, 'lapsed');
  assert.equal(s02.context_id, null, 'every signed step context died with the window');
  assert.ok(svc.eventsOf(id, 'context-voided').length >= 1);
  assert.throws(() => svc.claim(id, 's_02', end), /claimed only while the task is active|only a ready step/);
  const renewal = svc.openExtensions(id).find((x) => x.raised_by.kind === 'renewal');
  assert.ok(renewal, 'a one-tap request to renew the window stands');
  assert.equal(svc.liveTimer(id).kind, 'nudge-schedule');
  const v3 = { ...clone(fixture('task-12/envelope-v2.json')), version: 3, validity: { from: end, to: add(end, 'P7D') }, authorised_by: { device: DEV, at: end }, edits: [{ version: 3, change: 'renewed the validity window', at: end, kind: 'renewal', scope: 'task' }] };
  svc.answerExtension(renewal.reference, addMs(end, 60000), { kind: 'approve', device: DEV, envelope: v3 });
  assert.equal(svc.task(id).state, 'active');
  assert.equal(svc.task(id).envelope_version, 3);
  assert.equal(svc.step(id, 's_02').state, 'ready', 'the renewal re-issued the cancelled step');
  assert.equal(svc.step(id, 's_02').envelope_version, 'env_12/v3');
  assert.deepEqual(transitionsOf(svc, id).slice(-2), ['expire-authority', 'authorise']);
  checkAll(svc, addMs(end, 120000));
});

test('withdraw from any live state cancels what is in flight and keeps a fired act on the record', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', ok(), at(6));
  svc.claim(id, 's_03', at(7));
  svc.verdict(id, at(8), { verdict: 'withdrawn', device: DEV });
  assert.equal(svc.task(id).state, 'closed');
  assert.equal(svc.task(id).verdict, 'withdrawn');
  assert.equal(svc.step(id, 's_03').cancelled.cause, 'withdrawn');
  assert.equal(svc.step(id, 's_04').cancelled.cause, 'withdrawn');
  assert.equal(svc.step(id, 's_02').state, 'closed', 'a closed step stays closed');
  assert.equal(svc.liveTimer(id), null);
  for (const from of ['received', 'planning', 'awaiting-authority', 'awaiting-user', 'awaiting-third-party', 'awaiting-verdict']) {
    assert.equal(allowedTransition(from, 'withdraw'), 'closed', from);
  }
  checkAll(svc, at(9));
});

test('blocked-third-party: the window is chosen from the catalogue, wait only when nothing else is open, expiry with no route holds and boards', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', ok(), at(6));
  svc.claim(id, 's_03', at(7));
  assert.throws(() => svc.closeStep(id, 's_03', { code: 'blocked-third-party', closed_by: { kind: 'worker', id: 'w_1', pool: 'L1' }, fields: { party: 'Max Healthcare', response_window: 'PT7H' } }, at(8)), /allowed windows/);
  svc.closeStep(id, 's_03', { code: 'blocked-third-party', closed_by: { kind: 'worker', id: 'w_1', pool: 'L1' }, fields: { party: 'Max Healthcare', response_window: 'PT4H' } }, at(8));
  assert.equal(svc.task(id).state, 'awaiting-third-party');
  assert.equal(svc.liveTimer(id).kind, 'response-window');
  assert.equal(svc.liveTimer(id).due, add(at(8), 'PT4H'));
  svc.tick(add(at(8), 'PT4H'));
  assert.equal(svc.task(id).state, 'awaiting-third-party', 'no route: the task keeps its state on a holding window');
  assert.equal(svc.eventsOf(id, 'extend-window').length, 1);
  assert.ok(svc.board.get(`${id}:no-route`), 'and enters the board\'s no-route column');
  assert.ok(svc.liveTimer(id) && ms(svc.liveTimer(id).due) > ms(add(at(8), 'PT4H')), 'with a live timer');
  svc.boardAction(id, add(at(8), 'PT5H'), { actor: { kind: 'person', id: 'w_9', role: 'escalation-desk' }, action: 'resume', column: 'no-route' });
  assert.equal(svc.task(id).state, 'active');
  assert.equal(svc.step(id, 's_03').state, 'ready');
  assert.ok(!svc.board.get(`${id}:no-route`));
  checkAll(svc, add(at(8), 'PT5H1M'));
});

test('two implied transitions are recorded in order through active: resume then wait on the same tick', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', ok(), at(6));
  svc.claim(id, 's_03', at(7));
  const q0 = svc.askQuestion(id, at(8), { text: 'Which week?', predicate: 'preferred-week', answer_kind: 'choice', choices: ['next week', 'the week after'] });
  assert.equal(svc.task(id).state, 'active', 'a running step keeps the task active; the question waits beside it');
  svc.answerQuestion(q0.question_id, at(9), { value: 'next week', device: DEV, fact_id: 'f_0300' });
  svc.closeStep(id, 's_03', { code: 'blocked-third-party', closed_by: { kind: 'worker', id: 'w_1', pool: 'L1' }, fields: { party: 'Max Healthcare', response_window: 'P2D' } }, at(10));
  assert.equal(svc.task(id).state, 'awaiting-third-party');
  const q = svc.askQuestion(id, at(11), { text: 'Morning or afternoon?', predicate: 'preferred-time', answer_kind: 'choice', choices: ['morning', 'afternoon'] });
  assert.equal(svc.task(id).state, 'awaiting-user', 'the window runs as the step\'s own timer while the user is awaited');
  svc.answerQuestion(q.question_id, at(20), { value: 'morning', device: DEV, fact_id: 'f_0301' });
  const tail = svc.eventsOf(id, 'transition').slice(-2);
  assert.deepEqual(tail.map((e) => e.transition), ['resume', 'wait']);
  assert.equal(tail[0].at, tail[1].at);
  assert.equal(svc.task(id).state, 'awaiting-third-party');
  checkAll(svc, at(21));
});

test('a party responding while a user step is waiting produces no transition', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', ok(), at(6));
  svc.claim(id, 's_03', at(7));
  svc.closeStep(id, 's_03', { code: 'blocked-third-party', closed_by: { kind: 'worker', id: 'w_1', pool: 'L1' }, fields: { party: 'Max Healthcare', response_window: 'P2D' } }, at(8));
  assert.equal(svc.task(id).state, 'awaiting-third-party');
  svc.askQuestion(id, at(9), { text: 'Morning or afternoon?', predicate: 'preferred-time', answer_kind: 'choice', choices: ['morning', 'afternoon'] });
  assert.deepEqual(transitionsOf(svc, id).slice(-2), ['resume', 'ask'], 'no transition runs directly between the two waiting states');
  const before = svc.events.length;
  assert.equal(svc.partyResponded(id, 's_03', at(10)), null);
  assert.equal(svc.task(id).state, 'awaiting-user');
  assert.equal(svc.eventsOf(id, 'transition').length, transitionsOf(svc, id).length);
  assert.equal(svc.events.length, before);
});

test('failed-retryable re-queues on the same route up to the cap, then failed-final re-plans', () => {
  const p = planner();
  const { svc, id } = authorised({ planner: p });
  svc.claim(id, 's_02', at(5));
  const retry = { code: 'failed-retryable', closed_by: { kind: 'harness', id: 'ai-executor' }, fields: { error_class: 'timeout' } };
  svc.closeStep(id, 's_02', retry, at(6));
  const s = svc.step(id, 's_02');
  assert.equal(s.state, 'ready');
  assert.equal(s.attempts.made, 1);
  assert.ok(s.retry_token, 'a retry token for the re-placement');
  assert.equal(s.deadline, add(at(6), 'PT30M'), 'a fresh deadline');
  svc.claim(id, 's_02', at(7));
  svc.closeStep(id, 's_02', retry, at(8));
  assert.equal(svc.step(id, 's_02').state, 'closed');
  assert.equal(svc.step(id, 's_02').outcome.code, 'failed-final');
  assert.deepEqual(p.calls, ['failed-final']);
});

test('a fired marker: no committing action without a token, a token is single-use, and never failed-retryable after', () => {
  const svc = new TaskService({ catalogue: fixture('catalogue.json'), planner: planner() });
  const t = svc.open(fixture('task-12/request.json'), { task_type: 'IN/banking/account-opening' });
  const plan = clone(fixture('task-12/plan-p12-1.json'));
  plan.steps = [{ ...plan.steps[0], step_id: 's_01', step_type: 'IN/banking/submit-account-opening-form', template: 'IN/banking/submit-account-opening-form@v2', act: 'submit-application', reversibility: 'irreversible', route: 'dual-control', party: { id: 'party_hdfc-bank' }, after: [] }];
  svc.transition(t.task_id, 'accept', at(0), {});
  svc.adoptPlan(t.task_id, plan, at(1));
  svc.transition(t.task_id, 'propose', at(2), {});
  const env = { ...clone(fixture('task-12/envelope-v2.json')), committable_acts: [{ act: 'submit-application', scope: 'task' }], contactable_parties: [{ party: 'party_hdfc-bank', scope: 'task' }] };
  svc.transition(t.task_id, 'authorise', at(3), { envelope: env });
  const id = t.task_id;
  svc.claim(id, 's_01', at(4));
  assert.throws(() => svc.writeFiredMarker(id, 's_01', at(5), 'form-submit', 'browser-controller'), /no committing action without an approval token/);
  svc.prepareAct(id, 's_01', at(5), { checker: null });
  assert.equal(svc.step(id, 's_01').state, 'checking');
  assert.equal(svc.liveTimer(id).kind, 'check-deadline');
  assert.throws(() => svc.decideCheck(id, 's_01', at(6), { decision: 'approve', checker: { kind: 'harness', id: 'ai-checker' } }), /this check is the worker's/);
  svc.decideCheck(id, 's_01', at(6), { decision: 'approve', checker: { kind: 'worker', id: 'w_l3', pool: 'L3' } });
  assert.equal(svc.step(id, 's_01').state, 'running');
  const marker = svc.writeFiredMarker(id, 's_01', at(7), 'form-submit', 'browser-controller');
  assert.equal(marker.action, 'form-submit');
  assert.throws(() => svc.writeFiredMarker(id, 's_01', at(8), 'form-submit', 'browser-controller'), /consumed token/);
  assert.throws(() => svc.closeStep(id, 's_01', { code: 'failed-retryable', closed_by: { kind: 'harness', id: 'x' }, fields: { error_class: 'timeout' } }, at(9)), /never closes failed-retryable/);
  svc.closeStep(id, 's_01', { code: 'failed-final', closed_by: { kind: 'harness', id: 'x' }, fields: { reason: 'submit timed out after the marker', alternatives_considered: [] } }, at(9));
  assert.ok(svc.step(id, 's_01').outcome.fired_marker, 'the marker is the evidence');
  checkAll(svc, at(10));
});

test('a check that passes its deadline goes to the board and the act does not fire; a person reassigns it', () => {
  const svc = new TaskService({ catalogue: fixture('catalogue.json'), planner: planner() });
  const t = svc.open(fixture('task-12/request.json'), { task_type: 'IN/banking/account-opening' });
  const plan = clone(fixture('task-12/plan-p12-1.json'));
  plan.steps = [{ ...plan.steps[0], step_id: 's_01', step_type: 'IN/banking/submit-account-opening-form', template: 'IN/banking/submit-account-opening-form@v2', act: 'submit-application', reversibility: 'irreversible', route: 'dual-control', party: { id: 'party_hdfc-bank' }, after: [] }];
  svc.transition(t.task_id, 'accept', at(0), {});
  svc.adoptPlan(t.task_id, plan, at(1));
  svc.transition(t.task_id, 'propose', at(2), {});
  svc.transition(t.task_id, 'authorise', at(3), { envelope: { ...clone(fixture('task-12/envelope-v2.json')), committable_acts: [{ act: 'submit-application', scope: 'task' }], contactable_parties: [{ party: 'party_hdfc-bank', scope: 'task' }] } });
  const id = t.task_id;
  svc.claim(id, 's_01', at(4));
  svc.prepareAct(id, 's_01', at(5), { checker: null });
  svc.tick(at(36));
  assert.equal(svc.step(id, 's_01').state, 'checking', 'the act never fires while the card is on the board');
  assert.ok(svc.board.get(`${id}:check-pending`));
  svc.watchdog(at(37));
  assert.ok(svc.board.get(`${id}:check-pending`));
  assert.throws(() => svc.boardAction(id, at(38), { actor: { kind: 'system', id: 'task-service' }, action: 'reassign-check', column: 'check-pending', step_id: 's_01', checker: { kind: 'worker', id: 'w_l3b', pool: 'L3' } }), /person/);
  svc.boardAction(id, at(38), { actor: PERSON, action: 'reassign-check', column: 'check-pending', step_id: 's_01', checker: { kind: 'worker', id: 'w_l3b', pool: 'L3' } });
  assert.ok(!svc.board.get(`${id}:check-pending`));
  assert.equal(svc.step(id, 's_01').check.checker.id, 'w_l3b');
  svc.decideCheck(id, 's_01', at(39), { decision: 'decline', reason: 'the route is wrong', routeWrong: true });
  assert.equal(svc.step(id, 's_01').state, 'ready');
  checkAll(svc, at(40));
});

test('an envelope edit voids every context and token: running returns to ready, checking is re-checked, a bounced step stands', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', ok(), at(6));
  svc.claim(id, 's_03', at(7));
  svc.closeStep(id, 's_03', ok(), at(8));
  svc.claim(id, 's_04', at(9));
  assert.equal(svc.step(id, 's_05').state, 'bounced');
  const v3 = { ...clone(fixture('task-12/envelope-v2.json')), version: 3, edits: [{ version: 3, change: 'narrowed: removed cancel', at: at(10), kind: 'narrowing', scope: 'task' }], committable_acts: [{ act: 'schedule', scope: 'task' }] };
  svc.envelopeEdited(id, v3, at(10), 'narrowing');
  assert.equal(svc.step(id, 's_04').state, 'ready');
  assert.equal(svc.step(id, 's_04').context_id, null);
  assert.equal(svc.step(id, 's_04').envelope_version, 'env_12/v3');
  assert.equal(svc.step(id, 's_05').state, 'bounced', 'a bounced user step in progress is not re-classified');
  assert.equal(svc.step(id, 's_05').envelope_version, 'env_12/v2');
  assert.equal(svc.eventsOf(id, 'context-voided').length, 1);
  assert.equal(svc.task(id).state, 'active');
  checkAll(svc, at(11));
});

test('a step deadline applies the step type\'s on_timeout: requeue counts the attempt, replan fails at once, escalate blocks on the party', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.tick(add(at(4), 'PT30M'));
  assert.equal(svc.step(id, 's_02').state, 'ready', 'requeue: the card is revoked and the step returns to ready');
  assert.equal(svc.step(id, 's_02').attempts.made, 1);
  svc.claim(id, 's_02', add(at(4), 'PT31M'));
  svc.tick(add(at(4), 'PT60M'));
  assert.equal(svc.step(id, 's_02').outcome.code, 'failed-final');
  assert.equal(svc.step(id, 's_02').outcome.fields.reason, 'deadline');
  const svc2 = new TaskService({ catalogue: fixture('catalogue.json'), planner: planner() });
  const t = svc2.open(fixture('task-12/request.json'), { task_type: 'IN/any/chase' });
  const plan = clone(fixture('task-12/plan-p12-1.json'));
  plan.steps = [{ ...plan.steps[1], step_id: 's_01', step_type: 'IN/any/chase-the-party', template: 'IN/any/chase-the-party@v1', act: 'attest-fact', identity_acts: [], after: [] }];
  svc2.transition(t.task_id, 'accept', at(0), {});
  svc2.adoptPlan(t.task_id, plan, at(1));
  svc2.transition(t.task_id, 'propose', at(2), {});
  svc2.transition(t.task_id, 'authorise', at(3), { envelope: fixture('task-12/envelope-v2.json') });
  svc2.claim(t.task_id, 's_01', at(4));
  svc2.tick(add(at(4), 'PT40M'));
  assert.equal(svc2.step(t.task_id, 's_01').outcome.code, 'blocked-third-party', 'escalate');
  assert.equal(svc2.task(t.task_id).state, 'awaiting-third-party');
  assert.ok(svc2.board.get(`${t.task_id}:no-route`), 'for the escalation desk');
  checkAll(svc2, add(at(4), 'PT41M'));
});

test('blocked-outside-envelope raises one extension request per version per line; decline fails the step and re-plans; do this yourself only where offered', () => {
  const p = planner();
  const { svc, id } = authorised({ planner: p });
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', ok(), at(6));
  svc.claim(id, 's_03', at(7));
  const breach = { code: 'blocked-outside-envelope', closed_by: { kind: 'worker', id: 'w_1', pool: 'L1' }, fields: { envelope_line: 'spend-cap', proposed_value: { currency: 'INR', amount: 500 } } };
  svc.closeStep(id, 's_03', breach, at(8));
  assert.equal(svc.task(id).state, 'awaiting-user');
  assert.equal(transitionsOf(svc, id).at(-1), 'request-extension');
  const reqs = svc.openExtensions(id);
  assert.equal(reqs.length, 1);
  const r = registry.validate('aifred:extension-request', reqs[0]);
  assert.ok(r.ok, JSON.stringify(r.errors));
  assert.equal(reqs[0].offers_do_yourself, false);
  assert.throws(() => svc.answerExtension(reqs[0].reference, at(9), { kind: 'do-this-yourself', device: DEV }), /offered only/);
  svc.answerExtension(reqs[0].reference, at(9), { kind: 'decline', device: DEV });
  assert.equal(svc.step(id, 's_03').outcome.code, 'failed-final');
  assert.deepEqual(p.calls, ['failed-final']);
});

test('blocked-needs-user creates a user step and bounces the task', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.closeStep(id, 's_02', { code: 'blocked-needs-user', closed_by: { kind: 'harness', id: 'ai-executor' }, fields: { needed: 'Confirm the referring doctor', why: 'the portal asks for it' } }, at(6));
  const user = svc.stepsOf(id).find((s) => s.class === 'user' && s.created_by === 's_02');
  assert.ok(user);
  assert.equal(user.state, 'bounced');
  assert.equal(svc.task(id).state, 'awaiting-user');
  const r = registry.validate('aifred:step', user);
  assert.ok(r.ok, JSON.stringify(r.errors));
});

test('fault injection: a deleted timer puts the task on the board; only a person, with a timer of the right kind and in the future, clears it; there is no dismiss', () => {
  const { svc, id } = authorised();
  svc.claim(id, 's_02', at(5));
  svc.timersByTask.get(id).clear();
  assert.deepEqual(svc.invariantViolations(at(6)), [`${id}: live state active without a future timer`]);
  const raised = svc.watchdog(at(6));
  assert.equal(raised.length, 1);
  assert.equal(raised[0].column, 'no-live-timer');
  assert.throws(() => svc.boardAction(id, at(7), { actor: PERSON, action: 'dismiss', column: 'no-live-timer' }), /no board action/);
  assert.throws(() => svc.boardAction(id, at(7), { actor: PERSON, action: 'set-timer', column: 'no-live-timer', kind: 'nudge-schedule', due: at(30) }), /right kind/);
  assert.throws(() => svc.boardAction(id, at(7), { actor: PERSON, action: 'set-timer', column: 'no-live-timer', kind: 'step-deadline', due: at(6) }), /past/);
  assert.throws(() => svc.boardAction(id, at(7), { actor: { kind: 'person', id: 'w_2', role: 'l1' }, action: 'set-timer', column: 'no-live-timer', kind: 'step-deadline', due: at(30) }), /role/);
  svc.boardAction(id, at(7), { actor: PERSON, action: 'set-timer', column: 'no-live-timer', kind: 'step-deadline', due: at(30) });
  assert.deepEqual(svc.invariantViolations(at(8)), []);
  assert.deepEqual(svc.watchdog(at(8)), []);
  const action = svc.eventsOf(id, 'board-action').at(-1);
  assert.equal(action.actor.kind, 'person');
  assert.equal(action.actor.role, 'shift-lead');
  checkAll(svc, at(8));
});

test('a state that disagrees with the projection rule is an exception the watchdog raises', () => {
  const { svc, id } = authorised();
  svc.task(id).state = 'awaiting-user';
  const raised = svc.watchdog(at(5));
  assert.ok(raised.some((c) => c.condition.includes('projection')));
});

test('an exhausted nudge schedule without a lapse event is a defect the watchdog boards', () => {
  const { svc, id } = world();
  for (const d of ['PT4H', 'P1D', 'P3D']) svc.tick(add(at(3), d));
  svc.timersByTask.get(id).clear();
  const now = add(at(3), 'P7DT2M');
  const raised = svc.watchdog(now);
  assert.ok(raised.some((c) => c.column === 'nudges-exhausted'));
  assert.throws(() => svc.boardAction(id, now, { actor: PERSON, action: 'close-nudge-schedule', column: 'nudges-exhausted' }), /incident/);
  svc.boardAction(id, now, { actor: PERSON, action: 'close-nudge-schedule', column: 'nudges-exhausted', incident_id: 'inc_0001' });
  assert.equal(svc.task(id).state, 'awaiting-authority', 'no person writes a lapse event');
  svc.tick(addMs(now, 1000));
  assert.equal(svc.task(id).state, 'lapsed', 'the task service writes it on the next tick');
  assert.match(svc.eventsOf(id, 'transition').at(-1).reason, /inc_0001/);
});

test('redo closes the parent with the verdict and opens a linked child in planning', () => {
  const { svc, id } = authorised();
  for (const s of ['s_02', 's_03', 's_04']) {
    svc.claim(id, s, at(5));
    svc.closeStep(id, s, ok(), at(6));
  }
  svc.deviceResponse(id, 's_05', at(7), { result: 'done', at: at(7), device: DEV, signature: 'c2ln' });
  svc.claim(id, 's_06', at(8));
  svc.closeStep(id, 's_06', ok(), at(9));
  svc.verdict(id, at(10), { verdict: 'wrong-outcome', device: DEV });
  const parent = svc.task(id);
  assert.equal(parent.state, 'closed');
  assert.equal(parent.verdict, 'wrong-outcome');
  const child = svc.task(parent.child_task_id);
  assert.equal(child.state, 'planning');
  assert.equal(child.parent_task_id, id);
  assert.equal(svc.liveTimer(child.task_id).kind, 'planning-deadline');
  assert.ok(registry.validate('aifred:task', child).ok);
});

test('suspending the binding moves only a task that holds authority; awaiting-verdict waits in its state', () => {
  const { svc, id } = authorised();
  const other = svc.open({ ...fixture('task-12/request.json'), request_id: 'req_80' }, { task_type: 'IN/health/book-appointment' });
  svc.claim(id, 's_02', at(5));
  svc.suspendBinding('u_3f9a', at(6));
  assert.equal(svc.task(id).state, 'awaiting-authority');
  assert.equal(svc.task(other.task_id).state, 'received', 'holds no authority yet');
  assert.equal(svc.step(id, 's_02').cancelled.cause, 'lapsed');
  checkAll(svc, at(7));
});

test('property: random walks never leave a live task without a timer, never reach a terminal state without a transition, and the log validates', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const r = rng(seed * 7919);
    const p = planner({ replan: () => null });
    const { svc, id } = world({ planner: p });
    let now = ms(at(4));
    const clock = () => addMs(T0, now - ms(T0));
    const ops = ['tick', 'authorise', 'claim', 'close-ok', 'close-retry', 'close-blocked', 'close-needs-user', 'device-done', 'question', 'answer', 'message', 'party', 'withdraw', 'verdict', 'delivered', 'edit'];
    for (let i = 0; i < 60; i++) {
      now += r.int(6 * 3600 * 1000) + 1000;
      const t = clock();
      const task = svc.task(id);
      if (['closed', 'refused'].includes(task.state)) break;
      const op = r.pick(ops);
      try {
        switch (op) {
          case 'tick': svc.tick(t); break;
          case 'authorise': if (task.state === 'awaiting-authority' && !task.renewal_open) svc.transition(id, 'authorise', t, { envelope: { ...fixture('task-12/envelope-v2.json'), validity: { from: t, to: add(t, 'P7D') } } }); break;
          case 'claim': { const s = svc.stepsOf(id).find((x) => x.state === 'ready'); if (s && task.state === 'active') svc.claim(id, s.step_id, t); break; }
          case 'close-ok': { const s = svc.stepsOf(id).find((x) => x.state === 'running'); if (s) svc.closeStep(id, s.step_id, ok(), t); break; }
          case 'close-retry': { const s = svc.stepsOf(id).find((x) => x.state === 'running'); if (s) svc.closeStep(id, s.step_id, { code: 'failed-retryable', closed_by: { kind: 'harness', id: 'x' }, fields: { error_class: 'timeout' } }, t); break; }
          case 'close-blocked': { const s = svc.stepsOf(id).find((x) => x.state === 'running'); if (s && svc.entry(s.step_type).response_windows.length) svc.closeStep(id, s.step_id, { code: 'blocked-third-party', closed_by: { kind: 'worker', id: 'w', pool: 'L1' }, fields: { party: 'p', response_window: svc.entry(s.step_type).response_windows[0] } }, t); break; }
          case 'close-needs-user': { const s = svc.stepsOf(id).find((x) => x.state === 'running'); if (s) svc.closeStep(id, s.step_id, { code: 'blocked-needs-user', closed_by: { kind: 'harness', id: 'x' }, fields: { needed: 'a fact', why: 'asked' } }, t); break; }
          case 'device-done': { const s = svc.stepsOf(id).find((x) => x.state === 'bounced'); if (s) svc.deviceResponse(id, s.step_id, t, { result: r.chance(0.8) ? 'done' : 'declined', at: t, device: DEV, signature: 'c2ln' }); break; }
          case 'question': if (['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) svc.askQuestion(id, t, { text: 'q', predicate: 'p', answer_kind: 'free-line' }); break;
          case 'answer': { const q = svc.openQuestions(id)[0]; if (q) svc.answerQuestion(q.question_id, t, { value: 'a', device: DEV, fact_id: 'f_0001' }); break; }
          case 'message': svc.userMessage(id, t); break;
          case 'party': { const s = svc.stepsOf(id).find((x) => x.state === 'closed' && x.outcome.code === 'blocked-third-party'); if (s) svc.partyResponded(id, s.step_id, t); break; }
          case 'withdraw': if (r.chance(0.1) && LIVE_STATES.includes(task.state)) svc.verdict(id, t, { verdict: 'withdrawn', device: DEV }); break;
          case 'verdict': if (task.state === 'awaiting-verdict') svc.verdict(id, t, { verdict: r.pick(['done-satisfied', 'done-rough', 'could-not-complete', 'wrong-outcome']), device: DEV }); break;
          case 'delivered': if (task.state === 'awaiting-verdict' && task.report && !task.report.delivered_at) svc.reportDelivered(id, t, { device: DEV }); break;
          case 'edit': if (['active', 'awaiting-user', 'awaiting-third-party'].includes(task.state)) svc.envelopeEdited(id, { ...fixture('task-12/envelope-v2.json'), version: task.envelope_version + 1, validity: { from: t, to: add(t, 'P7D') }, authorised_by: { device: DEV, at: t } }, t, 'extension'); break;
          default: break;
        }
      } catch (e) {
        if (!(e instanceof SpecError)) throw e;
      }
      svc.tick(clock());
      const v = svc.invariantViolations(clock());
      assert.deepEqual(v, [], `seed ${seed} step ${i} op ${op}: ${v.join('; ')}`);
      assert.deepEqual(svc.watchdog(clock()).map((c) => c.column).filter((c) => c === 'no-live-timer'), [], `seed ${seed} step ${i} op ${op}: watchdog raised a missing timer`);
    }
    for (const ev of svc.events) {
      const res = registry.validate('aifred:event', ev);
      assert.ok(res.ok, `seed ${seed} event ${ev.event_id} ${ev.kind}: ${JSON.stringify(res.errors)}`);
    }
    for (const t of svc.tasks.values()) {
      const res = registry.validate('aifred:task', t);
      assert.ok(res.ok, `seed ${seed} task ${t.task_id}: ${JSON.stringify(res.errors)}`);
      if (TERMINAL_STATES.includes(t.state)) assert.ok(svc.eventsOf(t.task_id, 'transition').some((e) => e.to === t.state), 'no terminal state without a transition');
    }
  }
});
