import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Ledger, render, lint, LedgerError, USE_VERBS } from '../lib/ledger.mjs';
import { Ids } from '../lib/ids.mjs';
import { fixture } from './helpers.mjs';

const D = (hhmm) => `2026-09-02T${hhmm}:00+05:30`;

function ledger() {
  return new Ledger({ ids: new Ids() });
}

test('the printed record l_12_0007 renders to the printed line', () => {
  const l = ledger();
  const e = l.append({ ...fixture('task-12/ledger-l12-0007.json') });
  assert.equal(render(e), "15:09 {{dob}} typed into Max Healthcare's appointment form, in a browser we run. Placed by the system. No person saw it.");
  assert.equal(e.ledger_id, 'l_12_0001');
  assert.equal(e.prev_hash, null);
});

test('the afternoon of 03, 8.4, line by line, rendered from fields', () => {
  const l = ledger();
  const base = { task_id: 't_12', written_by: 'substitution-component', seen_by: 'no person', policy_ref: null, envelope_version: 'env_12/v2' };
  const lines = [
    [{ ...base, step_id: null, at: D('14:02'), alias: '{{pan}}', event_type: 'received', use: 'received from your message', surface: 'vault-edge-proxy', written_by: 'vault-edge-proxy', outcome: null }, '14:02 {{pan}} received from your message and stored in the vault. No person saw it.'],
    [{ ...base, step_id: null, at: D('14:03'), alias: '{{doc.address-proof}}', event_type: 'received', use: 'received from DigiLocker, which you authorised on your device', surface: 'vault-edge-proxy', written_by: 'vault-edge-proxy' }, '14:03 {{doc.address-proof}} received from DigiLocker, which you authorised on your device, and stored in the vault. No person saw it.'],
    [{ ...base, step_id: 's_02', at: D('14:32'), alias: '{{pan}}', event_type: 'placed', use: "used to fill HDFC Bank's account-opening form", surface: 'managed-browser', party: 'HDFC Bank', placed_by: 'system', outcome: 'placed', placement_id: 'pl_000001' }, "14:32 {{pan}} used to fill HDFC Bank's account-opening form, in a browser we run. Placed by the system. No person saw it."],
    [{ ...base, step_id: 's_02', at: D('14:32'), alias: '{{pan}}', event_type: 'shown-as-dots', use: '', surface: 'console', party: 'HDFC Bank', seen_by: 'worker: dots', written_by: 'browser-controller' }, '14:32 A worker saw the form with {{pan}} shown as dots.'],
    [{ ...base, step_id: 's_02', at: D('14:33'), alias: null, event_type: 'shown-as-dots', form: 'checker', use: '', surface: 'console', seen_by: 'checker: masked stream', written_by: 'browser-controller' }, '14:33 A checker saw the masked stream for step 2.'],
    [{ ...base, step_id: 's_02', at: D('14:33'), alias: '{{pan}}', event_type: 'echo-masked', use: '', surface: 'managed-browser', party: 'HDFC Bank', outcome: 'masked', written_by: 'browser-controller' }, "14:33 HDFC Bank's confirmation page displayed {{pan}}. Masked before any person saw it."],
    [{ ...base, step_id: 's_02', at: D('14:33'), alias: null, event_type: 'evidence-stored', use: '', surface: 'evidence-store', outcome: 'masked', artefact_ref: 'ev_12_02_frame', written_by: 'evidence-pipeline' }, '14:33 Evidence of this step was redacted, checked by a second pass and stored. No raw copy was kept.'],
    [{ ...base, step_id: 's_03', at: D('14:35'), alias: null, event_type: 'bounced', form: 'code-relayed', use: '', surface: 'device', placed_by: 'user', seen_by: 'worker: dots', written_by: 'browser-controller' }, '14:35 You entered a one-time code yourself, on your device; the worker saw the field as dots.'],
    [{ ...base, step_id: 's_04', at: D('14:40'), alias: '{{dob}}', event_type: 'placed', use: "typed into Max Healthcare's appointment form", surface: 'managed-browser', party: "Max Healthcare's appointment portal", placed_by: 'system', outcome: 'placed', placement_id: 'pl_000002' }, "14:40 {{dob}} typed into Max Healthcare's appointment form, in a browser we run. Placed by the system. No person saw it."],
    [{ ...base, step_id: 's_03', at: D('14:41'), alias: null, event_type: 'bounced', form: 'do-yourself', use: 'asked for by a date of birth', surface: 'telephony', party: 'The booking line', written_by: 'telephony-controller' }, '14:41 The booking line asked for a date of birth. Not given on a call; the step went to your own device.'],
    [{ ...base, step_id: 's_06', at: D('15:10'), alias: '{{account.hdfc}}', event_type: 'placed', use: 'sent to HDFC Bank in an email', surface: 'mail-relay', party: 'HDFC Bank', placed_by: 'system', seen_by: 'worker: alias only', outcome: 'placed', placement_id: 'pl_000003' }, '15:10 {{account.hdfc}} sent to HDFC Bank in an email, through our relay. Placed by the system. The worker who wrote it saw the alias only.'],
    [{ ...base, step_id: null, at: D('15:22'), alias: '{{account.new-hdfc}}', event_type: 'received', use: "received in HDFC Bank's reply", surface: 'vault-edge-proxy', written_by: 'hash-service' }, "15:22 {{account.new-hdfc}} received in HDFC Bank's reply and stored in the vault. No person saw it."],
    [{ ...base, step_id: 's_06', at: D('15:30'), alias: '{{pan}}', event_type: 'refused', form: 'worker-request', use: 'requested by console', surface: 'console', outcome: 'refused', written_by: 'task-service' }, '15:30 A worker asked to see {{pan}}. Refused; nothing was shown. QA has been told.'],
  ];
  for (const [entry, expected] of lines) {
    const e = l.append(entry);
    assert.equal(render(e), expected);
  }
  assert.equal(l.linesFor('t_12').length, lines.length);
  assert.deepEqual(l.verifyChain(), { ok: true });
});

