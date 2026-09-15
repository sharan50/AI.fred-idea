import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, readCell, lookup, stricter, predicateEvaluator } from '../lib/policy.mjs';
import { FLAG_ROWS, MARKETS, flagRowFor } from '../lib/vocab.mjs';
import { fixture, clone } from './helpers.mjs';

const ceiling = fixture('flags-ceiling.json');
const pilot = fixture('flags-pilot.json');

test('Table 3.5 as loaded: every keyed row has a cell for every market, every cell is to-verify, and the designed cells read as printed', () => {
  for (const table of [ceiling, pilot]) {
    for (const row of FLAG_ROWS) {
      for (const m of MARKETS) {
        const cell = lookup(table, m, row);
        assert.ok(cell, `${table.loaded}: ${row} ${m}`);
        assert.equal(cell.status, 'to-verify');
      }
    }
  }
  assert.equal(lookup(ceiling, 'IN', 'pay-under-cap').flag, 'bounce');
  assert.deepEqual(lookup(ceiling, 'UK', 'pay-under-cap'), { flag: 'delegated', condition: ['mandate-names-payee'], status: 'to-verify' });
  assert.deepEqual(lookup(ceiling, 'US', 'pay-under-cap'), { flag: 'delegated', condition: ['network-token-bound'], status: 'to-verify' });
  for (const m of MARKETS) {
    assert.equal(lookup(ceiling, m, 'sign').flag, 'bounce');
    assert.equal(lookup(ceiling, m, 'undergo-identification').flag, 'bounce');
    assert.deepEqual(lookup(ceiling, m, 'attest-fact').condition, ['fact-user-confirmed']);
    assert.deepEqual(lookup(ceiling, m, 'use-delegated-login').condition, ['portal-non-financial', 'login-delegated-in-envelope']);
    assert.deepEqual(lookup(ceiling, m, 'share-health-record').condition, ['consent-in-envelope']);
    assert.equal(lookup(ceiling, m, 'book-or-cancel').flag, 'delegated');
  }
  assert.equal(Object.values(ceiling.rows).flatMap((r) => Object.values(r)).filter((c) => c.flag === 'prohibited-pending').length, 0, 'in this edition no line reads prohibited pending');
});

test('the pilot narrows the ceiling: identity acts outside India read bounce and make a payment under the cap reads bounce everywhere', () => {
  for (const m of MARKETS) assert.equal(lookup(pilot, m, 'pay-under-cap').flag, 'bounce');
  for (const row of ['present-document', 'state-identity-number', 'complete-kyc-form', 'answer-security-questions', 'attest-fact', 'use-delegated-login', 'share-health-record']) {
    assert.equal(lookup(pilot, 'IN', row).flag, lookup(ceiling, 'IN', row).flag, `${row}: India keeps the ceiling`);
    assert.equal(lookup(pilot, 'UK', row).flag, 'bounce', row);
    assert.equal(lookup(pilot, 'US', row).flag, 'bounce', row);
  }
  for (const row of FLAG_ROWS) for (const m of MARKETS) assert.ok(stricter(lookup(pilot, m, row).flag, lookup(ceiling, m, row).flag) === lookup(pilot, m, row).flag, 'detracting is a flag; adding would be a rebuild');
});

test('a row that does not exist evaluates to bounce, and a delegated whose condition does not hold reads bounce', () => {
  const t = clone(ceiling);
  delete t.rows['book-or-cancel'];
  assert.equal(readCell(t, 'IN', 'book-or-cancel').reads, 'bounce');
  assert.equal(readCell(t, 'IN', 'book-or-cancel').row, 'book-or-cancel');
  const r = readCell(ceiling, 'IN', 'attest-fact', () => false);
  assert.equal(r.flag, 'delegated');
  assert.equal(r.condition_holds, false);
  assert.equal(r.reads, 'bounce');
  assert.equal(readCell(ceiling, 'IN', 'attest-fact', (p) => p === 'fact-user-confirmed').reads, 'delegated');
  assert.throws(() => readCell({ rows: { sign: { IN: { flag: 'maybe', condition: null, status: 'to-verify' } } } }, 'IN', 'sign'), /three values/);
  assert.throws(() => readCell({ rows: { sign: { IN: { flag: 'delegated', condition: ['the-user-seems-fine'], status: 'to-verify' } } } }, 'IN', 'sign'), /unknown predicate/);
});

