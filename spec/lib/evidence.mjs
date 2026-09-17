// The evidence pipeline (02, section 8; 03, section 4): capture, redact,
// verify, store. Raw artefacts exist only in the pipeline's memory; the five
// artefact masks run in a fixed order; a separately built verifier with its
// own recognisers and its own digest set fails closed; the store accepts an
// artefact only with the verifier's signature over its hash.
import { createHmac } from 'node:crypto';
import { patternMatches, dictionaryMatches, unspeak, windowCandidates, minimalMatches, DICTIONARY } from './detectors.mjs';
import { sha256, signRecord, keyPair, verifyRecord } from './signing.mjs';
import { localVocabulary } from './vocab.mjs';

const PAINT = '••••';
const CLEARED_ROLES = new Set(['heading', 'label', 'navigation', 'button']);

export const DEFAULT_SETTINGS = { margin: 4, digit_run_threshold: 6, hold_wait: 'PT1M', max_attempts: 3 };

function intersects(a, b, margin = 0) {
  return a.x < b.x + b.w + margin && a.x + a.w + margin > b.x && a.y < b.y + b.h + margin && a.y + a.h + margin > b.y;
}

function boxText(b) {
  return `${b.x},${b.y},${b.w},${b.h}`;
}

// The allowlist the relay renderer, the transcriber and the pipeline share
// (03, 3.3): the language's common lexicon, the party's terms, the catalogue
// entry's expected phrases, and digit runs below the threshold. Anything else
// is painted.
export function allowlist({ lexicon = COMMON_LEXICON, partyTerms = [], expectedPhrases = [], threshold = 6 }) {
  const cleared = new Set([...lexicon, ...partyTerms.flatMap((t) => [t.toLowerCase(), ...t.toLowerCase().split(/\s+/)]), ...expectedPhrases.flatMap((p) => p.toLowerCase().split(/\s+/))]);
  return (token) => {
    const t = token.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    if (t === '') return true;
    if (/^\d+$/.test(t)) return t.length < threshold && t.length <= 2;
    return cleared.has(t);
  };
}

export const COMMON_LEXICON = new Set('a an the and or of to in on at for with by from as is are was were be been being have has had do does did not no yes this that these those it its we you your our they their he she his her i me my them us who what which when where why how can could will would shall should may might must please thank thanks hello hi good morning afternoon evening bye goodbye sorry ok okay right sure fine well now then there here today tomorrow yesterday week next last day days time slot appointment booking book booked reference confirm confirmed cardiology desk doctor dr clinic hospital form submit submitted page name date birth phone email address number card account payment fee amount pay paid receipt total balance status check checked done complete completed cancel cancelled reschedule morning afternoon available availability earliest first second third one two three four five six seven eight nine ten monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december am pm o clock minute minutes hour hours please hold line call calling speak speaking regarding about need needs want would like ask asked asking say said tell told give gave get got take took takes come came go went let know noted note captured record recorded read back repeat also just only very much more less than after before until since while during between into over under out up down off again once twice new old same other another some any each every all both few many most such own so too very s t re ve ll d m help helped helping file ends end on for is that with sure certainly moment hold please thanks bye welcome sir madam ma am yes no correct wrong sorry'.split(/\s+/));

export class Redactor {
  constructor({ hashService, settings = DEFAULT_SETTINGS, dictionary = DICTIONARY }) {
    this.hash = hashService;
    this.digests = hashService.digestSet('maskers');
    this.settings = settings;
    this.dictionary = dictionary;
  }

  // Digests of every candidate window of a text, through the hash service's
  // batched call, matched locally against the maskers' set.
  knownValues(text, caller) {
    const spoken = unspeak(text);
    const tokens = [...spoken.matchAll(/\S+/g)];
    const windows = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let n = 1; n <= 8 && i + n <= tokens.length; n++) {
        const start = tokens[i].index;
        const end = tokens[i + n - 1].index + tokens[i + n - 1][0].length;
        const lead = /^[("']+/.exec(spoken.slice(start, end));
        const { window, candidates } = windowCandidates(spoken.slice(start, end));
        const from = start + (lead ? lead[0].length : 0);
        for (const c of candidates) windows.push({ start: from, end: from + window.length, c });
      }
    }
    if (windows.length === 0) return { spoken, matches: [] };
    const digests = this.hash.digestWindows(caller, 'maskers', windows.map((w) => w.c));
    const matches = [];
    windows.forEach((w, i) => {
      const entry = this.digests.get(digests[i]);
      if (entry) matches.push({ start: w.start, end: w.end, alias: entry.alias, partial: entry.partial });
    });
    return { spoken, matches: minimalMatches(matches) };
  }

