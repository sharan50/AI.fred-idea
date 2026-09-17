import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/envelope.mjs';
import { Device, keyPair, KeyRing, verifyRecord } from '../lib/signing.mjs';
import { Ids } from '../lib/ids.mjs';
import { add } from '../lib/time.mjs';
import { registry, fixture, clone } from './helpers.mjs';

const device = new Device('dev_12a');
const sign = (r) => device.sign(r);
const T = '2026-09-02T14:35:00+05:30';

function proposal() {
  return E.propose({ envelope_id: 'env_12', task_id: 't_12', spend_cap: { currency: 'INR', amount: 0 }, contactable_parties: [{ party: 'party_max-healthcare', scope: 'task' }, { party: 'party_referring-clinic', scope: 'task' }], committable_acts: [{ act: 'schedule', scope: 'task' }, { act: 'cancel', scope: 'task' }], delegated_identity_acts: [{ act: 'attest-fact', scope: 'task' }], validity: { from: T, to: add(T, 'P7D') } });
}

test('version 1 is the unsigned proposal and carries no authority; authorisation is version 2, signed by the bound device', () => {
  const v1 = proposal();
  assert.equal(v1.version, 1);
  assert.equal(E.hasAuthority(v1), false);
  assert.ok(registry.validate('aifred:envelope', v1).ok);
  const v2 = E.authorise(v1, { device: 'dev_12a', at: '2026-09-02T14:35:12+05:30', sign, narrow: { change: "removed party 'the referring clinic'", apply: (n) => { n.contactable_parties = n.contactable_parties.filter((p) => p.party !== 'party_referring-clinic'); } } });
  assert.equal(v2.version, 2);
  assert.equal(E.hasAuthority(v2), true);
  assert.equal(v2.edits.length, 1);
  assert.equal(v2.edits[0].kind, 'authorisation');
  assert.ok(device.verify({ ...v2, authorised_by: { device: 'dev_12a', at: v2.authorised_by.at }, signature: v2.authorised_by.signature }), 'the signature is the device\'s over the version');
  const printed = fixture('task-12/envelope-v2.json');
  assert.deepEqual(v2.contactable_parties, printed.contactable_parties);
  assert.deepEqual(v2.committable_acts, printed.committable_acts);
  assert.ok(registry.validate('aifred:envelope', v2).ok);
  assert.throws(() => E.propose({ envelope_id: 'env_x', task_id: 't_1', spend_cap: { currency: 'INR', amount: 0 }, committable_acts: [{ act: 'enter-one-time-code', scope: 'task' }], validity: { from: T, to: T } }), /not a committable act/);
});

test('every line carries a scope from one of three sources; a step-scoped line admits only its step', () => {
  const v2 = E.authorise(proposal(), { device: 'dev_12a', at: T, sign });
  const v3 = E.extend(v2, { line: { field: 'act', value: 'book' }, device: 'dev_12a', at: add(T, 'PT1H'), sign, source: { kind: 'step-request', step_id: 's_04' } });
  assert.equal(v3.version, 3);
  assert.equal(E.admits(v3, 'act', 'book', 's_04'), true);
  assert.equal(E.admits(v3, 'act', 'book', 's_05'), false);
  assert.equal(E.admits(v3, 'act', 'book'), false);
  assert.equal(E.admits(v3, 'act', 'schedule', 's_05'), true, 'a task-wide line admits every step');
  const v4 = E.extend(v3, { line: { field: 'party', value: 'party_hdfc-bank' }, device: 'dev_12a', at: add(T, 'PT2H'), sign, source: { kind: 'user-edit' } });
  assert.equal(E.admits(v4, 'party', 'party_hdfc-bank', 's_09'), true, "the user's own edit is task-wide");
  const v5 = E.renew(v4, { to: add(T, 'P14D'), device: 'dev_12a', at: add(T, 'P7D'), sign });
  assert.equal(v5.edits.at(-1).kind, 'renewal');
  assert.equal(v5.edits.at(-1).scope, 'task');
  assert.equal(v5.validity.to, add(T, 'P14D'));
  assert.throws(() => E.extend(v2, { line: { field: 'act', value: 'book' }, device: 'dev_12a', at: T, sign, source: { kind: 'step-request' } }), /names its step/);
  for (const v of [v3, v4, v5]) assert.ok(registry.validate('aifred:envelope', v).ok, JSON.stringify(registry.validate('aifred:envelope', v).errors));
});

test('narrowing removes a line in a new signed version; the window is open only inside its bounds', () => {
  const v2 = E.authorise(proposal(), { device: 'dev_12a', at: T, sign });
  const v3 = E.narrow(v2, { line: { field: 'act', value: 'cancel' }, device: 'dev_12a', at: add(T, 'PT1H'), sign });
  assert.equal(E.admits(v3, 'act', 'cancel'), false);
  assert.equal(E.admits(v2, 'act', 'cancel'), true, 'every version of the envelope is kept');
  assert.equal(E.windowOpen(v2, add(T, 'P3D')), true);
  assert.equal(E.windowOpen(v2, add(T, 'P7D')), false);
  assert.equal(E.windowOpen(v2, '2026-09-01T00:00:00+05:30'), false);
});

