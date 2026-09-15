// The access ledger (03, section 8; 02, 7.3): one plain-words line for every
// use of every alias, written by the component that performed the event from
// its own record, never by a person, rendered from fields and never from free
// text, append-only.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSchemaDir, canonical } from './validate.mjs';
import { sha256 } from './signing.mjs';
import { ms, offsetOf } from './time.mjs';

const registry = loadSchemaDir(join(dirname(fileURLToPath(import.meta.url)), '..', 'schemas'));

export class LedgerError extends Error {}

// The uses a line may state, as verbs the writing component chooses from.
export const USE_VERBS = ['typed into', 'used to fill', 'sent to', 'uploaded to', 'attached to', 'received from', 'received in', 'placed as', 'being placed into', 'could not be placed', 'presented to', 'entered into', 'asked for by', 'requested by'];

const SURFACE_PHRASE = { 'managed-browser': 'in a browser we run', 'mail-relay': 'through our relay', telephony: 'on our phone line', device: 'on your device', 'vault-edge-proxy': 'at the vault', 'hash-service': 'at the vault', 'evidence-store': 'in the evidence store', console: 'on a console we run' };

export class Ledger {
  constructor({ ids, timeZoneOf = () => '+05:30' } = {}) {
    this.ids = ids;
    this.entries = [];
    this.timeZoneOf = timeZoneOf;
    this.counters = new Map();
  }

  nextId(taskId) {
    const n = (this.counters.get(taskId) || 0) + 1;
    this.counters.set(taskId, n);
    return `l_${taskId.replace(/^t_/, '')}_${String(n).padStart(4, '0')}`;
  }

  // Append: validate the record, chain it to the one before, render it once
  // to prove the wording rules hold, and keep it. A record that fails any of
  // these is never written, which is how "a line the system cannot make true
  // is a line it is not allowed to write" is enforced.
  append(input) {
    const prev = this.entries.at(-1);
    const entry = {
      ledger_id: this.nextId(input.task_id), task_id: input.task_id, step_id: input.step_id === undefined ? null : input.step_id, at: input.at,
      alias: input.alias === undefined ? null : input.alias, event_type: input.event_type, form: input.form === undefined ? null : input.form,
      use: input.use || '', surface: input.surface === undefined ? null : input.surface, party: input.party === undefined ? null : input.party,
      placed_by: input.placed_by === undefined ? null : input.placed_by, seen_by: input.seen_by || 'no person',
      outcome: input.outcome === undefined ? null : input.outcome, policy_ref: input.policy_ref === undefined ? null : input.policy_ref,
      envelope_version: input.envelope_version === undefined ? null : input.envelope_version, placement_id: input.placement_id === undefined ? null : input.placement_id,
      artefact_ref: input.artefact_ref === undefined ? null : input.artefact_ref, viewer_role: input.viewer_role === undefined ? null : input.viewer_role,
      incident_ref: input.incident_ref === undefined ? null : input.incident_ref, written_by: input.written_by, prev_hash: prev ? sha256(canonical(prev)) : null,
    };
    if (entry.step_id === null && !['custody', 'received', 'break-glass', 'reconciled', 'released'].includes(entry.event_type)) throw new LedgerError(`a ${entry.event_type} line carries its step`);
    const r = registry.validate('aifred:ledger-entry', entry);
    if (!r.ok) throw new LedgerError(`ledger record refused: ${r.errors.map((e) => `${e.path} ${e.message}`).join('; ')}`);
    if (entry.use && !USE_VERBS.some((v) => entry.use.startsWith(v))) throw new LedgerError(`the use "${entry.use}" does not start with a verb of the closed list`);
    if (entry.placed_by === 'system' && !(entry.event_type === 'placed' && entry.outcome === 'placed')) throw new LedgerError('"Placed by the system" is written only for a substitutor placement confirmed by the surface');
    const line = render(entry, this.timeZoneOf(entry.task_id));
    const problems = lint(line, entry);
    for (const field of ['use', 'party', 'seen_by']) if (entry[field]) for (const p of lint(`00:00 ${entry[field]}.`)) if (p !== 'the alias does not appear as written') problems.push(`${field}: ${p}`);
    if (problems.length) throw new LedgerError(`line refused: ${problems.join('; ')} :: ${line}`);
    this.entries.push(entry);
    return entry;
  }

  linesFor(taskId) {
    return this.entries.filter((e) => e.task_id === taskId).map((e) => render(e, this.timeZoneOf(taskId)));
  }

  recordsFor(taskId) {
    return this.entries.filter((e) => e.task_id === taskId);
  }

  export(taskId) {
    return { records: this.recordsFor(taskId), lines: this.linesFor(taskId) };
  }

  // The chain proves the store is append-only: any edit breaks every hash after it.
  verifyChain() {
    for (let i = 1; i < this.entries.length; i++) {
      if (this.entries[i].prev_hash !== sha256(canonical(this.entries[i - 1]))) return { ok: false, at: i };
    }
    return { ok: true };
  }
}