  // Replaces every known value in a text with its alias and returns the text
  // and the aliases; format matches are painted; the digit-run shape rule
  // paints beyond the threshold.
  maskText(text, { caller, party, partyShapes, afterSubmit, threshold, manifest, region, registryEntry = null }) {
    let { spoken, matches } = this.knownValues(text, caller);
    let out = '';
    let cursor = 0;
    for (const m of matches) {
      out += spoken.slice(cursor, m.start);
      out += m.alias;
      manifest.push({ rule: 'known-value', region, registry_entry: registryEntry, alias: m.alias, marker: 'alias' });
      cursor = m.end;
    }
    out += spoken.slice(cursor);
    let painted = out;
    const formats = [...patternMatches(painted, { party, partyShapes }), ...dictionaryMatches(painted, this.dictionary)].filter((m) => !/\{\{/.test(m.text));
    for (const m of formats.sort((a, b) => b.start - a.start)) {
      if (painted.slice(m.start, m.end).includes('{{')) continue;
      painted = painted.slice(0, m.start) + PAINT + painted.slice(m.end);
      manifest.push({ rule: 'format', region, registry_entry: null, alias: null, marker: 'paint' });
    }
    const runs = afterSubmit ? new RegExp(`\\d{${threshold + 1},}`, 'g') : new RegExp(`\\d{${Math.max(threshold + 1, 7)},}`, 'g');
    painted = painted.replace(runs, () => {
      manifest.push({ rule: 'format', region, registry_entry: null, alias: null, marker: 'paint' });
      return PAINT;
    });
    return painted;
  }

  redact(artefact, { party = null, partyShapes = [], maskMap = null, whitelist = [], authenticatedPortal = false, afterSubmitWithPlacement = false, allow = null, margin = this.settings.margin, threshold = this.settings.digit_run_threshold } = {}) {
    if (!artefact.registry) throw new Error('an artefact without its placement registry is not accepted');
    const manifest = [];
    const content = JSON.parse(JSON.stringify(artefact.content));
    const caller = `redactor:${artefact.artefact_id}`;
    if (content.text_runs) {
      // 1. Coordinate masks from every registry entry, with a margin.
      for (const e of artefact.registry) {
        if (!e.rectangle) continue;
        for (const run of content.text_runs) {
          if (intersects(run.box, e.rectangle, margin) && run.text !== PAINT) {
            run.text = PAINT;
            manifest.push({ rule: 'coordinate', region: boxText(run.box), registry_entry: e.placement_id, alias: e.alias, marker: 'paint' });
          }
        }
      }
      // 2. Known-value masks by keyed digest, 4. format masks and the shape rule.
      for (const run of content.text_runs) {
        if (run.text === PAINT) continue;
        run.text = this.maskText(run.text, { caller, party, partyShapes, afterSubmit: afterSubmitWithPlacement, threshold, manifest, region: boxText(run.box) });
      }
      // 5. Mask-map masks: image and canvas regions unless cleared; on an
      // authenticated portal everything outside the whitelist; on any page
      // every run the map does not clear.
      for (const img of content.images || []) {
        const cleared = maskMap && maskMap.some((m) => m.region === img.region && m.cleared);
        if (!cleared) {
          img.painted = true;
          manifest.push({ rule: 'mask-map', region: img.region, registry_entry: null, alias: null, marker: 'paint' });
        }
      }
      for (const run of content.text_runs) {
        if (run.text === PAINT) continue;
        const whitelisted = whitelist.includes(run.id) || whitelist.includes(run.field_label);
        const clearedRole = !authenticatedPortal && CLEARED_ROLES.has(run.role);
        if (!whitelisted && !clearedRole && !/^(\{\{[^}]+\}\}|\s|[•])*$/.test(run.text)) {
          run.text = PAINT;
          manifest.push({ rule: 'mask-map', region: boxText(run.box), registry_entry: null, alias: null, marker: 'paint' });
        }
      }
    }
    if (content.segments) {
      const ok = allow || allowlist({ partyTerms: party ? [party.name] : [], threshold });
      for (const seg of content.segments) {
        // 3. Audio windows: registry windows and flagged spans to silence,
        // known values and class formats to silence with a transcript marker.
        const flagged = (content.flagged || []).find((f) => f.start_ms < seg.end_ms && f.end_ms > seg.start_ms);
        if (flagged) {
          seg.text = '[span masked]';
          seg.silenced = true;
          manifest.push({ rule: 'audio-windows', region: `${seg.start_ms}-${seg.end_ms}`, registry_entry: null, alias: null, marker: 'span-masked' });
          continue;
        }
        const win = artefact.registry.find((e) => e.window && e.window.start_ms < seg.end_ms && e.window.end_ms > seg.start_ms);
        if (win) {
          seg.text = win.alias;
          seg.silenced = true;
          manifest.push({ rule: 'audio-windows', region: `${seg.start_ms}-${seg.end_ms}`, registry_entry: win.placement_id, alias: win.alias, marker: 'silence' });
          continue;
        }
        const before = manifest.length;
        seg.text = this.maskText(seg.text, { caller, party, partyShapes, afterSubmit: false, threshold, manifest, region: `${seg.start_ms}-${seg.end_ms}` });
        if (manifest.length > before) seg.silenced = true;
        const words = seg.text.split(/\s+/).map((w) => (/\{\{/.test(w) || w === PAINT || ok(w) ? w : (manifest.push({ rule: 'audio-windows', region: `${seg.start_ms}-${seg.end_ms}`, registry_entry: null, alias: null, marker: 'span-masked' }), '[span masked]')));
        seg.text = words.join(' ');
        if (seg.text.includes('[span masked]')) seg.silenced = true;
      }
    }
    if (content.draft) {
      content.draft = this.maskText(content.draft, { caller, party, partyShapes, afterSubmit: false, threshold, manifest, region: 'draft' });
    }
    return { ...artefact, stage: 'redacted', content, manifest };
  }
}

// A second, independent pass: its own recognisers, its own digest set under
// its own key, no code shared with the redactor. It fails closed.
export class Verifier {
  constructor({ hashService, keyId = 'k_verifier-1', settings = DEFAULT_SETTINGS, dictionary = DICTIONARY }) {
    this.hash = hashService;
    this.digests = hashService.digestSet('verifier');
    this.key = keyPair(keyId);
    this.settings = settings;
    this.dictionary = dictionary;
  }

  // The verifier's own recognisers: written separately and kept simple, so a
  // defect in the redactor's does not hide in them.
  ownRecognisers(text, threshold) {
    const hits = [];
    const t = text.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|oh)\b/gi, '#');
    if (new RegExp(`(?:#[\\s-]*){${Math.max(4, threshold - 2)},}`).test(t)) hits.push('spoken digits');
    if (new RegExp(`\\d(?:[\\s-]?\\d){${threshold - 1},}`).test(text)) hits.push('digit run');
    if (/\b[A-Z]{5}\d{4}[A-Z]\b/.test(text)) hits.push('pan-shaped run');
    if (/\b[A-Z]{2}\d{6}[A-D]\b/.test(text)) hits.push('ni-shaped run');
    if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text)) hits.push('email-shaped run');
    if (/\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/.test(text)) hits.push('date-shaped run');
    if (/(?:₹|rs\.?|inr|£|\$|usd|gbp)\s?\d|\d\s?(?:rupees|pounds|dollars|lakh|crore)/i.test(text)) hits.push('amount-shaped run');
    if (/\b(?=[A-Za-z0-9-]*[A-Za-z])(?=[A-Za-z0-9-]*\d)[A-Za-z0-9][A-Za-z0-9-]{5,}\b/.test(text.replace(/\{\{[^}]*\}\}/g, ''))) hits.push('reference-shaped run');
    for (const terms of Object.values(this.dictionary)) for (const term of terms) if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) hits.push(`dictionary term`);
    return hits;
  }

  knownValue(text, caller) {
    const spoken = text.replace(/\b(zero|oh)\b/gi, '0').replace(/\bone\b/gi, '1').replace(/\btwo\b/gi, '2').replace(/\bthree\b/gi, '3').replace(/\bfour\b/gi, '4').replace(/\bfive\b/gi, '5').replace(/\bsix\b/gi, '6').replace(/\bseven\b/gi, '7').replace(/\beight\b/gi, '8').replace(/\bnine\b/gi, '9');
    const tokens = spoken.split(/\s+/).filter(Boolean);
    const windows = [];
    for (let i = 0; i < tokens.length; i++) for (let n = 1; n <= 8 && i + n <= tokens.length; n++) {
      const w = tokens.slice(i, i + n).join(' ').replace(/[.,;:!?)("']+$/, '');
      const plain = /^[A-Za-z0-9]+([\s-][A-Za-z0-9]+)*$/.test(w);
      const set = new Set([w, w.toLowerCase()]);
      if (plain) for (const x of [w.replace(/[\s-]/g, ''), w.replace(/[\s-]/g, '').toUpperCase()]) set.add(x);
      if (!/[A-Za-z]/.test(w) && /\d/.test(w)) set.add(w.replace(/\D/g, ''));
      if (/^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/.test(w)) {
        const [d, m, y] = w.split(/[/.-]/);
        const yy = y.length === 2 ? (Number(y) > 30 ? `19${y}` : `20${y}`) : y;
        set.add(`${yy}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        set.add(`${yy}-${d.padStart(2, '0')}-${m.padStart(2, '0')}`);
      }
      for (const c of set) if (c) windows.push(c);
    }
    if (!windows.length) return null;
    const digests = this.hash.digestWindows(caller, 'verifier', windows);
    for (const d of digests) if (this.digests.has(d)) return this.digests.get(d).alias;
    return null;
  }

  verify(artefact, { whitelist = [], authenticatedPortal = false, allow = null, party = null } = {}) {
    const hits = [];
    const caller = `verifier:${artefact.artefact_id}`;
    const c = artefact.content;
    const threshold = this.settings.digit_run_threshold;
    for (const run of c.text_runs || []) {
      if (run.text === PAINT) continue;
      const kv = this.knownValue(run.text, caller);
      if (kv) hits.push({ rule: 'known-value', alias: kv, region: boxText(run.box) });
      for (const h of this.ownRecognisers(run.text, threshold)) hits.push({ rule: 'format', alias: null, region: boxText(run.box), detail: h });
      const whitelisted = whitelist.includes(run.id) || whitelist.includes(run.field_label);
      if (authenticatedPortal && !whitelisted && !/^(\{\{[^}]+\}\}|\s)*$/.test(run.text)) hits.push({ rule: 'mask-map', alias: null, region: boxText(run.box), detail: 'outside the whitelist' });
      if (!authenticatedPortal && !whitelisted && !CLEARED_ROLES.has(run.role) && !/^(\{\{[^}]+\}\}|\s)*$/.test(run.text)) hits.push({ rule: 'mask-map', alias: null, region: boxText(run.box), detail: 'outside the cleared regions' });
    }
    for (const img of c.images || []) if (!img.painted && !(whitelist.includes(img.region))) hits.push({ rule: 'mask-map', alias: null, region: img.region, detail: 'image not painted or cleared' });
    const ok = allow || allowlist({ partyTerms: party ? [party.name] : [], threshold });
    for (const seg of c.segments || []) {
      const kv = this.knownValue(seg.text, caller);
      if (kv) hits.push({ rule: 'known-value', alias: kv, region: `${seg.start_ms}-${seg.end_ms}` });
      for (const h of this.ownRecognisers(seg.text, threshold)) hits.push({ rule: 'audio-windows', alias: null, region: `${seg.start_ms}-${seg.end_ms}`, detail: h });
      for (const w of seg.text.split(/\s+/)) if (!(/\{\{/.test(w) || w === PAINT || /^\[span$|^masked\]$/.test(w) || ok(w))) hits.push({ rule: 'audio-windows', alias: null, region: `${seg.start_ms}-${seg.end_ms}`, detail: 'span the allowlist would not clear' });
    }
    if (c.draft) {
      const kv = this.knownValue(c.draft, caller);
      if (kv) hits.push({ rule: 'known-value', alias: kv, region: 'draft' });
      for (const h of this.ownRecognisers(c.draft, threshold)) hits.push({ rule: 'format', alias: null, region: 'draft', detail: h });
    }
    if (hits.length) return { ok: false, hits };
    const hash = sha256(artefact.content);
    const record = { artefact_id: artefact.artefact_id, hash, key_id: this.key.key_id };
    record.signature = signRecord(this.key.privateKey, record);
    return { ok: true, hits: [], signature: record };
  }
}

// Table 3.3: who may open an artefact, which one, when, and what the user reads.
export class EvidenceStore {
  constructor({ verifierPublicKey, ledger, ids }) {
    this.verifierPublicKey = verifierPublicKey;
    this.ledger = ledger;
    this.ids = ids;
    this.artefacts = new Map();
    this.roles = new Map(localVocabulary('viewer-roles').members.map((m) => [m.id, m]));
  }

  put(artefact, signature, { at }) {
    if (artefact.stage !== 'verified') throw new Error('only a verified artefact is stored');
    if (!signature || signature.artefact_id !== artefact.artefact_id) throw new Error('the store accepts an artefact only with the verifier\'s signature');
    if (signature.hash !== sha256(artefact.content)) throw new Error('the signature is over another content');
    if (!verifyRecord(this.verifierPublicKey, signature)) throw new Error('the signature does not verify');
    const stored = { ...artefact, stage: 'stored', verifier: { hash: signature.hash, signature: signature.signature, key_id: signature.key_id, attempts: artefact.attempts || 1 } };
    delete stored.attempts;
    this.artefacts.set(artefact.artefact_id, stored);
    this.ledger.append({ task_id: artefact.task_id, step_id: artefact.step_id, at, alias: null, event_type: 'evidence-stored', use: '', surface: 'evidence-store', party: null, placed_by: null, seen_by: 'no person', outcome: 'masked', artefact_ref: artefact.artefact_id, written_by: 'evidence-pipeline' });
    return stored;
  }

  open(artefactId, { role, reason, at, party = 'the party', what = 'screenshot' }) {
    const r = this.roles.get(role);
    if (!r) throw new Error(`no viewer role ${role}`);
    const a = this.artefacts.get(artefactId);
    if (!a) throw new Error('no such artefact; there is no raw store for anyone to be granted access to');
    if (r.id === 'engineering') return { manifest: a.manifest, artefact: null };
    if (!r.may_open) throw new Error(`a ${role} never opens an artefact`);
    if (role === 'checker' && reason !== 'dual-control check') throw new Error('a checker opens an artefact only during the check');
    if (role === 'legal') {
      this.ledger.append({ task_id: a.task_id, step_id: null, at, alias: null, event_type: 'released', use: '', surface: 'evidence-store', party: null, placed_by: null, seen_by: 'legal', outcome: 'masked', artefact_ref: artefactId, viewer_role: 'legal', written_by: 'evidence-store' });
    } else {
      this.ledger.append({ task_id: a.task_id, step_id: a.step_id, at, alias: null, event_type: 'evidence-opened', use: `requested by ${what}`, surface: 'evidence-store', party, placed_by: null, seen_by: role, outcome: 'masked', artefact_ref: artefactId, viewer_role: role, written_by: 'evidence-store' });
    }
    return { manifest: a.manifest, artefact: a };
  }
}

export class EvidencePipeline {
  constructor({ redactor, verifier, store, ledger, ids, settings = DEFAULT_SETTINGS }) {
    this.redactor = redactor;
    this.verifier = verifier;
    this.store = store;
    this.ledger = ledger;
    this.ids = ids;
    this.settings = settings;
    this.incidents = [];
    this.memory = new Map();
  }

  capture(raw) {
    if (!raw.registry) throw new Error('an artefact without its registry is not accepted');
    const artefact = { ...raw, stage: 'captured' };
    this.memory.set(artefact.artefact_id, artefact);
    return artefact;
  }

  // Redact, verify, and on a hit quarantine, open an incident naming only the
  // alias and the rule, re-run with wider masks, and after a small fixed
  // number of attempts drop the raw material and record "evidence withheld".
  process(artefactId, opts, { at }) {
    const raw = this.memory.get(artefactId);
    if (!raw) throw new Error('nothing in memory under that id');
    let margin = this.settings.margin;
    let threshold = this.settings.digit_run_threshold;
    for (let attempt = 1; attempt <= this.settings.max_attempts; attempt++) {
      const redacted = this.redactor.redact(raw, { ...opts, margin, threshold });
      const v = this.verifier.verify(redacted, opts);
      if (v.ok) {
        const stored = this.store.put({ ...redacted, stage: 'verified', attempts: attempt }, v.signature, { at });
        this.memory.delete(artefactId);
        return { stored, attempts: attempt };
      }
      const hit = v.hits[0];
      this.incidents.push({ incident_id: this.ids.next('inc', 4), task_id: raw.task_id, step_id: raw.step_id, class: 'verifier-detection', rule: `${hit.rule}${hit.detail ? `:${hit.detail}` : ''}`, alias: hit.alias || null, alias_class: null, opened_by: 'evidence-verifier', at, detail: `attempt ${attempt}` });
      margin *= 2;
      threshold = Math.max(3, threshold - 2);
    }
    this.memory.delete(artefactId);
    const withheld = { artefact_id: raw.artefact_id, task_id: raw.task_id, step_id: raw.step_id, kind: raw.kind, capture_point: raw.capture_point, surface_clock: raw.surface_clock, stage: 'withheld', registry: raw.registry, manifest: [], content: null, verifier: null, note: 'evidence withheld: redaction could not be verified' };
    this.ledger.append({ task_id: raw.task_id, step_id: raw.step_id, at, alias: null, event_type: 'evidence-withheld', use: '', surface: 'evidence-store', party: null, placed_by: null, seen_by: 'no person', outcome: 'withheld', artefact_ref: raw.artefact_id, written_by: 'evidence-pipeline' });
    return { stored: null, withheld, attempts: this.settings.max_attempts };
  }
}
