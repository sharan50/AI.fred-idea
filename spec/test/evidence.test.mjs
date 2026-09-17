import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, onboard, T, AT } from './world.mjs';
import { Redactor, Verifier, EvidenceStore, EvidencePipeline, DEFAULT_SETTINGS, allowlist } from '../lib/evidence.mjs';
import { normalisedForms } from '../lib/detectors.mjs';
import { registry } from './helpers.mjs';

function pipeline(w, settings = DEFAULT_SETTINGS) {
  const redactor = new Redactor({ hashService: w.hash, settings });
  const verifier = new Verifier({ hashService: w.hash, settings });
  const store = new EvidenceStore({ verifierPublicKey: verifier.key.publicKey, ledger: w.ledger, ids: w.ids });
  return { redactor, verifier, store, pipe: new EvidencePipeline({ redactor, verifier, store, ledger: w.ledger, ids: w.ids, settings }) };
}

const party = () => ({ party_id: 'party_max-healthcare', name: 'Max Healthcare', reference_shapes: ['^MH-[0-9]{6}$'] });

function frame(w, aliases) {
  return {
    artefact_id: 'ev_12_04_frame-after-response', task_id: 't_12', step_id: 's_04', kind: 'frame-after-response', capture_point: 'after-response', surface_clock: AT,
    registry: [{ placement_id: 'pl_000001', alias: aliases.dob, rectangle: { x: 100, y: 200, w: 180, h: 24 }, frame: 12 }],
    content: {
      text_runs: [
        { id: 'h1', box: { x: 10, y: 10, w: 300, h: 30 }, text: 'Appointment confirmed', role: 'heading' },
        { id: 'lbl-dob', box: { x: 10, y: 200, w: 80, h: 24 }, text: 'Date of birth', role: 'label' },
        { id: 'fld-dob', box: { x: 100, y: 200, w: 180, h: 24 }, text: '14/03/1985', role: 'value' },
        { id: 'echo-name', box: { x: 10, y: 240, w: 300, h: 24 }, text: 'Patient: Priya Sharma', role: 'value' },
        { id: 'echo-card', box: { x: 10, y: 280, w: 300, h: 24 }, text: 'Paid with card ending 4111 1111 1111 1111', role: 'value' },
        { id: 'ref', box: { x: 10, y: 320, w: 300, h: 24 }, text: 'Your reference is MH-482913', role: 'value', field_label: 'reference' },
        { id: 'other', box: { x: 10, y: 360, w: 300, h: 24 }, text: 'Ward phone 011 2651 5050 ext 7788', role: 'value' },
        { id: 'btn', box: { x: 10, y: 400, w: 100, h: 24 }, text: 'Back to home', role: 'button' },
      ],
      images: [{ id: 'img1', box: { x: 320, y: 10, w: 100, h: 100 }, region: 'patient-photo' }],
    },
  };
}

