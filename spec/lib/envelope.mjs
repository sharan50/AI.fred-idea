// The authority envelope: a versioned record whose version 1 is the planner's
// unsigned proposal, every later version signed by the user's bound device.
// Every line carries a scope. The cap is a running total, tested against the
// remaining cap: the cap less fired acts less reserved acts.
import { COMMITTABLE_ACTS, IDENTITY_ACTS } from './vocab.mjs';
import { ms, min } from './time.mjs';
import { signRecord, sha256 } from './signing.mjs';

export class EnvelopeError extends Error {}

export function versionRef(env) {
  return `${env.envelope_id}/v${env.version}`;
}

export function propose({ envelope_id, task_id, spend_cap, sub_caps = {}, contactable_parties = [], committable_acts = [], delegated_identity_acts = [], health_record_consents, delegated_logins, validity }) {
  for (const l of committable_acts) if (!COMMITTABLE_ACTS.includes(l.act)) throw new EnvelopeError(`${l.act} is not a committable act`);
  for (const l of delegated_identity_acts) if (!IDENTITY_ACTS.includes(l.act)) throw new EnvelopeError(`${l.act} is not an identity act`);
  const env = { envelope_id, task_id, version: 1, spend_cap, sub_caps, contactable_parties, committable_acts, delegated_identity_acts, validity, authorised_by: null, edits: [] };
  if (health_record_consents) env.health_record_consents = health_record_consents;
  if (delegated_logins) env.delegated_logins = delegated_logins;
  return env;
}

// The planner's filter: an act the jurisdiction flags bounce is never shown as
// a box to tick; it appears as "you will do this yourself".
export function filterIdentityActs(lines, flagOf) {
  return lines.filter((l) => flagOf(l.act) === 'delegated');
}

function unsigned(env) {
  const { authorised_by, ...rest } = env;
  return { ...rest, authorised_by: authorised_by ? { device: authorised_by.device, at: authorised_by.at } : null };
}

function newVersion(env, { device, at, change, kind, scope, sign }, mutate) {
  const next = JSON.parse(JSON.stringify(env));
  next.version = env.version + 1;
  mutate(next);
  next.edits.push({ version: next.version, change, at, kind, scope });
  next.authorised_by = { device, at };
  next.authorised_by.signature = sign(unsigned(next));
  return next;
}

export function authorise(env, { device, at, sign, narrow = null }) {
  if (env.version !== 1 && env.authorised_by) throw new EnvelopeError('authorise signs the proposal; later changes are edits');
  return newVersion(env, { device, at, change: narrow ? `narrowed at authorisation: ${narrow.change}` : 'authorised', kind: 'authorisation', scope: 'task', sign }, (next) => {
    if (narrow) narrow.apply(next);
  });
}

// Three sources of scope: a step's request approved produces a line scoped
// to that step; a task-level request the task service raises (the renewal)
// produces a task-wide line; the user's own edit produces a task-wide line.
export function extend(env, { line, device, at, sign, source }) {
  const scope = source.kind === 'step-request' ? source.step_id : 'task';
  if (source.kind === 'step-request' && !source.step_id) throw new EnvelopeError('a step-scoped line names its step');
  return newVersion(env, { device, at, change: `extended: ${line.field}`, kind: source.kind === 'renewal' ? 'renewal' : 'extension', scope, sign }, (next) => applyLine(next, line, scope));
}

export function narrow(env, { line, device, at, sign }) {
  return newVersion(env, { device, at, change: `narrowed: ${line.field}`, kind: 'narrowing', scope: 'task', sign }, (next) => removeLine(next, line));
}

export function renew(env, { to, device, at, sign }) {
  return extend(env, { line: { field: 'validity-window', value: to }, device, at, sign, source: { kind: 'renewal' } });
}

function applyLine(next, line, scope) {
  switch (line.field) {
    case 'spend-cap':
      next.spend_cap = { ...next.spend_cap, amount: line.value.amount, currency: line.value.currency || next.spend_cap.currency };
      break;
    case 'sub-cap':
      next.sub_caps[line.step_id] = line.value;
      break;
    case 'party':
      next.contactable_parties.push({ party: line.value, scope });
      break;
    case 'act':
      if (!COMMITTABLE_ACTS.includes(line.value)) throw new EnvelopeError(`${line.value} is not a committable act`);
      next.committable_acts.push({ act: line.value, scope });
      break;
    case 'identity-act':
      if (!IDENTITY_ACTS.includes(line.value)) throw new EnvelopeError(`${line.value} is not an identity act`);
      next.delegated_identity_acts.push({ act: line.value, scope });
      break;
    case 'validity-window':
      next.validity = { ...next.validity, to: line.value };
      break;
    default:
      throw new EnvelopeError(`no envelope line of kind ${line.field}`);
  }
}

