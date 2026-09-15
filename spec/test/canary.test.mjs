// The canary (03, section 7): a value of every class is planted at the door
// and followed through the harness. It must be found on the surface where it
// was placed and nowhere else: not in the request, the step record, the card,
// the check card, the receipts, the ledger, the events, the stored evidence,
// the manifests, the incidents or a log line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, ONBOARDING, onboard, signedEnvelope, stepS04, placementRequest, browserTarget, deps, T, AT } from './world.mjs';
import { renderCard, renderCheckCard, ConsoleError } from '../lib/console.mjs';
import { Redactor, Verifier, EvidenceStore, EvidencePipeline } from '../lib/evidence.mjs';
import { normalisedForms } from '../lib/detectors.mjs';
import { TaskService } from '../lib/state-machine.mjs';
import { registry, fixture, clone } from './helpers.mjs';

const PLANTED = [
  ...Object.values(ONBOARDING).map((v) => ({ cls: v.cls, type: v.type, value: v.value })),
  { cls: 'identity-number', type: 'reference', value: 'MH-482913' },
  { cls: 'financial-fact', type: 'amount', value: '₹2,500' },
  { cls: 'never-an-alias', type: 'otp', value: '739104' },
];

function formsOf(p) {
  const forms = new Set([p.value, ...normalisedForms(p.cls, p.type, p.value)]);
  return [...forms].filter((f) => f.length >= 5 && !/^\d{1,4}$/.test(f));
}

function sweep(label, material) {
  const text = typeof material === 'string' ? material : JSON.stringify(material);
  const leaks = [];
  for (const p of PLANTED) for (const f of formsOf(p)) if (text.includes(f)) leaks.push(`${p.type}: "${f}"`);
  assert.deepEqual(leaks, [], `${label} carries a planted value: ${leaks.join('; ')}`);
}

