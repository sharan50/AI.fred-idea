import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, onboard, signedEnvelope, stepS04, contextFor, stampFor, browserTarget, placementRequest, deps, driver, T, AT } from './world.mjs';
import { outcomeForReceipt, ALIAS_SURFACES, aliasOwner } from '../lib/substitutor.mjs';
import * as E from '../lib/envelope.mjs';
import { add } from '../lib/time.mjs';
import { registry } from './helpers.mjs';
import { signRecord } from '../lib/signing.mjs';
import { SUBSTITUTOR_CHECKS } from '../lib/vocab.mjs';

function world() {
  const w = buildWorld();
  const aliases = onboard(w, ['name', 'dob', 'phone', 'pan', 'aadhaar', 'card', 'account', 'credential']);
  const envelope = signedEnvelope(w);
  const step = stepS04();
  return { w, aliases, envelope, step };
}

test('one placement, boundary by boundary: the value crosses into the surface on one message, and nothing that comes back carries it', () => {
  const { w, envelope, step } = world();
  const d = deps(w);
  const req = placementRequest(w, { step, envelope, alias: '{{dob}}' });
  assert.ok(registry.validate('aifred:placement-request', req).ok, JSON.stringify(registry.validate('aifred:placement-request', req).errors));
  assert.ok(registry.validate('aifred:step-context', req.context).ok, JSON.stringify(registry.validate('aifred:step-context', req.context).errors));
  const result = w.substitutor.place(req, d);
  assert.equal(result.receipt.status, 'placed');
  assert.ok(registry.validate('aifred:placement-receipt', result.receipt).ok, JSON.stringify(registry.validate('aifred:placement-receipt', result.receipt).errors));
  assert.equal(d.driver.log.length, 1);
  assert.equal(d.driver.log[0].value, '14/03/1985', 'the surface is where the value legitimately exists');
  assert.ok(!JSON.stringify(result).includes('1985'), 'the receipt never carries the value, its length, a partial or a digest');
  const lines = w.ledger.linesFor('t_12');
  assert.equal(lines.length, 2, 'placing, then placed');
  assert.match(lines[0], /^\d\d:\d\d \{\{dob\}\} being placed into Max Healthcare's form, in a browser we run\.$/);
  assert.match(lines[1], /^\d\d:\d\d \{\{dob\}\} typed into Max Healthcare's form, in a browser we run\. Placed by the system\. No person saw it\.$/);
  assert.equal(w.ledger.recordsFor('t_12')[1].placement_id, result.receipt.placement_id);
  assert.equal(w.vault.accessLog.length, 1);
  assert.equal(w.vault.accessLog[0].placement_id, result.receipt.placement_id, "every detokenisation in the provider's log matches a placement id");
  assert.deepEqual(result.registry_entry, { placement_id: result.receipt.placement_id, alias: '{{dob}}', rectangle: { x: 100, y: 200, w: 180, h: 24 } });
});

test('the ten checks, in order: the first failure names the check and nothing else, and a refused line is written', () => {
  const { w, envelope, step } = world();
  const d = deps(w);
  const refused = (req, over = {}) => {
    const r = w.substitutor.place(req, { ...d, ...over });
    assert.equal(r.receipt.status, 'refused', r.detail);
    return r.receipt.check;
  };
  // 1 the context signature is valid and inside its validity
  const tampered = placementRequest(w, { step, envelope, alias: '{{dob}}' });
  tampered.context.fields = [...tampered.context.fields, '{{pan}}'];
  assert.equal(refused(tampered), 'context-signature');
  const stale = placementRequest(w, { step, envelope, alias: '{{dob}}', at: add(AT, 'PT3M'), context: contextFor(w, { step, envelope, at: AT }) });
  assert.equal(refused(stale), 'context-signature');
  // 2 the step is running and the caller is the controller of its surface
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}' }), { stepState: () => 'ready' }), 'step-running-and-caller');
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', caller: 'console' })), 'step-running-and-caller');
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', caller: 'telephony-controller' })), 'step-running-and-caller');
  // 3 the alias is in the field list
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{pan}}', target: browserTarget('PAN') })), 'alias-in-field-list');
  // 4 every delegation record the alias's owner references is live
  const mother = stepS04({ fields: ['{{dob.mother}}'] });
  w.vault.tokenise(w.proxy.cred, { user: w.user, cls: 'personal-fact', type: 'dob', qualifier: 'mother', value: '01/01/1950', entered_by: 'device-form', at: T });
  assert.equal(refused(placementRequest(w, { step: mother, envelope, alias: '{{dob.mother}}' })), 'delegations-live');
  // A context naming a delegation that has ended is already dead: it expires no later than her delegation's validity end.
  assert.equal(refused(placementRequest(w, { step: mother, envelope, alias: '{{dob.mother}}', ctxOver: { delegation: { delegation_id: 'del_0001', delegator: 'p_mother', validity_end: T } } })), 'context-signature');
  w.substitutor.isDelegationLive = () => false;
  assert.equal(refused(placementRequest(w, { step: mother, envelope, alias: '{{dob.mother}}', ctxOver: { delegation: { delegation_id: 'del_0001', delegator: 'p_mother', validity_end: add(AT, 'P30D') } } })), 'delegations-live', 'revocation from her device voids it at once');
  w.substitutor.isDelegationLive = null;
  // 5 the class admits the surface and the flag reads delegated under both jurisdictions
  assert.equal(refused(placementRequest(w, { step: stepS04({ fields: ['{{aadhaar}}'] }), envelope, alias: '{{aadhaar}}', target: browserTarget('Aadhaar number') })), 'class-and-flag');
  const bounced = placementRequest(w, { step, envelope, alias: '{{dob}}' });
  bounced.context.policy.under_institution.reads = 'bounce';
  bounced.context.signature = signRecord(w.signer.privateKey, bounced.context);
  assert.equal(refused(bounced), 'class-and-flag');
  const cred = placementRequest(w, { step: stepS04({ fields: ['{{credential.portal}}'], surface: 'relay' }), envelope, alias: '{{credential.portal}}', surface: 'relay', caller: 'mail-relay', target: { message_id: 'm1', occurrences: [0], recipient_domain: 'maxhealthcare.in' } });
  assert.equal(refused(cred), 'class-and-flag', 'a credential is admitted to the browser only');
  // 6 the envelope admits the act, the window is open, the cap holds and the target belongs to a contactable party
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', target: browserTarget('Date of birth', 'text', { origin: 'https://evil.example' }) })), 'envelope-admits');
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', target: browserTarget('Date of birth', 'text', { certificate_valid: false }) })), 'envelope-admits');
  const noParty = signedEnvelope(w, (v) => { v.contactable_parties = []; });
  assert.equal(refused(placementRequest(w, { step, envelope: noParty, alias: '{{dob}}' })), 'envelope-admits');
  const late = add(T, 'P8D');
  const lateCtx = contextFor(w, { step, envelope: { ...envelope, validity: { from: T, to: add(late, 'PT1H') } }, at: late });
  lateCtx.envelope.validity = envelope.validity;
  lateCtx.signature = signRecord(w.signer.privateKey, lateCtx);
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', at: late, context: lateCtx, stamp: stampFor(w, envelope, late) })), 'envelope-admits');
  const overCap = placementRequest(w, { step, envelope, alias: '{{dob}}', ctxOver: { money: { amount: { currency: 'INR', amount: 500 }, remaining_cap: { currency: 'INR', amount: 400 } } } });
  assert.equal(refused(overCap), 'envelope-admits');
  // 7 the envelope version carries the user's device signature
  const unsigned = placementRequest(w, { step, envelope, alias: '{{dob}}', ctxOver: {} });
  unsigned.context.envelope.device_signature = null;
  unsigned.context.signature = signRecord(w.signer.privateKey, unsigned.context);
  assert.equal(refused(unsigned), 'version-signed');
  // 8 the step is reversible with a stamp, or holds a current, unconsumed token naming this version
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', stamp: null })), 'reversible-or-token');
  const oldStamp = stampFor(w, { ...envelope, version: 1 });
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', stamp: oldStamp })), 'reversible-or-token');
  const irreversible = stepS04({ reversibility: 'irreversible', route: 'dual-control' });
  assert.equal(refused(placementRequest(w, { step: irreversible, envelope, alias: '{{dob}}' })), 'reversible-or-token');
  const token = E.issueToken({ ids: w.ids, signer: w.signer, check_id: 'chk_0001', task_id: 't_12', step_id: 's_04', envelope_version: 'env_12/v2', checker: { kind: 'worker', id: 'w_l3', pool: 'L3' }, act: 'submit', step_deadline: add(AT, 'PT8H'), window_end: envelope.validity.to, at: AT });
  assert.equal(refused(placementRequest(w, { step: irreversible, envelope, alias: '{{dob}}', approval_token: E.consumeToken(token, AT) })), 'reversible-or-token');
  assert.equal(refused(placementRequest(w, { step: irreversible, envelope, alias: '{{dob}}', approval_token: { ...token, envelope_version: 'env_12/v3' } })), 'reversible-or-token');
  // 9 the target is plausible for the type
  assert.equal(refused(placementRequest(w, { step: stepS04({ fields: ['{{card.primary}}', '{{dob}}'] }), envelope, alias: '{{dob}}', target: browserTarget('Card number') })), 'target-plausible');
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}', target: browserTarget('Date of birth', 'upload') })), 'target-plausible');
  // 10 the first placement for this step, alias and target, or the runner's retry token
  const first = w.substitutor.place(placementRequest(w, { step, envelope, alias: '{{dob}}' }), d);
  assert.equal(first.receipt.status, 'placed');
  assert.equal(refused(placementRequest(w, { step, envelope, alias: '{{dob}}' })), 'first-or-retry-token');
  assert.equal(w.substitutor.place(placementRequest(w, { step, envelope, alias: '{{dob}}', retry_token: 'rt_0001' }), d).receipt.status, 'placed');
  assert.equal(SUBSTITUTOR_CHECKS.length, 10);
  const refusedLines = w.ledger.recordsFor('t_12').filter((e) => e.event_type === 'refused');
  assert.ok(refusedLines.length >= 20, 'every refusal wrote its line');
  assert.equal(w.vault.accessLog.length, 2, 'a refused request never reaches the vault');
});