function removeLine(next, line) {
  switch (line.field) {
    case 'spend-cap':
      next.spend_cap = { ...next.spend_cap, amount: line.value.amount };
      break;
    case 'party':
      next.contactable_parties = next.contactable_parties.filter((l) => l.party !== line.value);
      break;
    case 'act':
      next.committable_acts = next.committable_acts.filter((l) => l.act !== line.value);
      break;
    case 'identity-act':
      next.delegated_identity_acts = next.delegated_identity_acts.filter((l) => l.act !== line.value);
      break;
    case 'validity-window':
      next.validity = { ...next.validity, to: line.value };
      break;
    default:
      throw new EnvelopeError(`no envelope line of kind ${line.field}`);
  }
}

// Does the envelope admit a line for this step? A step-scoped line admits
// only its step; a task-wide line admits every step.
export function admits(env, kind, value, stepId = null) {
  const lines = { party: env.contactable_parties, act: env.committable_acts, 'identity-act': env.delegated_identity_acts, consent: env.health_record_consents || [], login: env.delegated_logins || [] }[kind];
  if (!lines) throw new EnvelopeError(`no line kind ${kind}`);
  const key = { party: 'party', act: 'act', 'identity-act': 'act', consent: 'record', login: 'record' }[kind];
  return lines.some((l) => l[key] === value && (l.scope === 'task' || (stepId !== null && l.scope === stepId)));
}

export function hasAuthority(env) {
  return env.version >= 2 && !!env.authorised_by && typeof env.authorised_by.signature === 'string';
}

export function windowOpen(env, at) {
  return ms(at) >= ms(env.validity.from) && ms(at) < ms(env.validity.to);
}

// The committed-spend total is fired acts plus the amounts outstanding tokens
// reserve; every test is against the remaining cap and never the cap alone.
export function remainingCap(env, committed = { fired: 0, reserved: 0 }) {
  return { currency: env.spend_cap.currency, amount: env.spend_cap.amount - committed.fired - committed.reserved };
}

export function withinCap(env, committed, amount, stepId = null) {
  if (!amount) return true;
  if (amount.currency !== env.spend_cap.currency) return false;
  const remaining = remainingCap(env, committed);
  if (amount.amount > remaining.amount) return false;
  if (stepId && env.sub_caps && env.sub_caps[stepId] && amount.amount > env.sub_caps[stepId].amount) return false;
  return true;
}

// What a card or a check panel shows of a cap: presence and comparison only,
// never a number.
export function capLine(env) {
  return env.spend_cap.amount === 0 ? 'spend cap: no spend' : 'spend cap: set';
}

export function remainingCapLine(env, committed, amount) {
  return `remaining cap: sufficient for this act: ${withinCap(env, committed, amount) ? 'yes' : 'no'}`;
}

// ---- approval tokens --------------------------------------------------------

export function issueToken({ ids, signer, check_id, task_id, step_id, envelope_version, checker, act, amount = null, step_deadline, window_end, at }) {
  const token = {
    token_id: ids.next('tok', 4), check_id, task_id, step_id, envelope_version, checker, act_hash: sha256(act), amount_reserved: amount,
    issued_at: at, expires_at: min(step_deadline, window_end), consumed_at: null, voided: null, key_id: signer.key_id,
  };
  token.signature = signRecord(signer.privateKey, token);
  return token;
}

// The signature covers the token as issued; consumption and voiding are
// state the controller and the substitutor record after issue.
export function tokenState(token, { keys, envelope_version, at, act = null }) {
  if (!token) return { ok: false, why: 'no token' };
  if (!keys.verify({ ...token, consumed_at: null, voided: null })) return { ok: false, why: 'signature' };
  if (token.voided) return { ok: false, why: 'voided' };
  if (token.consumed_at) return { ok: false, why: 'consumed' };
  if (token.envelope_version !== envelope_version) return { ok: false, why: 'another envelope version' };
  if (ms(at) >= ms(token.expires_at)) return { ok: false, why: 'expired' };
  if (act !== null && sha256(act) !== token.act_hash) return { ok: false, why: 'the act differs from the one checked' };
  return { ok: true };
}

export function consumeToken(token, at) {
  if (token.consumed_at) throw new EnvelopeError('a token is single-use');
  return { ...token, consumed_at: at };
}

export function voidToken(token, at, reason) {
  return { ...token, voided: { at, reason } };
}
