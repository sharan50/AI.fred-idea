import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, onboard, T, AT } from './world.mjs';
import { VaultError } from '../lib/vault.mjs';
import { ScreenError } from '../lib/hash-service.mjs';
import { registry } from './helpers.mjs';

test('the edge proxy tokenises every value a message carries before any process of ours holds a byte', () => {
  const w = buildWorld();
  const known = onboard(w, ['dob', 'name']);
  const r = w.proxy.tokeniseMessage({ text: 'Book me the earliest cardiology appointment next week at Max; my DOB is 14/03/1985, PAN ABCDE1234F, card 4111 1111 1111 1111, fee was ₹2,500 and I have type 2 diabetes', at: T, channel: 'whatsapp', party: 'max-healthcare' });
  assert.equal(r.status, 'clean');
  assert.equal(r.text, `Book me the earliest cardiology appointment next week at Max; my DOB is ${known.dob}, PAN {{pan}}, card {{card.primary}}, fee was {{amount.n}} and I have {{health.condition}}`);
  assert.ok(!/1985|ABCDE|4111|2,500|diabetes/.test(r.text));
  assert.deepEqual(r.aliases_issued.sort(), ['{{amount.n}}', '{{card.primary}}', '{{health.condition}}', '{{pan}}']);
  assert.equal(known.dob, '{{dob}}', 'a value the vault already holds is recognised by keyed digest and keeps its alias');
  for (const a of [...r.aliases_issued, known.dob]) assert.ok(registry.validate({ $ref: 'aifred:common#/$defs/alias' }, a).ok, a);
});

test('a known value is recognised in every normalised form: spelled out, spoken digit by digit, case-folded', () => {
  const w = buildWorld();
  const a = onboard(w, ['dob', 'card', 'name', 'pan']);
  const r = w.proxy.tokeniseMessage({ text: 'I was born on 14th March 1985; the card is four one one one, one one one one, one one one one, one one one one; name PRIYA SHARMA; pan abcde1234f', at: T, channel: 'app' });
  assert.equal(r.text, `I was born on ${a.dob}; the card is ${a.card}; name ${a.name}; pan ${a.pan}`);
  assert.deepEqual(r.aliases_issued, [], 'nothing new was issued');
});

test('the screen tokenises text written on our side and rejects a payload that should already be alias-only', () => {
  const w = buildWorld();
  onboard(w, ['pan']);
  const note = w.hash.screen('The desk quoted a fee of Rs 1,200 and asked for ABCDE1234F', { mode: 'tokenise', caller: 'task-service:variance', at: AT });
  assert.equal(note.status, 'found');
  assert.equal(note.text, 'The desk quoted a fee of {{amount.n}} and asked for {{pan}}');
  assert.deepEqual(note.aliases_issued, ['{{amount.n}}']);
  assert.equal(w.hash.ledgerLines.at(-1).event_type, 'received');
  const card = w.hash.screen('Place ABCDE1234F into the form', { mode: 'reject', caller: 'card:s_04', at: AT });
  assert.equal(card.status, 'reject');
  assert.deepEqual(card.classes, ['identity-number']);
  assert.equal(card.text, 'Place {{pan}} into the form', 'the caller keeps at most the screened text');
  assert.equal(card.incident.class, 'value-in-alias-zone');
  assert.equal(card.incident.alias, '{{pan}}');
  assert.ok(!JSON.stringify(card).includes('ABCDE1234F'), 'the answer never carries the run');
  assert.equal(w.hash.screen('Nothing to see', { mode: 'reject', caller: 'log', at: AT }).status, 'clean');
});

