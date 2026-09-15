// The hash service (02, 8.3; 03, 1.2 and 1.3): the second of the two places
// the vault SDK exists. It holds the two digest keys, issues two digest sets,
// answers batched digest calls under a rate limit, and runs the screen over
// text written on our side with the same four detectors the vault's edge
// proxy runs. It holds no detokenise right.
import { createHmac, randomBytes } from 'node:crypto';
import { patternMatches, dictionaryMatches, normalisedForms, partialForms, unspeak, unspeakAmounts, windowCandidates, minimalMatches, DICTIONARY } from './detectors.mjs';
import { DETECTORS } from './vocab.mjs';

export class ScreenError extends Error {}

function hmac(key, text) {
  return createHmac('sha256', key).update(text).digest('hex');
}

export class HashService {
  constructor({ vault, user, rateLimit = { windows_per_call: 4000, calls_per_minute: 600 }, dictionary = DICTIONARY, ids }) {
    this.vault = vault;
    this.user = user;
    this.ids = ids;
    this.digestCred = vault.issueCredential({ holder: 'hash-service', ops: ['digest'] });
    this.tokeniseCred = vault.issueCredential({ holder: 'hash-service', ops: ['tokenise'] });
    this.keys = { maskers: randomBytes(32), verifier: randomBytes(32) };
    this.rateLimit = rateLimit;
    this.dictionary = dictionary;
    this.calls = new Map();
    this.alarms = [];
    this.ledgerLines = [];
    this.incidents = [];
    this.refresh();
  }

  // Two digest sets under two keys: one to the maskers on the surfaces and in
  // the redactor, one to the verifier. Each maps a digest to the alias it
  // names; neither key leaves this service.
  refresh() {
    this.sets = { maskers: new Map(), verifier: new Map() };
    this.vault.digest(this.digestCred, ({ alias, cls, type, value }) => {
      const partial = new Set(partialForms(cls, type, value));
      for (const form of normalisedForms(cls, type, value)) {
        const entry = { alias, partial: partial.has(form) };
        this.sets.maskers.set(hmac(this.keys.maskers, form), entry);
        this.sets.verifier.set(hmac(this.keys.verifier, form), entry);
      }
      return [];
    });
    return this;
  }

  rotate() {
    this.keys = { maskers: randomBytes(32), verifier: randomBytes(32) };
    return this.refresh();
  }

  // A digest set maps each digest to the alias it names and whether the form
  // is a partial; it never carries a key or a value.
  digestSet(which) {
    if (!['maskers', 'verifier'].includes(which)) throw new ScreenError('two sets: maskers and verifier');
    return new Map([...this.sets[which]].map(([d, e]) => [d, { ...e }]));
  }

  // Windows in, digests out, never a match or a value: batched and
  // rate-limited to a frame's or a segment's volume. A breach is one of the
  // three monitored alarms.
  digestWindows(caller, which, windows, at = null) {
    if (windows.length > this.rateLimit.windows_per_call) {
      this.alarms.push({ kind: 'rate-limit-breach', caller, at, count: windows.length });
      throw new ScreenError(`rate limit: ${windows.length} windows in one call from ${caller}`);
    }
    const n = (this.calls.get(caller) || 0) + 1;
    this.calls.set(caller, n);
    if (n > this.rateLimit.calls_per_minute) {
      this.alarms.push({ kind: 'rate-limit-breach', caller, at, calls: n });
      throw new ScreenError(`rate limit: ${n} calls from ${caller}`);
    }
    const key = this.keys[which];
    return windows.map((w) => hmac(key, w));
  }

  resetMinute() {
    this.calls.clear();
  }

  // The checker's field-match check: does the field's digest equal the digest
  // behind the alias the step names? Answered yes or no, never with a value.
  fieldMatches(fieldText, alias, cls, type) {
    const want = new Set(normalisedForms(cls, type, fieldText).map((f) => hmac(this.keys.maskers, f)));
    for (const [d, e] of this.sets.maskers) if (e.alias === alias && !e.partial && want.has(d)) return true;
    return false;
  }

