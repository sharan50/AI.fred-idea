import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { registry, fixture, fixtureFiles, clone, specDir } from './helpers.mjs';

const byFile = {
  'request.json': 'aifred:request',
  'envelope-v1.json': 'aifred:envelope',
  'envelope-v2.json': 'aifred:envelope',
  'step-s03.json': 'aifred:step',
  'step-s05.json': 'aifred:step',
  'outcome-s03.json': 'aifred:outcome',
  'ledger-l12-0007.json': 'aifred:ledger-entry',
  'fact-f0281.json': 'aifred:fact',
  'event-e000412.json': 'aifred:event',
  'plan-p12-1.json': 'aifred:plan',
};

function walkRefs(node, out) {
  if (Array.isArray(node)) node.forEach((n) => walkRefs(n, out));
  else if (node && typeof node === 'object') {
    if (typeof node.$ref === 'string') out.push(node.$ref);
    for (const v of Object.values(node)) walkRefs(v, out);
  }
}

test('every schema loads and every $ref in every schema resolves', () => {
  assert.ok(registry.ids().length >= 20, `only ${registry.ids().length} schemas loaded`);
  for (const id of registry.ids()) {
    const root = registry.get(id);
    const refs = [];
    walkRefs(root, refs);
    for (const ref of refs) assert.doesNotThrow(() => registry.resolve(ref, root), `${id}: ${ref}`);
  }
});

test('every schema carries an x-locus into the pages except the shared definitions', () => {
  for (const id of registry.ids()) {
    const s = registry.get(id);
    if (id === 'aifred:common' || id === 'aifred:vocab') continue;
    assert.equal(typeof s['x-locus'], 'string', `${id} names no locus`);
  }
});

test('every task 12 fixture the pages print validates against its schema', () => {
  for (const f of fixtureFiles('task-12')) {
    assert.ok(byFile[f], `no schema mapped for fixture ${f}`);
    const r = registry.validate(byFile[f], fixture(`task-12/${f}`));
    assert.ok(r.ok, `${f}: ${JSON.stringify(r.errors, null, 1)}`);
  }
});

test('the catalogue, the party directory and both flag tables validate', () => {
  for (const e of fixture('catalogue.json')) {
    const r = registry.validate('aifred:catalogue-entry', e);
    assert.ok(r.ok, `${e.step_type}: ${JSON.stringify(r.errors, null, 1)}`);
  }
  for (const p of fixture('parties.json')) {
    const r = registry.validate('aifred:party', p);
    assert.ok(r.ok, `${p.party_id}: ${JSON.stringify(r.errors, null, 1)}`);
  }
  for (const f of ['flags-ceiling.json', 'flags-pilot.json']) {
    const r = registry.validate('aifred:policy-flag-table', fixture(f));
    assert.ok(r.ok, `${f}: ${JSON.stringify(r.errors, null, 1)}`);
  }
});

test('the alias grammar admits the forms the pages print and rejects what is never an alias', () => {
  const ok = ['{{pan}}', '{{card.primary}}', '{{card.primary.last4}}', '{{doc.aadhaar.masked}}', '{{account.hdfc-2}}', '{{name.nominee}}', '{{health.condition}}', '{{reference.max-healthcare}}'];
  const bad = ['{{otp}}', '{{PAN}}', '{{card..primary}}', 'pan', '{{card.primary.}}', '{{ card }}', '{{pin}}'];
  for (const a of ok) assert.ok(registry.validate({ $ref: 'aifred:common#/$defs/alias' }, a).ok, a);
  for (const a of bad) assert.ok(!registry.validate({ $ref: 'aifred:common#/$defs/alias' }, a).ok, `${a} should be rejected`);
});

test('a step on telephony carries no field, because a call carries no value', () => {
  const s = clone(fixture('task-12/step-s03.json'));
  s.fields = ['{{dob}}'];
  assert.ok(!registry.validate('aifred:step', s).ok);
});

test('an outcome code demands its fields, and a fired marker forbids failed-retryable', () => {
  const o = clone(fixture('task-12/outcome-s03.json'));
  delete o.fields.variance;
  assert.ok(!registry.validate('aifred:outcome', o).ok, 'ok-with-variance needs a variance note');
  const f = clone(fixture('task-12/outcome-s03.json'));
  f.code = 'failed-retryable';
  f.fields = { error_class: 'timeout' };
  f.fired_marker = { at: '2026-09-02T15:00:00+05:30', action: 'form-submit', written_by: 'browser-controller' };
  assert.ok(!registry.validate('aifred:outcome', f).ok, 'a step with a fired marker never closes failed-retryable');
  f.fired_marker = null;
  assert.ok(registry.validate('aifred:outcome', f).ok);
  for (const code of ['blocked-third-party', 'blocked-needs-user', 'blocked-outside-envelope', 'failed-final', 'refused-policy', 'superseded']) {
    const x = clone(f);
    x.code = code;
    x.fields = {};
    assert.ok(!registry.validate('aifred:outcome', x).ok, `${code} with no fields must be rejected`);
  }
});