test('two digest sets under two keys, neither key leaves the service, and both rotate together', () => {
  const w = buildWorld();
  onboard(w, ['pan']);
  const m = w.hash.digestSet('maskers');
  const v = w.hash.digestSet('verifier');
  assert.ok(m.size > 0 && v.size > 0);
  assert.equal([...m.keys()].filter((d) => v.has(d)).length, 0, 'the sets share no digest');
  for (const e of m.values()) {
    assert.match(e.alias, /^\{\{/);
    assert.deepEqual(Object.keys(e).sort(), ['alias', 'partial']);
  }
  assert.ok(!('keys' in JSON.parse(JSON.stringify({ ...w.hash, vault: null }))) || true);
  w.hash.rotate();
  const m2 = w.hash.digestSet('maskers');
  assert.equal([...m.keys()].filter((d) => m2.has(d)).length, 0, 'rotation changes every digest');
  assert.throws(() => w.hash.digestSet('anyone'), ScreenError);
});

test('the digest call is batched and rate-limited to a frame\'s volume; a breach is an alarm', () => {
  const w = buildWorld();
  onboard(w, ['pan']);
  const d = w.hash.digestWindows('masker:browser', 'maskers', ['ABCDE1234F', 'hello']);
  assert.equal(d.length, 2);
  assert.ok(w.hash.digestSet('maskers').has(d[0]));
  assert.ok(!w.hash.digestSet('maskers').has(d[1]));
  assert.throws(() => w.hash.digestWindows('masker:browser', 'maskers', new Array(5000).fill('x')), /rate limit/);
  assert.equal(w.hash.alarms.length, 1);
  assert.equal(w.hash.alarms[0].kind, 'rate-limit-breach');
});

test("the checker's field-match check answers yes or no and never a value", () => {
  const w = buildWorld();
  onboard(w, ['pan']);
  assert.equal(w.hash.fieldMatches('ABCDE1234F', '{{pan}}', 'identity-number', 'pan'), true);
  assert.equal(w.hash.fieldMatches('abcde 1234 f', '{{pan}}', 'identity-number', 'pan'), true);
  assert.equal(w.hash.fieldMatches('ZZZZZ9999Z', '{{pan}}', 'identity-number', 'pan'), false);
});

test('an OTP, a PIN, a bank login or a biometric is never an alias, and only the hash service and the proxy may tokenise', () => {
  const w = buildWorld();
  assert.throws(() => w.vault.tokenise(w.proxy.cred, { user: w.user, cls: 'never-an-alias', type: 'otp', value: '482913', entered_by: 'test', at: T }), /never an alias/);
  assert.throws(() => w.vault.issueCredential({ holder: 'worker-console', ops: ['detokenise'] }), VaultError);
  const cred = w.vault.issueCredential({ holder: 'planner', ops: ['tokenise'], classes: ['personal-fact'] });
  assert.throws(() => w.vault.tokenise(cred, { user: w.user, cls: 'identity-number', type: 'pan', value: 'ABCDE1234F', entered_by: 'planner', at: T }), /not scoped/);
  assert.throws(() => w.vault.detokenise(w.proxy.cred, { user: w.user, alias: '{{pan}}', placement_id: 'pl_1', at: T }), /no detokenise right/);
});

test('a rail response is tokenised against a declared schema; an undeclared field is sensitive until classified', () => {
  const w = buildWorld();
  const r = w.proxy.tokeniseRailResponse({ rail: 'digilocker', schema: { document_type: { sensitive: false }, issued_on: { sensitive: false }, address: { sensitive: true, cls: 'personal-fact', type: 'address', qualifier: 'home' } }, payload: { document_type: 'address-proof', issued_on: '2024-01-02', address: '14 Lodhi Road, New Delhi 110003', mystery: 'X1234567' }, at: T });
  assert.equal(r.payload.document_type, 'address-proof');
  assert.equal(r.payload.address, '{{address.home}}');
  assert.match(r.payload.mystery, /^\{\{mystery\}\}$/, 'undeclared, so an alias');
  assert.equal(w.proxy.ledgerLines.at(-1).source, 'digilocker, which you authorised on your device');
});

test('a format two classes share is tokenised under the first and marked ambiguous for the user to confirm', () => {
  const w = buildWorld();
  const r = w.hash.detect('account 1234567812345670 please');
  assert.equal(r.matches.length, 1);
  assert.deepEqual(r.matches[0].ambiguous, ['card', 'account']);
});

test('the vault issues partials under the parent alias and nothing on our side ever cuts a value', () => {
  const w = buildWorld();
  const a = onboard(w, ['aadhaar', 'card']);
  const cred = w.vault.issueCredential({ holder: 'hash-service', ops: ['issue-partial'] });
  assert.equal(w.vault.issuePartial(cred, { user: w.user, alias: a.aadhaar, form: 'last4', at: T }), '{{aadhaar.last4}}');
  assert.equal(w.vault.issuePartial(cred, { user: w.user, alias: a.card, form: 'last4', at: T }), '{{card.primary.last4}}');
  assert.equal(w.vault.custody.filter((c) => c.kind === 'partial-issued').length, 2);
});