  // The four detectors over a candidate text. Known values are found by
  // digesting every candidate window of the text in every normalised form,
  // in memory, against the maskers' set; the text is never stored.
  detect(text, { declared = [], party = null, partyShapes = [], detectors = DETECTORS } = {}) {
    const spoken = unspeakAmounts(unspeak(text));
    const found = [];
    if (detectors.includes('identifier-pattern')) for (const m of patternMatches(spoken, { party, partyShapes })) found.push({ ...m, detector: 'identifier-pattern' });
    if (detectors.includes('dictionary')) for (const m of dictionaryMatches(spoken, this.dictionary)) found.push({ ...m, detector: 'dictionary' });
    if (detectors.includes('declaration')) for (const d of declared) found.push({ start: d.start, end: d.end, text: spoken.slice(d.start, d.end), cls: d.cls, type: d.type, normalised: spoken.slice(d.start, d.end), detector: 'declaration' });
    const known = [];
    if (detectors.includes('known-value-digest')) {
      const tokens = [...spoken.matchAll(/\S+/g)];
      for (let i = 0; i < tokens.length; i++) {
        for (let n = 1; n <= 8 && i + n <= tokens.length; n++) {
          const start = tokens[i].index;
          const end = tokens[i + n - 1].index + tokens[i + n - 1][0].length;
          const lead = /^[("']+/.exec(spoken.slice(start, end));
          const { window, candidates } = windowCandidates(spoken.slice(start, end));
          const from = start + (lead ? lead[0].length : 0);
          for (const c of candidates) {
            const entry = this.sets.maskers.get(hmac(this.keys.maskers, c));
            if (entry) {
              known.push({ start: from, end: from + window.length, text: window, cls: this.vault.classOf(this.user, entry.alias), type: entry.alias.slice(2, -2), normalised: c, detector: 'known-value-digest', alias: entry.alias, partial: entry.partial });
              if (!entry.partial) break;
            }
          }
        }
      }
    }
    // A known value is the run itself; it beats a pattern on the same span,
    // and matches never overlap.
    const chosen = minimalMatches(known);
    for (const m of found.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start))) {
      if (chosen.some((c) => m.start < c.end && m.end > c.start)) continue;
      chosen.push(m);
    }
    chosen.sort((a, b) => a.start - b.start);
    return { text: spoken, matches: chosen };
  }

  // The screen. For text written on our side (mode tokenise) every match is
  // tokenised through the tokenise-only credential, a "received" ledger line
  // is written per alias, and the text comes back with aliases in place. For a
  // payload that should already be alias-only (mode reject) a match is a
  // defect: the answer is reject naming the class, with the screened text.
  screen(text, { mode, caller, at, declared = [], party = null, partyShapes = [], source = 'text written on our side' }) {
    if (!['tokenise', 'reject'].includes(mode)) throw new ScreenError('mode is tokenise or reject');
    const { text: spoken, matches } = this.detect(text, { declared, party, partyShapes });
    if (matches.length === 0) return { status: 'clean', text, aliases_issued: [], matches: [] };
    let out = '';
    let cursor = 0;
    const issued = [];
    for (const m of matches) {
      out += spoken.slice(cursor, m.start);
      let alias = m.alias;
      if (!alias && mode === 'tokenise') {
        alias = this.vault.tokenise(this.tokeniseCred, { user: this.user, cls: m.cls, type: typeFor(m), qualifier: qualifierFor(m, party), value: m.text, entered_by: caller, at });
        issued.push(alias);
        this.ledgerLines.push({ alias, event_type: 'received', source, at, written_by: 'hash-service' });
      }
      out += alias || `[${m.cls}]`;
      cursor = m.end;
    }
    out += spoken.slice(cursor);
    if (mode === 'reject') {
      const classes = [...new Set(matches.map((m) => m.cls))];
      const incident = { incident_id: this.ids ? this.ids.next('inc', 4) : `inc_${this.incidents.length + 1}`, task_id: null, step_id: null, class: 'value-in-alias-zone', rule: `screen:${caller}`, alias: matches.find((m) => m.alias) ? matches.find((m) => m.alias).alias : null, alias_class: classes[0], opened_by: 'hash-service', at, detail: out };
      this.incidents.push(incident);
      return { status: 'reject', classes, text: out, aliases_issued: [], matches: matches.map(({ text: _t, normalised: _n, ...rest }) => rest), incident };
    }
    if (issued.length) this.refresh();
    return { status: 'found', text: out, aliases_issued: issued, matches: matches.map(({ text: _t, normalised: _n, ...rest }) => rest) };
  }
}

export function typeFor(m) {
  if (m.type.startsWith('reference')) return 'reference';
  if (m.cls === 'health-and-legal-matter') return m.type.split('.')[0];
  if (m.type === 'date') return 'date';
  if (m.type === 'amount') return 'amount';
  return m.type;
}

export function qualifierFor(m, party) {
  if (m.type.startsWith('reference')) return party || null;
  if (m.cls === 'health-and-legal-matter') return m.type.split('.')[1];
  if (m.type === 'amount') return 'n';
  if (m.type === 'card') return 'primary';
  return null;
}

// The vault's edge proxy: the provider's tokenising proxy, run in the market's
// region under our detector policy. Every channel and every rail response
// terminates here, so no process of ours holds a raw byte.
export class EdgeProxy {
  constructor({ vault, hashService, user, ids, holdWindow = 'PT15M' }) {
    this.vault = vault;
    this.hashService = hashService;
    this.user = user;
    this.ids = ids;
    this.cred = vault.issueCredential({ holder: 'vault-edge-proxy', ops: ['tokenise'] });
    this.held = [];
    this.ledgerLines = [];
  }