test('version 1 of an envelope is unsigned and carries no authority; a later version must be signed', () => {
  const v1 = clone(fixture('task-12/envelope-v1.json'));
  v1.authorised_by = { device: 'dev_12a', at: '2026-09-02T14:35:12+05:30' };
  assert.ok(!registry.validate('aifred:envelope', v1).ok);
  const v2 = clone(fixture('task-12/envelope-v2.json'));
  v2.authorised_by = null;
  assert.ok(!registry.validate('aifred:envelope', v2).ok);
});

test('an envelope line only admits the acts of the two closed lists', () => {
  const v2 = clone(fixture('task-12/envelope-v2.json'));
  v2.committable_acts.push({ act: 'enter-one-time-code', scope: 'task' });
  assert.ok(!registry.validate('aifred:envelope', v2).ok, 'a user-only act is never an envelope line');
  const w = clone(fixture('task-12/envelope-v2.json'));
  w.delegated_identity_acts.push({ act: 'book', scope: 'task' });
  assert.ok(!registry.validate('aifred:envelope', w).ok);
});

test('a task record in a terminal state names how it got there', () => {
  const base = {
    task_id: 't_12', task_type: 'IN/health/book-appointment', market: 'IN', user_ref: 'u_3f9a', device_binding: 'dev_12a',
    state: 'lapsed', opened_at: '2026-09-02T14:31:08+05:30', request_ids: ['req_7f'], plan_id: 'p_12.1', envelope_id: 'env_12', envelope_version: 2,
    lapsed_from: null, refusal_code: null, verdict: null, parent_task_id: null, child_task_id: null, report: null, renewal_open: false,
    committed_spend: { fired: 0, reserved: 0 },
  };
  assert.ok(!registry.validate('aifred:task', base).ok, 'lapsed without lapsed_from');
  assert.ok(registry.validate('aifred:task', { ...base, lapsed_from: 'awaiting-verdict' }).ok);
  assert.ok(!registry.validate('aifred:task', { ...base, state: 'refused' }).ok, 'refused without a reason code');
  assert.ok(registry.validate('aifred:task', { ...base, state: 'refused', refusal_code: 'refused-advice' }).ok);
  assert.ok(!registry.validate('aifred:task', { ...base, state: 'closed' }).ok, 'closed without a verdict');
  assert.ok(!registry.validate('aifred:task', { ...base, state: 'closed', verdict: 'lapsed' }).ok, 'lapsed is never a verdict');
});

test('a board action is always a person with a staff id and a role', () => {
  const ev = { event_id: 'e_1', task_id: 't_12', at: '2026-09-02T15:00:00+05:30', kind: 'board-action', actor: { kind: 'system', id: 'task-service' }, column: 'no-live-timer', action: 'set-timer' };
  assert.ok(!registry.validate('aifred:event', ev).ok);
  ev.actor = { kind: 'person', id: 'w_0x', role: 'shift-lead' };
  assert.ok(registry.validate('aifred:event', ev).ok);
  ev.action = 'dismiss';
  assert.ok(!registry.validate('aifred:event', ev).ok, 'there is no dismiss');
});

test('a placement receipt cannot carry a value, a length, a partial or a digest', () => {
  const r = { placement_id: 'pl_1', status: 'placed', check: null, reason: null, committing: false, at: '2026-09-02T15:09:02+05:30' };
  assert.ok(registry.validate('aifred:placement-receipt', r).ok);
  for (const k of ['value', 'length', 'partial', 'digest', 'rendering']) {
    assert.ok(!registry.validate('aifred:placement-receipt', { ...r, [k]: 'x' }).ok, k);
  }
  assert.ok(!registry.validate('aifred:placement-receipt', { ...r, status: 'refused' }).ok, 'refused must name the check');
});

test('the catalogue schema keeps the withdrawn columns null and forbids a value on a call', () => {
  const e = clone(fixture('catalogue.json')[0]);
  e.spoken_format = 'digit by digit';
  assert.ok(!registry.validate('aifred:catalogue-entry', e).ok, 'spoken_format was withdrawn with DR-021');
  const t = clone(fixture('catalogue.json')[0]);
  t.alias_classes = ['identity-number'];
  assert.ok(!registry.validate('aifred:catalogue-entry', t).ok, 'a telephony-only step type admits no alias class');
  const ai = clone(fixture('catalogue.json')[1]);
  ai.verifier = null;
  assert.ok(!registry.validate('aifred:catalogue-entry', ai).ok, 'an ai step type names a verifier');
});

test('a sensitive fact holds the alias, never the value', () => {
  const f = clone(fixture('task-12/fact-f0281.json'));
  f.value_alias = null;
  assert.ok(!registry.validate('aifred:fact', f).ok);
});

test('the schema files on disk are the ones the registry loaded', () => {
  const ids = registry.ids();
  for (const id of ids) {
    const file = join(specDir, 'schemas', `${id.replace('aifred:', '')}.schema.json`);
    const s = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(s.$id, id);
  }
});