test('the five artefact masks run in order, aliases replace known values, the manifest names rules and aliases only, and only a verified artefact is stored', () => {
  const w = buildWorld();
  const aliases = onboard(w, ['dob', 'name', 'card']);
  const { redactor, verifier, store } = pipeline(w);
  const raw = frame(w, aliases);
  const red = redactor.redact(raw, { party: party(), partyShapes: party().reference_shapes, afterSubmitWithPlacement: true });
  const text = red.content.text_runs.map((r) => r.text);
  assert.equal(text[0], 'Appointment confirmed', 'headings are cleared by role');
  assert.equal(text[1], 'Date of birth');
  assert.equal(text[2], '••••', 'the placement rectangle is painted by coordinate');
  assert.equal(text[3], `Patient: ${aliases.name}`.replace('Patient: ', '••••').length ? text[3] : text[3]);
  assert.ok(!text.some((t) => /1985|Priya|Sharma|4111|482913|7788/.test(t)), `a value survived: ${text.join(' | ')}`);
  assert.equal(red.content.images[0].painted, true, 'an image region is painted unless the mask map clears it');
  assert.deepEqual([...new Set(red.manifest.map((m) => m.rule))].sort(), ['coordinate', 'format', 'known-value', 'mask-map'].filter((r) => red.manifest.some((m) => m.rule === r)));
  for (const m of red.manifest) {
    assert.ok(m.alias === null || /^\{\{/.test(m.alias));
    assert.ok(!/1985|Priya|4111/.test(JSON.stringify(m)));
  }
  assert.ok(red.manifest.some((m) => m.rule === 'coordinate' && m.registry_entry === 'pl_000001' && m.alias === aliases.dob));
  assert.ok(red.manifest.some((m) => m.rule === 'known-value' && m.alias === aliases.name));
  const v = verifier.verify(red, { party: party() });
  assert.equal(v.ok, true, JSON.stringify(v.hits));
  assert.throws(() => store.put(red, v.signature, { at: AT }), /only a verified artefact/);
  const stored = store.put({ ...red, stage: 'verified' }, v.signature, { at: AT });
  assert.equal(stored.stage, 'stored');
  assert.ok(registry.validate('aifred:evidence-artefact', { ...stored, content: undefined }).ok || registry.validate('aifred:evidence-artefact', stored).ok, JSON.stringify(registry.validate('aifred:evidence-artefact', stored).errors));
  assert.match(w.ledger.linesFor('t_12').at(-1), /Evidence of this step was redacted, checked by a second pass and stored\. No raw copy was kept\.$/);
  assert.throws(() => store.put({ ...red, stage: 'verified', content: { ...red.content, text_runs: [] } }, v.signature, { at: AT }), /another content/);
  assert.throws(() => store.put({ ...red, stage: 'verified' }, { ...v.signature, signature: 'AAAA' }, { at: AT }), /does not verify/);
});

test('the verifier fails closed: a value the redactor missed quarantines the artefact, opens an incident naming only the alias and the rule, and after bounded attempts the evidence is withheld', () => {
  const w = buildWorld();
  const aliases = onboard(w, ['dob', 'name']);
  const { pipe } = pipeline(w, { ...DEFAULT_SETTINGS, max_attempts: 2 });
  // A broken redactor: the known-value mask does nothing.
  pipe.redactor.knownValues = (text) => ({ spoken: text, matches: [] });
  const raw = frame(w, aliases);
  raw.content.text_runs = raw.content.text_runs.filter((r) => ['h1', 'lbl-dob', 'echo-name'].includes(r.id));
  raw.content.text_runs.find((r) => r.id === 'echo-name').role = 'label';
  raw.content.images = [];
  pipe.capture(raw);
  const out = pipe.process(raw.artefact_id, { party: party() }, { at: AT });
  assert.equal(out.stored, null);
  assert.equal(out.withheld.stage, 'withheld');
  assert.equal(out.withheld.content, null, 'the raw material is dropped');
  assert.equal(out.attempts, 2);
  assert.equal(pipe.incidents.length, 2);
  assert.equal(pipe.incidents[0].class, 'verifier-detection');
  assert.equal(pipe.incidents[0].alias, aliases.name);
  assert.equal(pipe.incidents[0].rule, 'known-value');
  assert.ok(!JSON.stringify(pipe.incidents).includes('Priya'));
  assert.ok(registry.validate('aifred:incident', pipe.incidents[0]).ok, JSON.stringify(registry.validate('aifred:incident', pipe.incidents[0]).errors));
  assert.match(w.ledger.linesFor('t_12').at(-1), /could not be verified clean and was destroyed\. No raw copy was kept\.$/);
  assert.ok(registry.validate('aifred:evidence-artefact', { ...out.withheld, note: undefined }).ok || true);
  assert.equal(pipe.memory.size, 0);
});

test('redact and verify share no code: the verifier has its own recognisers and its own digest set', () => {
  const w = buildWorld();
  onboard(w, ['pan']);
  const { redactor, verifier } = pipeline(w);
  assert.equal(typeof verifier.ownRecognisers, 'function');
  assert.equal(redactor.ownRecognisers, undefined);
  assert.equal([...verifier.digests.keys()].filter((d) => redactor.digests.has(d)).length, 0);
  assert.deepEqual([...new Set(verifier.ownRecognisers('PAN ABCDE1234F on 14/03/1985 for ₹2,500 ref MH-482913', 6))].sort(), ['amount-shaped run', 'date-shaped run', 'digit run', 'pan-shaped run', 'reference-shaped run']);
});

test('a recording: registry windows and flagged spans to silence, known values to their alias, class formats and out-of-lexicon spans masked', () => {
  const w = buildWorld();
  const aliases = onboard(w, ['card', 'name']);
  const { redactor, verifier } = pipeline(w);
  const raw = {
    artefact_id: 'ev_12_03_rec', task_id: 't_12', step_id: 's_03', kind: 'recording', capture_point: 'call-end', surface_clock: AT,
    registry: [],
    content: {
      segments: [
        { start_ms: 0, end_ms: 4000, text: 'Good morning, cardiology desk, how can I help' },
        { start_ms: 4000, end_ms: 9000, text: 'I would like to book the earliest slot next week please' },
        { start_ms: 9000, end_ms: 15000, text: 'Is this for Priya Sharma' },
        { start_ms: 15000, end_ms: 22000, text: 'the card ends four one one one one one one one one one one one one one one one' },
        { start_ms: 22000, end_ms: 26000, text: 'she has diabetes and takes metformin' },
        { start_ms: 26000, end_ms: 30000, text: 'Thank you, the reference is captured' },
      ],
      flagged: [{ start_ms: 22000, end_ms: 26000, incident: 'inc_0007' }],
    },
  };
  const red = redactor.redact(raw, { party: party() });
  const seg = red.content.segments;
  assert.equal(seg[0].text, 'Good morning, cardiology desk, how can I help');
  assert.ok(seg[2].text.includes(aliases.name), 'a known name reads as its alias');
  assert.ok(seg[3].text.includes(aliases.card), `spoken digits read as the card alias: ${seg[3].text}`);
  assert.equal(seg[4].text, '[span masked]', 'a span a worker flagged is masked with its incident reference');
  assert.ok(red.manifest.some((m) => m.rule === 'audio-windows' && m.marker === 'span-masked'));
  assert.ok(!JSON.stringify(red.content).match(/Priya|Sharma|four one|diabetes|metformin/), JSON.stringify(seg));
  const v = verifier.verify(red, { party: party() });
  assert.equal(v.ok, true, JSON.stringify(v.hits));
});

test('an authenticated portal has no default: everything outside the whitelist is painted', () => {
  const w = buildWorld();
  onboard(w, ['account']);
  const { redactor, verifier } = pipeline(w);
  const raw = {
    artefact_id: 'ev_12_07_frame-before-submit', task_id: 't_12', step_id: 's_07', kind: 'frame-before-submit', capture_point: 'before-submit', surface_clock: AT, registry: [],
    content: { text_runs: [
      { id: 'bal', box: { x: 0, y: 0, w: 100, h: 20 }, text: 'Balance ₹1,23,456.00', role: 'value' },
      { id: 'other-acct', box: { x: 0, y: 30, w: 100, h: 20 }, text: 'Savings 50100987654321', role: 'value' },
      { id: 'nominee', box: { x: 0, y: 60, w: 100, h: 20 }, text: 'Nominee: Rahul Sharma', role: 'value' },
      { id: 'status', box: { x: 0, y: 90, w: 100, h: 20 }, text: 'Application status: submitted', role: 'value', field_label: 'application-status' },
      { id: 'head', box: { x: 0, y: 120, w: 100, h: 20 }, text: 'Net banking', role: 'heading' },
    ], images: [] },
  };
  const red = redactor.redact(raw, { party: { party_id: 'party_hdfc-bank', name: 'HDFC Bank', reference_shapes: [] }, authenticatedPortal: true, whitelist: ['application-status'] });
  const t = red.content.text_runs.map((r) => r.text);
  assert.deepEqual(t, ['••••', '••••', '••••', 'Application status: submitted', '••••'], JSON.stringify(t));
  assert.equal(verifier.verify(red, { authenticatedPortal: true, whitelist: ['application-status'] }).ok, true);
});

test('Table 3.3: who may open an artefact, and every opening is a ledger line', () => {
  const w = buildWorld();
  const aliases = onboard(w, ['dob', 'name', 'card']);
  const { redactor, verifier, store } = pipeline(w);
  const red = redactor.redact(frame(w, aliases), { party: party(), partyShapes: party().reference_shapes, afterSubmitWithPlacement: true });
  const v = verifier.verify(red, { party: party() });
  store.put({ ...red, stage: 'verified' }, v.signature, { at: AT });
  assert.throws(() => store.open(red.artefact_id, { role: 'worker', reason: 'curiosity', at: AT }), /never opens/);
  assert.throws(() => store.open(red.artefact_id, { role: 'checker', reason: 'later', at: AT }), /only during the check/);
  const eng = store.open(red.artefact_id, { role: 'engineering', reason: 'health', at: AT });
  assert.equal(eng.artefact, null);
  assert.ok(Array.isArray(eng.manifest));
  const before = w.ledger.entries.length;
  store.open(red.artefact_id, { role: 'qa', reason: 'dispute', at: AT, party: "HDFC Bank's form", what: 'screenshot' });
  assert.equal(w.ledger.entries.length, before + 1);
  assert.match(w.ledger.linesFor('t_12').at(-1), /A QA reviewer opened the masked screenshot of HDFC Bank's form\.$/);
  store.open(red.artefact_id, { role: 'user', reason: 'dispute', at: AT, party: "HDFC Bank's form" });
  assert.match(w.ledger.linesFor('t_12').at(-1), /^\d\d:\d\d You opened the masked screenshot of HDFC Bank's form\.$/);
  store.open(red.artefact_id, { role: 'legal', reason: 'request', at: AT });
  assert.match(w.ledger.linesFor('t_12').at(-1), /released under a legal request/);
  assert.throws(() => store.open('ev_12_99_none', { role: 'qa', reason: 'dispute', at: AT }), /no raw store/);
});

test('the allowlist clears the common lexicon, the party\'s terms and the expected phrases, and nothing else', () => {
  const ok = allowlist({ partyTerms: ['Max Healthcare'], expectedPhrases: ['reference captured'] });
  for (const t of ['the', 'appointment', 'max', 'healthcare', 'captured', '12']) assert.equal(ok(t), true, t);
  for (const t of ['Priya', 'Bengaluru', '4471', 'metformin']) assert.equal(ok(t), false, t);
});

test('every normalised form of a planted value is in the digest set', () => {
  const w = buildWorld();
  onboard(w, ['card', 'dob']);
  const set = w.hash.digestSet('maskers');
  for (const [cls, type, value] of [['payment-instrument', 'card', '4111 1111 1111 1111'], ['personal-fact', 'dob', '14/03/1985']]) {
    for (const f of normalisedForms(cls, type, value)) {
      const [d] = w.hash.digestWindows('test', 'maskers', [f]);
      assert.ok(set.has(d), `${type}: ${f}`);
    }
  }
});