test('a line the system cannot make true is a line it is not allowed to write', () => {
  const l = ledger();
  const good = { task_id: 't_12', step_id: 's_04', at: D('15:09'), alias: '{{dob}}', event_type: 'placed', use: "typed into Max Healthcare's appointment form", surface: 'managed-browser', party: 'Max Healthcare', placed_by: 'system', seen_by: 'no person', outcome: 'placed', placement_id: 'pl_000001', written_by: 'substitution-component' };
  assert.doesNotThrow(() => l.append(good));
  assert.throws(() => l.append({ ...good, use: 'typed into the form on 14/03/1985' }), /run of four or more digits/);
  assert.throws(() => l.append({ ...good, party: 'Max Healthcare (handled by w_0x)' }), /internal identifier/);
  assert.throws(() => l.append({ ...good, outcome: 'not-confirmed', form: 'not-confirmed' }), /Placed by the system/);
  assert.throws(() => l.append({ ...good, use: 'somehow handled by the form' }), /verb of the closed list/);
  assert.throws(() => l.append({ ...good, step_id: null }), /carries its step/);
  assert.throws(() => l.append({ ...good, alias: '{{otp}}' }), LedgerError);
  assert.throws(() => l.append({ ...good, written_by: 'a person' }), LedgerError);
  assert.throws(() => l.append({ ...good, surface: 'telephony' }), LedgerError, 'placed in a browser field or through the relay, never on a call');
  assert.throws(() => l.append({ ...good, party: 'the last four are 4471' }), /partial or a length|run of four/);
  assert.ok(USE_VERBS.includes('typed into'));
});

test('the ledger is append-only: an edit breaks every hash after it', () => {
  const l = ledger();
  const base = { task_id: 't_12', step_id: null, alias: '{{pan}}', event_type: 'received', use: 'received from your message', surface: 'vault-edge-proxy', seen_by: 'no person', written_by: 'vault-edge-proxy' };
  l.append({ ...base, at: D('14:02') });
  l.append({ ...base, at: D('14:03'), alias: '{{dob}}' });
  l.append({ ...base, at: D('14:04'), alias: '{{phone}}' });
  assert.deepEqual(l.verifyChain(), { ok: true });
  l.entries[1].use = 'received from a worker';
  assert.deepEqual(l.verifyChain(), { ok: false, at: 2 });
});

test('the linter names what a rendered line can never contain', () => {
  assert.deepEqual(lint('15:09 {{dob}} typed into the form. No person saw it.', { alias: '{{dob}}' }), []);
  assert.ok(lint('15:09 {{dob}} typed 19850314 into the form.').includes('a run of four or more digits'));
  assert.ok(lint('15:09 Priya saw it (w_0x).').includes('an internal identifier'));
  assert.ok(lint('15:09 the last four are 4471.').some((p) => /partial|digits/.test(p)));
  assert.ok(lint('15:09 Client 4471 asked.').includes('a floor pseudonym'));
  assert.ok(lint('15:09 no full stop').includes('does not end with a full stop'));
});
