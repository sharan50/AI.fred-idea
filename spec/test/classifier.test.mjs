import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, route, POINT_OF_NO_RETURN_TEST, DEFAULT_SCOPE, aiConditions } from '../lib/classifier.mjs';
import * as E from '../lib/envelope.mjs';
import { Device } from '../lib/signing.mjs';
import { loadGraph } from '../vocab/derive.mjs';
import { add } from '../lib/time.mjs';
import { fixture, clone } from './helpers.mjs';

const device = new Device('dev_12a');
const sign = (r) => device.sign(r);
const T = '2026-09-02T14:35:00+05:30';
const AT = add(T, 'PT10M');
const catalogue = new Map(fixture('catalogue.json').map((e) => [e.step_type, e]));
const parties = new Map(fixture('parties.json').map((p) => [p.party_id, p]));
const ceiling = fixture('flags-ceiling.json');
const pilot = fixture('flags-pilot.json');

function env12(mutate = () => {}) {
  const v1 = E.propose({ envelope_id: 'env_12', task_id: 't_12', spend_cap: { currency: 'INR', amount: 0 }, contactable_parties: [{ party: 'party_max-healthcare', scope: 'task' }], committable_acts: [{ act: 'schedule', scope: 'task' }, { act: 'cancel', scope: 'task' }], delegated_identity_acts: [{ act: 'attest-fact', scope: 'task' }, { act: 'present-document', scope: 'task' }], validity: { from: T, to: add(T, 'P7D') } });
  mutate(v1);
  return E.authorise(v1, { device: 'dev_12a', at: T, sign });
}

const holdsFactConfirmed = (p) => p === 'fact-user-confirmed';

function run(step, over = {}) {
  return classify({ step, catalogue, parties, envelope: over.envelope || env12(), flags: over.flags || pilot, scope: over.scope || DEFAULT_SCOPE, market: 'IN', at: AT, holds: over.holds || holdsFactConfirmed, ...over });
}

const plan = fixture('task-12/plan-p12-1.json');
const step = (id) => clone(plan.steps.find((s) => s.step_id === id));

test('the point-of-no-return test is the map\'s verbatim sentence, and two questions give four routes', () => {
  assert.equal(POINT_OF_NO_RETURN_TEST, loadGraph().nodes.find((n) => n.id === 'inv-point-of-no-return-test').text);
  assert.equal(route('reversible', true), 'execute');
  assert.equal(route('reversible', false), 'extension-request');
  assert.equal(route('irreversible', true), 'dual-control');
  assert.equal(route('irreversible', false), 'bounce');
});

test('task 12 classifies as the pages say: the booking call is human and reversible, the form steps are ai, the referral share is the user\'s', () => {
  const s02 = run(step('s_02'));
  assert.equal(s02.class, 'ai');
  assert.equal(s02.route, 'execute');
  const s03 = run(step('s_03'));
  assert.deepEqual([s03.class, s03.reversibility, s03.route, s03.surface], ['human', 'reversible', 'execute', 'telephony']);
  assert.deepEqual(s03.policy, { jurisdiction: 'IN', institution_market: 'IN', delegator: 'user', act: 'attest-fact', flag: 'delegated' }, 'the policy block of the printed step record');
  assert.equal(s03.executor.pool, 'L1');
  const s04 = run(step('s_04'));
  assert.deepEqual([s04.class, s04.route, s04.surface], ['ai', 'execute', 'browser']);
  const s05 = run(step('s_05'), { healthRecord: true });
  assert.deepEqual([s05.class, s05.route, s05.bounce_form], ['user', 'bounce', 'user-act']);
  assert.equal(s05.policy.flag, 'bounce', 'share a health record is delegated only with the record\'s consent in the envelope');
  const s05c = run(step('s_05'), { healthRecord: true, envelope: env12((v) => { v.health_record_consents = [{ record: '{{doc.referral}}', scope: 'task' }]; }), holds: (p) => p === 'consent-in-envelope' || p === 'fact-user-confirmed' });
  assert.equal(s05c.policy.flag, 'delegated');
  assert.deepEqual([s05c.class, s05c.route], ['human', 'dual-control'], 'delegated, irreversible and inside: the other party checks; the entry lists no ai');
  const s06 = run(step('s_06'));
  assert.deepEqual([s06.class, s06.route], ['ai', 'execute']);
});