test('the cap is a running total: fired plus reserved, and every act is tested against the remaining cap', () => {
  const env = E.authorise(E.propose({ envelope_id: 'env_9', task_id: 't_9', spend_cap: { currency: 'INR', amount: 1000 }, sub_caps: { s_02: { currency: 'INR', amount: 200 } }, validity: { from: T, to: add(T, 'P7D') } }), { device: 'dev_12a', at: T, sign });
  assert.deepEqual(E.remainingCap(env, { fired: 400, reserved: 300 }), { currency: 'INR', amount: 300 });
  assert.equal(E.withinCap(env, { fired: 400, reserved: 300 }, { currency: 'INR', amount: 300 }), true);
  assert.equal(E.withinCap(env, { fired: 400, reserved: 300 }, { currency: 'INR', amount: 301 }), false);
  assert.equal(E.withinCap(env, { fired: 0, reserved: 0 }, { currency: 'INR', amount: 600 }), true, 'each under the cap alone');
  assert.equal(E.withinCap(env, { fired: 0, reserved: 600 }, { currency: 'INR', amount: 600 }), false, 'but not together');
  assert.equal(E.withinCap(env, { fired: 0, reserved: 0 }, { currency: 'GBP', amount: 1 }), false, 'one currency, the user\'s market\'s');
  assert.equal(E.withinCap(env, { fired: 0, reserved: 0 }, { currency: 'INR', amount: 250 }, 's_02'), false, 'a per-step sub-cap binds too');
  assert.equal(E.capLine(env), 'spend cap: set');
  assert.equal(E.capLine(proposal()), 'spend cap: no spend');
  assert.equal(E.remainingCapLine(env, { fired: 900, reserved: 0 }, { currency: 'INR', amount: 100 }), 'remaining cap: sufficient for this act: yes');
  assert.equal(E.remainingCapLine(env, { fired: 900, reserved: 0 }, { currency: 'INR', amount: 101 }), 'remaining cap: sufficient for this act: no');
  assert.ok(!/\d/.test(E.capLine(env)), 'never a number');
});

test('an approval token is signed, bound to the check, the step and the version, expires at the sooner of the step deadline and the window, and is single-use', () => {
  const signer = keyPair('k_in-2026q3');
  const keys = new KeyRing(signer);
  const ids = new Ids();
  const env = E.authorise(proposal(), { device: 'dev_12a', at: T, sign });
  const act = { step_id: 's_04', action: 'form-submit', form_hash: 'abc' };
  const token = E.issueToken({ ids, signer, check_id: 'chk_0001', task_id: 't_12', step_id: 's_04', envelope_version: E.versionRef(env), checker: { kind: 'worker', id: 'w_l3', pool: 'L3' }, act, amount: null, step_deadline: add(T, 'PT8H'), window_end: env.validity.to, at: T });
  assert.ok(registry.validate('aifred:approval-token', token).ok, JSON.stringify(registry.validate('aifred:approval-token', token).errors));
  assert.equal(token.expires_at, add(T, 'PT8H'), 'the sooner of the two');
  assert.ok(keys.verify(token));
  assert.deepEqual(E.tokenState(token, { keys, envelope_version: 'env_12/v2', at: add(T, 'PT1H'), act }), { ok: true });
  assert.equal(E.tokenState(token, { keys, envelope_version: 'env_12/v3', at: add(T, 'PT1H') }).why, 'another envelope version');
  assert.equal(E.tokenState(token, { keys, envelope_version: 'env_12/v2', at: add(T, 'PT9H') }).why, 'expired');
  assert.equal(E.tokenState(token, { keys, envelope_version: 'env_12/v2', at: T, act: { ...act, form_hash: 'tampered' } }).why, 'the act differs from the one checked');
  const consumed = E.consumeToken(token, add(T, 'PT2H'));
  assert.equal(E.tokenState(consumed, { keys, envelope_version: 'env_12/v2', at: add(T, 'PT2H') }).why, 'consumed');
  assert.throws(() => E.consumeToken(consumed, add(T, 'PT3H')), /single-use/);
  assert.equal(E.tokenState(E.voidToken(token, T, 'envelope edited'), { keys, envelope_version: 'env_12/v2', at: T }).why, 'voided');
  assert.equal(E.tokenState({ ...token, amount_reserved: { currency: 'INR', amount: 5 } }, { keys, envelope_version: 'env_12/v2', at: T }).why, 'signature', 'a tampered token fails the signature');
  const later = E.issueToken({ ids, signer, check_id: 'chk_0002', task_id: 't_12', step_id: 's_04', envelope_version: 'env_12/v2', checker: { kind: 'worker', id: 'w_l3', pool: 'L3' }, act, step_deadline: add(T, 'P9D'), window_end: env.validity.to, at: T });
  assert.equal(later.expires_at, env.validity.to, 'an approval token is valid only while the window is open');
});

test('the substitutor holds the current and the previous public key: a rotation keeps the previous valid and nothing else', () => {
  const k1 = keyPair('k_in-2026q2');
  const k2 = keyPair('k_in-2026q3');
  const k3 = keyPair('k_in-2026q4');
  const ring = new KeyRing(k1);
  const ids = new Ids();
  const t1 = E.issueToken({ ids, signer: k1, check_id: 'chk_1', task_id: 't_1', step_id: 's_1', envelope_version: 'env_1/v2', checker: { kind: 'worker', id: 'w' }, act: 'a', step_deadline: add(T, 'PT1H'), window_end: add(T, 'PT1H'), at: T });
  ring.rotate(k2);
  assert.ok(ring.verify(t1), 'the previous key still verifies');
  ring.rotate(k3);
  assert.equal(ring.verify(t1), false, 'two keys, never three');
  assert.equal(verifyRecord(k2.publicKey, { ...t1 }), false);
});