test('the line is written ahead of the injection: a substitutor that cannot write the ledger cannot place', () => {
  const { w, envelope, step } = world();
  const d = deps(w);
  w.ledger.append = () => { throw new Error('ledger unavailable'); };
  const r = w.substitutor.place(placementRequest(w, { step, envelope, alias: '{{dob}}' }), d);
  assert.equal(r.receipt.status, 'failed');
  assert.equal(r.receipt.reason, 'ledger-unavailable');
  assert.equal(w.vault.accessLog.length, 0);
  assert.equal(d.driver.log.length, 0);
});

test('a placement the surface does not confirm inside the window closes not confirmed with a retry token; the field is never read back', () => {
  const { w, envelope, step } = world();
  const d = { ...deps(w), driver: driver({ confirm: false }) };
  const r = w.substitutor.place(placementRequest(w, { step, envelope, alias: '{{dob}}' }), d);
  assert.equal(r.receipt.status, 'not-confirmed');
  assert.equal(r.receipt.reason, 'window-expired');
  assert.match(w.ledger.linesFor('t_12').at(-1), /could not be placed; the field was cleared\. No person saw it\.$/);
  const outcome = outcomeForReceipt(r, { ids: w.ids, step });
  assert.equal(outcome.code, 'failed-retryable');
  assert.match(outcome.retry_token, /^rt_/);
  const slow = { ...deps(w), driver: driver({ confirm: true, delayMs: 180000 }) };
  const r2 = w.substitutor.place(placementRequest(w, { step, envelope, alias: '{{dob}}', retry_token: outcome.retry_token }), slow);
  assert.equal(r2.receipt.status, 'not-confirmed', 'a confirmation after the window is no confirmation');
});