test('an undo route counts only where the envelope admits the undo\'s act: without cancel the booking is irreversible and dual-controlled', () => {
  const r = run(step('s_03'), { envelope: env12((v) => { v.committable_acts = [{ act: 'schedule', scope: 'task' }]; }) });
  assert.equal(r.reversibility, 'irreversible');
  assert.equal(r.route, 'dual-control');
  assert.equal(r.class, 'human');
  assert.match(r.reasons.join(' '), /undo route needs cancel/);
});

test('an unknown step type bounces in the do-this-yourself form and requests a catalogue entry', () => {
  const s = { ...step('s_02'), step_type: 'IN/health/find-a-second-opinion', act: 'schedule' };
  const r = run(s);
  assert.deepEqual([r.class, r.reversibility, r.route, r.bounce_form, r.catalogue_request], ['user', 'irreversible', 'bounce', 'do-yourself', true]);
});

test('the three user cases in order: a user-only factor consults no flag; a bounce flag wins even where the user ticked the act; irreversible and outside bounces', () => {
  const otp = { ...step('s_02'), step_id: 's_09', step_type: 'IN/any/enter-one-time-code', act: 'enter-one-time-code', identity_acts: [], party: { id: 'party_hdfc-bank' } };
  const hostile = clone(pilot);
  for (const row of Object.values(hostile.rows)) for (const m of ['IN', 'UK', 'US']) row[m] = { flag: 'prohibited-pending', condition: null, status: 'to-verify' };
  const r1 = run(otp, { flags: hostile });
  assert.deepEqual([r1.class, r1.bounce_form, r1.lookups.length], ['user', 'one-time-code', 0]);
  const signing = { ...step('s_04'), step_id: 's_10', act: 'sign', identity_acts: [], fields: [] };
  const r2 = run(signing, { envelope: env12((v) => { v.delegated_identity_acts.push({ act: 'sign', scope: 'task' }); }) });
  assert.equal(r2.class, 'user');
  assert.equal(r2.policy.flag, 'bounce');
  assert.equal(r2.policy.act, 'sign');
  const submit = { ...step('s_04'), step_id: 's_11', step_type: 'IN/banking/submit-account-opening-form', template: 'IN/banking/submit-account-opening-form@v2', act: 'submit-application', identity_acts: [], fields: [], party: { id: 'party_hdfc-bank' } };
  const r3 = run(submit);
  assert.deepEqual([r3.class, r3.reversibility, r3.route, r3.bounce_form], ['user', 'irreversible', 'bounce', 'approval']);
  assert.match(r3.inside.failed.join(' '), /party_hdfc-bank is not contactable/);
  const stepScoped = env12((v) => {
    v.contactable_parties.push({ party: 'party_hdfc-bank', scope: 's_11' });
    v.committable_acts.push({ act: 'submit-application', scope: 's_11' });
  });
  const r4 = run(submit, { envelope: stepScoped });
  assert.deepEqual([r4.class, r4.route], ['ai', 'dual-control'], 'a one-tap approval scoped to the step brings it inside; it fires under dual control');
  const r5 = run({ ...submit, step_id: 's_12' }, { envelope: stepScoped });
  assert.equal(r5.route, 'bounce', 'the step-scoped line admits only its step');
});

test('prohibited pending closes the step refused-policy before anyone attempts it', () => {
  const t = clone(pilot);
  t.rows['complete-kyc-form'].IN = { flag: 'prohibited-pending', condition: null, status: 'to-verify' };
  const kyc = { ...step('s_04'), step_id: 's_13', step_type: 'IN/banking/fill-account-opening-form', template: 'IN/banking/fill-account-opening-form@v2', act: 'complete-kyc-form', identity_acts: [], fields: ['{{pan}}'], party: { id: 'party_hdfc-bank' } };
  const r = run(kyc, { flags: t, envelope: env12((v) => { v.contactable_parties.push({ party: 'party_hdfc-bank', scope: 'task' }); v.delegated_identity_acts.push({ act: 'complete-kyc-form', scope: 'task' }); }) });
  assert.equal(r.class, null);
  assert.deepEqual(r.outcome, { code: 'refused-policy', policy_reference: 'IN/complete-kyc-form' });
});