  // A message from the user's channel: text, attachments and a voice note,
  // tokenised inside the proxy; the request carries aliases only. A suspected
  // value the detectors cannot type holds the message and nothing opens.
  tokeniseMessage({ text, attachments = [], voice = null, declared = [], at, channel, party = null, partyShapes = [] }) {
    const { text: spoken, matches } = this.hashService.detect(text, { declared, party, partyShapes });
    const suspected = matches.filter((m) => m.cls === 'never-an-alias');
    if (suspected.length) {
      const hold = { held_at: at, reason: 'a suspected value the detectors cannot type', expires: null };
      this.held.push(hold);
      return { status: 'held', hold };
    }
    let out = '';
    let cursor = 0;
    const issued = [];
    for (const m of matches) {
      out += spoken.slice(cursor, m.start);
      let alias = m.alias;
      if (!alias) {
        alias = this.vault.tokenise(this.cred, { user: this.user, cls: m.cls, type: typeFor(m), qualifier: qualifierFor(m, party), value: m.text, entered_by: `channel:${channel}`, at });
        issued.push(alias);
        this.ledgerLines.push({ alias, event_type: 'received', source: 'your message', at, written_by: 'vault-edge-proxy' });
      }
      out += alias;
      cursor = m.end;
    }
    out += spoken.slice(cursor);
    const docs = attachments.map((a) => {
      const alias = this.vault.tokenise(this.cred, { user: this.user, cls: 'document', type: 'doc', qualifier: a.document_type, value: a.bytes, entered_by: `channel:${channel}`, at });
      issued.push(alias);
      this.ledgerLines.push({ alias, event_type: 'received', source: 'your message', at, written_by: 'vault-edge-proxy' });
      return { kind: a.kind, alias, document_type: a.document_type, ambiguous: !!a.ambiguous };
    });
    let voiceOut = null;
    if (voice) {
      const audio = this.vault.tokenise(this.cred, { user: this.user, cls: 'document', type: 'doc', qualifier: 'voice-note', value: voice.audio, entered_by: `channel:${channel}`, at });
      issued.push(audio);
      const t = this.tokeniseMessage({ text: voice.transcript, at, channel, party, partyShapes });
      voiceOut = { transcript: t.text, audio, spans: t.matches.map((m) => ({ alias: m.alias, start_ms: m.start * 50, end_ms: m.end * 50 })) };
      issued.push(...t.aliases_issued);
    }
    if (issued.length) this.hashService.refresh();
    return { status: 'clean', text: out, attachments: docs, voice: voiceOut, aliases_issued: [...new Set(issued)], matches: matches.map((m) => ({ start: m.start, end: m.end, alias: m.alias || out.slice(m.start, m.start + 40), cls: m.cls })) };
  }

  // The device form: a typed field posts straight to the proxy and returns
  // an alias; the class is declared, never inferred.
  tokeniseField({ cls, type, qualifier = null, value, at }) {
    const alias = this.vault.tokenise(this.cred, { user: this.user, cls, type, qualifier, value, entered_by: 'device-form', at });
    this.ledgerLines.push({ alias, event_type: 'received', source: 'your device', at, written_by: 'vault-edge-proxy' });
    this.hashService.refresh();
    return alias;
  }

  // A rail response against a declared schema in which sensitivity is stated
  // per field and never inferred; an undeclared field is sensitive until
  // classified.
  tokeniseRailResponse({ rail, schema, payload, at }) {
    const out = {};
    const issued = [];
    for (const [field, value] of Object.entries(payload)) {
      const decl = schema[field];
      if (!decl) {
        const alias = this.vault.tokenise(this.cred, { user: this.user, cls: 'personal-fact', type: field.replace(/[^a-z0-9]/gi, '-').toLowerCase(), value: String(value), entered_by: `rail:${rail}`, at });
        out[field] = alias;
        issued.push(alias);
        continue;
      }
      if (decl.sensitive) {
        const alias = this.vault.tokenise(this.cred, { user: this.user, cls: decl.cls, type: decl.type, qualifier: decl.qualifier || null, value: String(value), entered_by: `rail:${rail}`, at });
        out[field] = alias;
        issued.push(alias);
        this.ledgerLines.push({ alias, event_type: 'received', source: `${rail}, which you authorised on your device`, at, written_by: 'vault-edge-proxy' });
      } else out[field] = value;
    }
    if (issued.length) this.hashService.refresh();
    return { payload: out, aliases_issued: issued };
  }
}