test('a committing placement needs the token whatever the classification, consumes it and writes the fired marker before the first character leaves; not confirmed then closes failed-final with no retry', () => {
  const { w, envelope, step } = world();
  const payStep = stepS04({ step_id: 's_16', step_type: 'IN/health/pay-consultation-fee', act: 'pay-under-cap', identity_acts: [], fields: ['{{card.primary}}'], reversibility: 'irreversible', route: 'dual-control', amount: { currency: 'INR', amount: 800 } });
  const env = signedEnvelope(w, (v) => { v.spend_cap = { currency: 'INR', amount: 1000 }; v.committable_acts.push({ act: 'pay-under-cap', scope: 'task' }); });
  const consumed = [];
  const order = [];
  const d = deps(w, { consumed });
  d.consumeToken = (id, at) => { consumed.push(id); order.push('consume'); };
  const inject = d.driver.inject.bind(d.driver);
  d.driver.inject = (x) => { order.push('inject'); return inject(x); };
  const token = E.issueToken({ ids: w.ids, signer: w.signer, check_id: 'chk_0002', task_id: 't_12', step_id: 's_16', envelope_version: 'env_12/v2', checker: { kind: 'worker', id: 'w_l3', pool: 'L3' }, act: 'pay', amount: { currency: 'INR', amount: 800 }, step_deadline: add(AT, 'PT1H'), window_end: env.validity.to, at: AT });
  const flags = w.flags;
  w.flags = { ...flags, rows: { ...flags.rows, 'pay-under-cap': { ...flags.rows['pay-under-cap'], IN: { flag: 'delegated', condition: null, status: 'to-verify' } } } };
  const target = browserTarget('Card number', 'text', { origin: 'https://pay.maxhealthcare.in' });
  const without = w.substitutor.place(placementRequest(w, { step: payStep, envelope: env, alias: '{{card.primary}}', target, ctxOver: { money: { amount: { currency: 'INR', amount: 800 }, remaining_cap: { currency: 'INR', amount: 1000 } }, committing_placement: true } }), d);
  assert.equal(without.receipt.status, 'refused');
  assert.equal(without.receipt.check, 'reversible-or-token', 'a committing placement is refused without the token whatever the classification');
  const r = w.substitutor.place(placementRequest(w, { step: payStep, envelope: env, alias: '{{card.primary}}', target, approval_token: token, ctxOver: { money: { amount: { currency: 'INR', amount: 800 }, remaining_cap: { currency: 'INR', amount: 1000 } }, approval_token: token.token_id, committing_placement: true } }), d);
  assert.equal(r.receipt.status, 'placed', r.detail);
  assert.equal(r.receipt.committing, true);
  assert.deepEqual(order, ['consume', 'inject'], 'the token is consumed and the marker written before the first character is delivered');
  assert.equal(r.fired_marker.action, 'committing-placement');
  assert.equal(r.fired_marker.written_by, 'substitution-component');
  assert.deepEqual(consumed, [token.token_id]);
  const notConfirmed = { ...deps(w), driver: driver({ confirm: false }) };
  const token2 = E.issueToken({ ids: w.ids, signer: w.signer, check_id: 'chk_0003', task_id: 't_12', step_id: 's_16', envelope_version: 'env_12/v2', checker: { kind: 'worker', id: 'w_l3', pool: 'L3' }, act: 'pay', amount: { currency: 'INR', amount: 800 }, step_deadline: add(AT, 'PT1H'), window_end: env.validity.to, at: AT });
  const r2 = w.substitutor.place(placementRequest(w, { step: payStep, envelope: env, alias: '{{card.primary}}', target, approval_token: token2, retry_token: 'rt_0009', ctxOver: { money: { amount: { currency: 'INR', amount: 800 }, remaining_cap: { currency: 'INR', amount: 1000 } }, approval_token: token2.token_id, committing_placement: true } }), notConfirmed);
  assert.equal(r2.receipt.status, 'not-confirmed');
  assert.ok(r2.fired_marker, 'the marker already stands');
  const outcome = outcomeForReceipt(r2, { ids: w.ids, step: payStep });
  assert.equal(outcome.code, 'failed-final');
  assert.equal(outcome.retry_token, null);
  assert.equal(outcome.keep_reservation, true);
});