test('ai needs all four conditions; any one failing makes the step human, and an irreversible human step goes to the pool the scope block allows', () => {
  const base = env12((v) => { v.contactable_parties.push({ party: 'party_hdfc-bank', scope: 'task' }); v.committable_acts.push({ act: 'submit-application', scope: 'task' }); });
  const submit = { ...step('s_04'), step_id: 's_11', step_type: 'IN/banking/submit-account-opening-form', template: 'IN/banking/submit-account-opening-form@v2', act: 'submit-application', identity_acts: [], fields: [], party: { id: 'party_hdfc-bank' } };
  const r = run(submit, { envelope: base });
  assert.deepEqual([r.class, r.route], ['ai', 'dual-control']);
  const noSurface = run(submit, { envelope: base, scope: { ...DEFAULT_SCOPE, ai_surfaces: [] } });
  assert.equal(noSurface.class, 'human');
  assert.equal(noSurface.executor.pool, 'L3', 'L3 alone under the pilot\'s scope block');
  const notNavigable = new Map(parties);
  notNavigable.set('party_hdfc-bank', { ...parties.get('party_hdfc-bank'), machine_navigable: {} });
  assert.equal(classify({ step: submit, catalogue, parties: notNavigable, envelope: base, flags: pilot, market: 'IN', at: AT, holds: holdsFactConfirmed }).class, 'human');
  const noVerifier = new Map(catalogue);
  noVerifier.set(submit.step_type, { ...catalogue.get(submit.step_type), verifier: null });
  assert.equal(classify({ step: submit, catalogue: noVerifier, parties, envelope: base, flags: pilot, market: 'IN', at: AT, holds: holdsFactConfirmed }).class, 'human');
  const noAi = new Map(catalogue);
  noAi.set(submit.step_type, { ...catalogue.get(submit.step_type), executor_classes: ['human'] });
  assert.equal(classify({ step: submit, catalogue: noAi, parties, envelope: base, flags: pilot, market: 'IN', at: AT, holds: holdsFactConfirmed }).class, 'human');
  assert.deepEqual(aiConditions({ entry: catalogue.get('IN/health/add-appointment-to-calendar'), party: null, surface: 'browser', scope: DEFAULT_SCOPE, step: step('s_06') }), { ok: true, failed: [] });
});

test('reversible and outside becomes an extension request: nobody executes outside the envelope', () => {
  const r = run(step('s_04'), { envelope: env12((v) => { v.contactable_parties = []; }) });
  assert.equal(r.route, 'extension-request');
  assert.equal(r.reversibility, 'reversible');
  assert.ok(['ai', 'human'].includes(r.class));
  const unsigned = E.propose({ envelope_id: 'env_12', task_id: 't_12', spend_cap: { currency: 'INR', amount: 0 }, contactable_parties: [{ party: 'party_max-healthcare', scope: 'task' }], committable_acts: [{ act: 'schedule', scope: 'task' }, { act: 'cancel', scope: 'task' }], delegated_identity_acts: [{ act: 'attest-fact', scope: 'task' }], validity: { from: T, to: add(T, 'P7D') } });
  const r2 = run(step('s_04'), { envelope: unsigned });
  assert.equal(r2.route, 'extension-request', 'version 1 carries no authority, so every step is outside');
  const expired = run(step('s_04'), { at: add(T, 'P8D') });
  assert.equal(expired.route, 'extension-request', 'past the window nothing is inside');
});