test('the canary: every class planted at the door, found on the surface and nowhere else', () => {
  const w = buildWorld();
  const seen = {};

  // Door one: the device form and a message on the channel.
  const aliases = onboard(w);
  const message = w.proxy.tokeniseMessage({
    text: `Book the earliest cardiology slot next week at Max. My DOB is ${ONBOARDING.dob.value}, PAN ${ONBOARDING.pan.value}, card ${ONBOARDING.card.value}, phone ${ONBOARDING.phone.value}, mail ${ONBOARDING.email.value}. Last time the fee was ₹2,500 and my reference was MH-482913. I have ${ONBOARDING.condition.value}.`,
    at: T, channel: 'whatsapp', party: 'max-healthcare', partyShapes: ['MH-[0-9]{6}'],
  });
  const request = { ...clone(fixture('task-12/request.json')), content: { text: message.text, voice: null, attachments: [] }, aliases_issued: message.aliases_issued };
  assert.ok(registry.validate('aifred:request', request).ok, JSON.stringify(registry.validate('aifred:request', request).errors));
  seen.request = request;
  sweep('the request record', request);
  assert.ok(request.content.text.includes(aliases.dob) && request.content.text.includes(aliases.pan) && request.content.text.includes(aliases.card));

  // The OTP: never vaulted, never an alias.
  assert.throws(() => w.proxy.tokeniseField({ cls: 'never-an-alias', type: 'otp', value: '739104', at: T }), /never an alias/);
  assert.ok(!w.vault.aliasesOf(w.user).includes('{{otp}}'));

  // The plan and the step record; the task service's log.
  const svc = new TaskService({ catalogue: fixture('catalogue.json'), planner: { plan: () => null, replan: () => null } });
  const task = svc.open(request, { task_type: 'IN/health/book-appointment' });
  svc.transition(task.task_id, 'accept', T, {});
  const plan = clone(fixture('task-12/plan-p12-1.json'));
  svc.adoptPlan(task.task_id, plan, T);
  const envelope = signedEnvelope(w);
  svc.transition(task.task_id, 'propose', T, {});
  svc.transition(task.task_id, 'authorise', T, { envelope });
  seen.steps = svc.stepsOf(task.task_id);
  sweep('the step records', seen.steps);

  // The task card and the check card, screened before they reach a console.
  const step = stepS04();
  const card = renderCard(step, { hashService: w.hash, envelope, party: w.parties.get('party_max-healthcare'), pseudonym: 'Client 4471', at: AT, position: 'step four of six' });
  seen.card = card;
  sweep('the task card', card);
  assert.deepEqual(card.fields.map((f) => f.shown), ['••••', '••••', '••••']);
  assert.ok(card.envelope_lines.includes('spend cap: no spend'));
  const leakyStep = { ...step, purpose: `Book for ${ONBOARDING.name.value} born ${ONBOARDING.dob.value}` };
  assert.throws(() => renderCard(leakyStep, { hashService: w.hash, envelope, party: null, pseudonym: 'Client 4471', at: AT, position: '' }), ConsoleError, 'a value in a card payload is a defect and an incident');
  assert.equal(w.hash.incidents.at(-1).class, 'value-in-alias-zone');
  sweep('the incident the screen opened', w.hash.incidents);
  const check = renderCheckCard(step, { envelope, committed: { fired: 0, reserved: 0 }, amount: null, evidence: 'ev_12_04_frame-before-submit', hashService: w.hash, at: AT });
  seen.checkCard = check;
  sweep('the check card', check);
  assert.equal(check.remaining_cap, 'remaining cap: sufficient for this act: yes');

  // Boundary three and four: the substitutor places into the surface.
  const d = deps(w);
  const results = [];
  for (const [alias, label] of [[aliases.dob, 'Date of birth'], [aliases.name, 'Patient name'], [aliases.phone, 'Mobile phone']]) {
    const r = w.substitutor.place(placementRequest(w, { step, envelope, alias, target: browserTarget(label) }), d);
    assert.equal(r.receipt.status, 'placed', `${alias}: ${r.detail}`);
    results.push(r);
  }
  seen.receipts = results;
  sweep('the receipts', results);
  assert.deepEqual(d.driver.log.map((l) => l.value), [ONBOARDING.dob.value, ONBOARDING.name.value, ONBOARDING.phone.value], 'the surface, and only the surface, received the values');
  const registryEntries = results.map((r) => r.registry_entry);

  // A worker's variance note, written on our side, screened before it is stored.
  const note = w.hash.screen(`The desk quoted ₹2,500 and read back MH-482913 for ${ONBOARDING.name.value}`, { mode: 'tokenise', caller: 'task-service:variance', at: AT, party: 'max-healthcare', partyShapes: ['MH-[0-9]{6}'] });
  assert.equal(note.status, 'found');
  seen.variance = note.text;
  sweep('the stored variance note', note.text);

  // Boundary five: the confirmation page echoes everything, plus values that were never vaulted.
  const echo = {
    artefact_id: 'ev_12_04_frame-after-response', task_id: 't_12', step_id: 's_04', kind: 'frame-after-response', capture_point: 'after-response', surface_clock: AT,
    registry: registryEntries.map((e, i) => ({ ...e, rectangle: { x: 100, y: 200 + i * 40, w: 180, h: 24 }, frame: 12 })),
    content: {
      text_runs: [
        { id: 'h', box: { x: 10, y: 10, w: 300, h: 30 }, text: 'Appointment confirmed', role: 'heading' },
        { id: 'dob', box: { x: 100, y: 200, w: 180, h: 24 }, text: ONBOARDING.dob.value, role: 'value' },
        { id: 'name', box: { x: 100, y: 240, w: 180, h: 24 }, text: ONBOARDING.name.value, role: 'value' },
        { id: 'phone', box: { x: 100, y: 280, w: 180, h: 24 }, text: ONBOARDING.phone.value, role: 'value' },
        { id: 'echo1', box: { x: 10, y: 400, w: 400, h: 24 }, text: `Paid with ${ONBOARDING.card.value}, PAN ${ONBOARDING.pan.value}, Aadhaar ${ONBOARDING.aadhaar.value}`, role: 'value' },
        { id: 'echo2', box: { x: 10, y: 440, w: 400, h: 24 }, text: `Reference MH-482913, fee ₹2,500, email ${ONBOARDING.email.value}`, role: 'value' },
        { id: 'echo3', box: { x: 10, y: 480, w: 400, h: 24 }, text: `Reason: ${ONBOARDING.condition.value}. Code 739104. Address ${ONBOARDING.address.value}`, role: 'value' },
        { id: 'other', box: { x: 10, y: 520, w: 400, h: 24 }, text: 'Another patient 9123456789 was here', role: 'value' },
        { id: 'btn', box: { x: 10, y: 560, w: 100, h: 24 }, text: 'Done', role: 'button' },
      ],
      images: [{ id: 'img', box: { x: 320, y: 10, w: 100, h: 100 }, region: 'patient-photo' }],
    },
  };
  const redactor = new Redactor({ hashService: w.hash });
  const verifier = new Verifier({ hashService: w.hash });
  const store = new EvidenceStore({ verifierPublicKey: verifier.key.publicKey, ledger: w.ledger, ids: w.ids });
  const pipe = new EvidencePipeline({ redactor, verifier, store, ledger: w.ledger, ids: w.ids });
  pipe.capture(echo);
  const party = w.parties.get('party_max-healthcare');
  const out = pipe.process(echo.artefact_id, { party, partyShapes: party.reference_shapes, afterSubmitWithPlacement: true }, { at: AT });
  assert.ok(out.stored, `evidence withheld: ${JSON.stringify(pipe.incidents)}`);
  seen.evidence = out.stored;
  sweep('the stored artefact and its manifest', out.stored);
  assert.ok(out.stored.manifest.length >= 8);

  // A recording: the desk reads the card back digit by digit and names the condition.
  const rec = {
    artefact_id: 'ev_12_03_rec', task_id: 't_12', step_id: 's_03', kind: 'recording', capture_point: 'call-end', surface_clock: AT, registry: [],
    content: { segments: [
      { start_ms: 0, end_ms: 5000, text: 'Cardiology desk, good morning' },
      { start_ms: 5000, end_ms: 15000, text: 'the card on file ends four one one one one one one one one one one one one one one one' },
      { start_ms: 15000, end_ms: 20000, text: `is that ${ONBOARDING.name.value} with ${ONBOARDING.condition.value}` },
      { start_ms: 20000, end_ms: 25000, text: 'your reference is MH-482913, thank you' },
    ], flagged: [] },
  };
  pipe.capture(rec);
  const recOut = pipe.process(rec.artefact_id, { party, partyShapes: party.reference_shapes }, { at: AT });
  assert.ok(recOut.stored, `recording withheld: ${JSON.stringify(pipe.incidents)}`);
  seen.recording = recOut.stored;
  sweep('the stored recording', recOut.stored);

  // The logging pipeline: a line that matches a known value is dropped and raises an incident.
  const logLine = w.hash.screen(`placed {{dob}} = ${ONBOARDING.dob.value} for step s_04`, { mode: 'reject', caller: 'logging-pipeline', at: AT });
  assert.equal(logLine.status, 'reject');
  const committedLog = logLine.status === 'clean' ? [logLine.text] : [];
  seen.log = committedLog;
  seen.hashIncidents = w.hash.incidents;
  sweep('the incident queue', w.hash.incidents);

  // The ledger, the user's own record, and everything else a person or a log can see.
  seen.ledger = w.ledger.export('t_12');
  sweep('the ledger', seen.ledger);
  seen.events = svc.events;
  sweep('the event log', seen.events);
  seen.pipelineIncidents = pipe.incidents;
  sweep('the pipeline incidents', pipe.incidents);
  seen.hashLedgerLines = [...w.hash.ledgerLines, ...w.proxy.ledgerLines];
  sweep("the received lines", seen.hashLedgerLines);
  sweep('everything together', seen);

  // And the counterpart: the aliases are where the values were.
  assert.ok(seen.ledger.lines.some((l) => l.includes(`${aliases.dob} typed into`)));
  assert.ok(JSON.stringify(out.stored.manifest).includes(aliases.dob));
  assert.ok(JSON.stringify(recOut.stored.content).includes(aliases.card), 'the transcript reads the alias where the value was');
  assert.equal(w.vault.accessLog.length, 3, 'three detokenisations, three placements');
  assert.deepEqual(w.vault.accessLog.map((a) => a.placement_id), results.map((r) => r.receipt.placement_id), 'reconciliation: every detokenisation matches a placement');
});