test('a refused receipt closes the step refused-policy with the check as the policy reference, and a worker chooses nothing', () => {
  const { w, envelope, step } = world();
  const r = w.substitutor.place(placementRequest(w, { step, envelope, alias: '{{dob}}', caller: 'console' }), deps(w));
  assert.deepEqual(outcomeForReceipt(r, { ids: w.ids, step }), { code: 'refused-policy', fields: { policy_reference: 'substitutor:step-running-and-caller' } });
  assert.match(w.ledger.linesFor('t_12').at(-1), /A worker asked to see \{\{dob\}\}\. Refused; nothing was shown\. QA has been told\.$/);
});

test('the class table admits a call to nothing, and a partial alias is placeable where the full value is not', () => {
  assert.deepEqual(ALIAS_SURFACES['never-an-alias'], []);
  for (const cls of Object.keys(ALIAS_SURFACES)) assert.ok(!ALIAS_SURFACES[cls].includes('telephony'));
  assert.deepEqual(ALIAS_SURFACES.credential, ['browser']);
  const { w, envelope } = world();
  const cred = w.vault.issueCredential({ holder: 'hash-service', ops: ['issue-partial'] });
  const partial = w.vault.issuePartial(cred, { user: w.user, alias: '{{aadhaar}}', form: 'last4', at: T });
  const s = stepS04({ fields: [partial] });
  const r = w.substitutor.place(placementRequest(w, { step: s, envelope, alias: partial, target: browserTarget('Aadhaar last four digits') }), deps(w));
  assert.equal(r.receipt.status, 'placed', r.detail);
  assert.equal(aliasOwner('{{dob.mother}}'), 'p_mother');
  assert.equal(aliasOwner('{{account.hdfc}}'), 'user');
});

test('a relay placement rewrites the occurrences in the outbound store and the line names the relay', () => {
  const { w, envelope } = world();
  const s = stepS04({ surface: 'relay', fields: ['{{name}}', '{{account.hdfc}}'] });
  const d = deps(w);
  const r = w.substitutor.place(placementRequest(w, { step: s, envelope, alias: '{{account.hdfc}}', surface: 'relay', caller: 'mail-relay', target: { message_id: 'm_1', occurrences: [2], recipient_domain: 'maxhealthcare.in' } }), d);
  assert.equal(r.receipt.status, 'placed', r.detail);
  assert.match(w.ledger.linesFor('t_12').at(-1), /\{\{account\.hdfc\}\} sent to Max Healthcare in an email, through our relay\. Placed by the system\./);
});