test('a mail step is the user\'s without the mailbox send scope; with it, the scope block decides whether the harness composes', () => {
  const mail = { ...step('s_04'), step_id: 's_14', step_type: 'UK/legal/send-representation-by-mail', template: 'UK/legal/send-representation-by-mail@v1', act: 'file-document', identity_acts: ['attest-fact'], fields: ['{{name}}', '{{doc.representation}}'], party: { id: 'party_barnet-council' }, surface: 'relay' };
  const env = env12((v) => { v.contactable_parties.push({ party: 'party_barnet-council', scope: 'task' }); v.committable_acts.push({ act: 'file-document', scope: 'task' }); });
  const r1 = run(mail, { envelope: env, flags: ceiling });
  assert.deepEqual([r1.class, r1.bounce_form], ['user', 'do-yourself']);
  const r2 = run(mail, { envelope: env, flags: ceiling, consents: { mailbox_send: true } });
  assert.deepEqual([r2.class, r2.route, r2.surface], ['human', 'dual-control', 'relay']);
  assert.equal(r2.policy.institution_market, 'UK');
  const r3 = run(mail, { envelope: env, flags: pilot, consents: { mailbox_send: true } });
  assert.equal(r3.class, 'user', 'the UK row for attest-fact reads bounce in the pilot');
});

test("a dependant's aliases are flagged under the jurisdiction her delegation record carries, never the user's", () => {
  const kyc = { ...step('s_04'), step_id: 's_15', step_type: 'IN/banking/fill-account-opening-form', template: 'IN/banking/fill-account-opening-form@v2', act: 'complete-kyc-form', identity_acts: [], fields: ['{{pan.mother}}'], party: { id: 'party_hdfc-bank' } };
  const env = env12((v) => { v.contactable_parties.push({ party: 'party_hdfc-bank', scope: 'task' }); v.delegated_identity_acts.push({ act: 'complete-kyc-form', scope: 'task' }); });
  const delegation = { delegation_id: 'del_0001', delegator: 'p_mother', jurisdiction: 'UK', aliases: ['{{pan.mother}}'], revoked_at: null };
  const r = run(kyc, { envelope: env, delegations: [delegation] });
  assert.equal(r.policy.jurisdiction, 'UK');
  assert.equal(r.policy.delegator, 'p_mother');
  assert.equal(r.class, 'user', 'UK identity acts bounce in the pilot');
  const r2 = run(kyc, { envelope: env, delegations: [delegation], flags: ceiling });
  assert.equal(r2.class, 'ai');
  assert.equal(r2.delegation, 'del_0001');
});

test('make a payment under the cap: the pilot bounces everywhere; the ceiling delegates in the UK on a mandate, and the debit is then dual-controlled inside the cap', () => {
  const pay = { ...step('s_04'), step_id: 's_16', step_type: 'IN/health/pay-consultation-fee', template: 'IN/health/pay-consultation-fee@v1', act: 'pay-under-cap', identity_acts: [], fields: ['{{card.primary}}'], amount: { currency: 'INR', amount: 800 } };
  const env = env12((v) => { v.spend_cap = { currency: 'INR', amount: 1000 }; v.committable_acts.push({ act: 'pay-under-cap', scope: 'task' }); });
  const r1 = run(pay, { envelope: env });
  assert.deepEqual([r1.class, r1.bounce_form, r1.policy.flag], ['user', 'user-act', 'bounce']);
  const ukParties = new Map(parties);
  ukParties.set('party_max-healthcare', { ...parties.get('party_max-healthcare'), market: 'UK' });
  const r2 = classify({ step: pay, catalogue, parties: ukParties, envelope: env, flags: ceiling, market: 'UK', at: AT, holds: (p) => p === 'mandate-names-payee' });
  assert.deepEqual([r2.class, r2.reversibility, r2.route], ['ai', 'irreversible', 'dual-control']);
  const r3 = classify({ step: pay, catalogue, parties: ukParties, envelope: env, flags: ceiling, market: 'UK', at: AT, holds: (p) => p === 'mandate-names-payee', committed: { fired: 300, reserved: 0 } });
  assert.equal(r3.route, 'bounce', 'irreversible and beyond the remaining cap: outside the envelope');
});