function clock(at, tz) {
  const t = ms(at);
  const sign = tz.startsWith('-') ? -1 : 1;
  const mins = tz === 'Z' ? 0 : sign * (Number(tz.slice(1, 3)) * 60 + Number(tz.slice(4, 6)));
  const d = new Date(t + mins * 60000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function seenClause(entry) {
  const s = entry.seen_by || '';
  if (s.startsWith('no person')) return 'No person saw it.';
  if (s.startsWith('worker: alias only')) return 'The worker who wrote it saw the alias only.';
  if (s.startsWith('worker: dots')) return 'A worker saw the field as dots.';
  if (s.startsWith('checker: masked stream')) return 'A checker saw the masked stream.';
  return 'No person saw it.';
}

function stepNumber(entry) {
  return entry.step_id ? String(Number(entry.step_id.replace(/^s_/, ''))) : '';
}

// Rendering from fields, by event type and form. The user is "you", the alias
// appears as written, a worker is "a worker", the party as the user knows it.
export function render(entry, tz = '+05:30') {
  const a = entry.alias;
  const p = entry.party;
  let body;
  switch (entry.event_type) {
    case 'received':
      body = `${a} ${entry.use}${entry.use.includes(', ') ? ',' : ''} and stored in the vault. No person saw it.`;
      break;
    case 'custody':
      body = { 'new-version': `A new version of ${a} was stored in the vault.`, 'partial-issued': `A partial of ${a} was issued by the vault, under its own name.`, destroyed: `${a} was destroyed at the end of its retention.`, 'key-rotated': "The vault's keys were rotated.", renamed: `You renamed ${a} on your device.` }[entry.form] || `${a} changed custody in the vault.`;
      break;
    case 'placed':
      if (entry.form === 'placing') body = `${a} ${entry.use}, ${SURFACE_PHRASE[entry.surface]}.`;
      else if (entry.form === 'not-confirmed') body = `${a} could not be placed; ${entry.surface === 'mail-relay' ? 'the message was dropped' : 'the field was cleared'}. ${seenClause(entry)}`;
      else body = `${a} ${entry.use}, ${SURFACE_PHRASE[entry.surface]}. Placed by the system. ${seenClause(entry)}`;
      break;
    case 'refused':
      if (entry.form === 'worker-request') body = `A worker asked to see ${a}. Refused; nothing was shown. QA has been told.`;
      else body = `A request to place ${a} was refused. Nobody answered it; nothing was placed.`;
      break;
    case 'shown-as-dots':
      body = entry.form === 'checker' ? `A checker saw the masked stream for step ${stepNumber(entry)}.` : `A worker saw the form with ${a} shown as dots.`;
      break;
    case 'echo-masked':
      body = entry.form === 'held' ? 'A frame was held until it could be masked; no person saw it.' : `${p}'s confirmation page displayed ${a}. Masked before any person saw it.`;
      break;
    case 'exposure-recorded':
      body = a ? `${p}'s line read out ${a}; a worker heard it. Recorded as an exposure; we have opened an incident.` : `${p}'s line stated something a worker heard. Recorded as an exposure; we have opened an incident.`;
      break;
    case 'bounced':
      body = { 'code-relayed': 'You entered a one-time code yourself, on your device; the worker saw the field as dots.', 'user-act': 'You performed this step yourself, on your device.', approval: 'You approved this step on your device.', 'do-yourself': a ? `${p} asked for ${a}. Not given on a call; the step went to your own device.` : `${p} asked for ${entry.use.replace(/^asked for by /, '') || 'a value'}. Not given on a call; the step went to your own device.` }[entry.form] || 'You performed this step yourself, on your device.';
      break;
    case 'evidence-stored':
      body = 'Evidence of this step was redacted, checked by a second pass and stored. No raw copy was kept.';
      break;
    case 'evidence-withheld':
      body = 'Evidence of this step could not be verified clean and was destroyed. No raw copy was kept.';
      break;
    case 'evidence-opened': {
      const who = { qa: 'A QA reviewer', escalation: 'The escalation desk', user: 'You', checker: 'A checker', legal: 'A legal request' }[entry.viewer_role] || 'Someone';
      body = `${who} opened the masked ${entry.use.replace(/^requested by /, '') || 'evidence'} of ${p}.`;
      break;
    }
    case 'reconciled':
      body = "The vault's own access log matched every placement on this task.";
      break;
    case 'released':
      body = 'A masked artefact was released under a legal request; see the notice sent to you.';
      break;
    case 'break-glass':
      body = 'A person was given emergency access to a host that had handled this task, after it was drained and its memory zeroed.';
      break;
    default:
      throw new LedgerError(`no rendering for ${entry.event_type}`);
  }
  return `${clock(entry.at, tz)} ${body}`;
}

// What a rendered line can never contain: a real value, a partial, a length,
// a digest, a worker's name, the user's name, an internal identifier the user
// could not act on, or a line a person wrote by hand.
export function lint(line, entry = {}) {
  const problems = [];
  const body = line.replace(/^\d{2}:\d{2} /, '');
  if (/\d{4,}/.test(body)) problems.push('a run of four or more digits');
  if (/\b(?:w_|t_|s_|party_|pl_|ev_|inc_|ctx_|tok_|chk_|dev_|u_)[a-z0-9_-]+/.test(body)) problems.push('an internal identifier');
  if (/\b[0-9a-f]{32,}\b/.test(body)) problems.push('a digest');
  if (/\b(?:last four|last 4|first six|\d+ characters?|\d+-character)\b/i.test(body)) problems.push('a partial or a length');
  if (/\bClient \d+/.test(body)) problems.push('a floor pseudonym');
  if (!/\.$/.test(body)) problems.push('does not end with a full stop');
  if (/\n/.test(body)) problems.push('more than one line');
  if (entry.alias && !body.includes(entry.alias)) problems.push('the alias does not appear as written');
  const aliases = body.match(/\{\{[^}]*\}\}/g) || [];
  for (const x of aliases) if (!/^\{\{[a-z0-9-]+(\.[a-z0-9-]+)*\}\}$/.test(x)) problems.push(`malformed alias ${x}`);
  return problems;
}