test('an act toward an institution is looked up twice and the stricter result governs: prohibited pending over bounce over delegated', () => {
  assert.equal(stricter('delegated', 'bounce'), 'bounce');
  assert.equal(stricter('bounce', 'prohibited-pending'), 'prohibited-pending');
  assert.equal(stricter('delegated', 'delegated'), 'delegated');
  const inUserUkBank = evaluate(pilot, { act: 'state-identity-number', delegator_jurisdiction: 'IN', institution_market: 'UK' });
  assert.equal(inUserUkBank.under_delegator.reads, 'delegated');
  assert.equal(inUserUkBank.under_institution.reads, 'bounce');
  assert.equal(inUserUkBank.governing, 'bounce', "an India-market user's identity act on a UK institution reads the UK row and bounces");
  assert.equal(evaluate(ceiling, { act: 'state-identity-number', delegator_jurisdiction: 'IN', institution_market: 'UK' }).governing, 'delegated');
  const t = clone(ceiling);
  t.rows['complete-kyc-form'].US.flag = 'prohibited-pending';
  t.rows['complete-kyc-form'].US.condition = null;
  assert.equal(evaluate(t, { act: 'complete-kyc-form', delegator_jurisdiction: 'IN', institution_market: 'US' }).governing, 'prohibited-pending');
  const missing = clone(ceiling);
  delete missing.rows['complete-kyc-form'].US;
  assert.equal(evaluate(missing, { act: 'complete-kyc-form', delegator_jurisdiction: 'IN', institution_market: 'US' }).governing, 'bounce', 'a row missing in either evaluates to bounce');
});

test('a one-time code has no line in the table and no flag is consulted for it', () => {
  assert.equal(flagRowFor('enter-one-time-code'), null);
  const r = evaluate(ceiling, { act: 'enter-one-time-code', delegator_jurisdiction: 'IN', institution_market: 'IN' });
  assert.equal(r.consulted, false);
  assert.equal(r.governing, 'bounce');
});

test('the act-to-row mapping of Table 2.5: a health record consults share a health record, the committing acts consult book or cancel', () => {
  assert.equal(flagRowFor('present-document'), 'present-document');
  assert.equal(flagRowFor('present-document', { healthRecord: true }), 'share-health-record');
  for (const a of ['book', 'cancel', 'schedule', 'submit-application', 'accept-terms', 'file-document']) assert.equal(flagRowFor(a), 'book-or-cancel');
  assert.equal(flagRowFor('pay-under-cap'), 'pay-under-cap');
  assert.equal(flagRowFor('undergo-identification'), 'undergo-identification');
  assert.equal(evaluate(ceiling, { act: 'present-document', delegator_jurisdiction: 'IN', institution_market: 'IN', healthRecord: true }).row, 'share-health-record');
});

test('the six predicates are evaluated from the envelope record and the adapter\'s facts, never a free expression', () => {
  const envelope = { delegated_logins: [{ record: '{{credential.portal}}', scope: 's_07' }], health_record_consents: [{ record: '{{doc.referral}}', scope: 'task' }] };
  const party = { party_id: 'party_x', financial: false };
  const holds = predicateEvaluator({ envelope, stepId: 's_07', party, facts: [{ user_confirmed: true, quality_flag: null }], credentialAlias: '{{credential.portal}}', recordAlias: '{{doc.referral}}', rail: { task_id: 't_1', mandate: { payee: 'party_x' }, network_token: { merchant: 'party_x', task_id: 't_1', cap_bound: true } } });
  for (const p of ['portal-non-financial', 'login-delegated-in-envelope', 'consent-in-envelope', 'fact-user-confirmed', 'mandate-names-payee', 'network-token-bound']) assert.equal(holds(p), true, p);
  const other = predicateEvaluator({ envelope, stepId: 's_08', party: { party_id: 'party_x', financial: true }, facts: [{ user_confirmed: true, quality_flag: 'contradicted' }], credentialAlias: '{{credential.portal}}', recordAlias: '{{doc.other}}', rail: { task_id: 't_1', mandate: { payee: 'party_y' }, network_token: { merchant: 'party_x', task_id: 't_2', cap_bound: true } } });
  for (const p of ['portal-non-financial', 'login-delegated-in-envelope', 'consent-in-envelope', 'fact-user-confirmed', 'mandate-names-payee', 'network-token-bound']) assert.equal(other(p), false, p);
  assert.equal(predicateEvaluator({})('fact-user-confirmed'), false, 'no fact, no attestation');
  assert.throws(() => holds('user-seems-trustworthy'), /unknown predicate/);
});
