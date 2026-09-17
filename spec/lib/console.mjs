// The worker console's card generator: a task card is a projection of the
// step record (02, 3.2), screened by the hash service and painted by the
// allowlist default before it reaches a console. An envelope line reaches the
// card as presence and comparison only, never as a number.
import { capLine, remainingCapLine } from './envelope.mjs';

const REQUIRED_FIELDS = {
  ok: ['reference (if any)', 'timestamp', 'party'],
  'ok-with-variance': ['reference (if any)', 'timestamp', 'party', 'variance note'],
  'blocked-third-party': ['party', 'response window'],
  'blocked-needs-user': ['what is needed', 'why'],
  'blocked-outside-envelope': ['the envelope line it would breach'],
  'failed-retryable': ['error class'],
  'failed-final': ['reason', 'alternatives considered'],
  'refused-policy': ['policy reference'],
  superseded: ['superseding step'],
};

const PAINT = '••••';

export function paintFreeText(text, { threshold = 6 } = {}) {
  return text.replace(new RegExp(`\\d{${threshold + 1},}`, 'g'), PAINT);
}

export class ConsoleError extends Error {}

export function renderCard(step, { hashService, envelope, party, pseudonym, at, position }) {
  const screen = (text, field) => {
    const r = hashService.screen(text, { mode: 'reject', caller: `card:${step.step_id}:${field}`, at });
    if (r.status === 'reject') throw new ConsoleError(`card payload for ${step.step_id} carried a ${r.classes.join(', ')} in ${field}; incident ${r.incident.incident_id}`);
    return paintFreeText(text);
  };
  const lines = [...step.envelope_lines];
  const capText = envelope ? capLine(envelope) : null;
  if (capText && !lines.includes(capText)) lines.push(capText);
  for (const l of lines) if (/\d/.test(l)) throw new ConsoleError('an envelope line reaches the card as presence and comparison only, never as a number');
  return {
    header: { client: pseudonym, step: position, timer: step.deadline || null },
    step_sentence: screen(step.purpose, 'purpose'),
    facts_in_clear: step.facts_in_clear.map((f, i) => screen(f, `facts_in_clear[${i}]`)),
    script: (step.script || []).map((s, i) => screen(s, `script[${i}]`)),
    fields: step.fields.map((alias) => ({ alias, shown: PAINT, control: 'place' })),
    surface_note: `${step.surface === 'browser' ? 'in a browser we run' : step.surface === 'telephony' ? 'on our phone line' : step.surface === 'relay' ? 'through our relay' : 'on the user\'s device'}${party ? `; ${party.name}` : ''}`,
    envelope_lines: lines,
    expected_outcome: screen(step.expected_outcome, 'expected_outcome'),
    result_form: Object.fromEntries(Object.entries(REQUIRED_FIELDS).map(([code, f]) => [code, f])),
  };
}

// The check card: the act in one sentence, the envelope lines it touches as
// presence and comparison, the remaining-cap comparison computed by the task
// service and never the amount, the expected outcome, and the evidence.
export function renderCheckCard(step, { envelope, committed, amount, evidence, hashService, at }) {
  const r = hashService.screen(step.purpose, { mode: 'reject', caller: `check:${step.step_id}`, at });
  if (r.status === 'reject') throw new ConsoleError('a check card carried a value');
  return {
    act: paintFreeText(step.purpose),
    envelope_lines: [...step.envelope_lines, capLine(envelope)],
    remaining_cap: remainingCapLine(envelope, committed, amount),
    expected_outcome: paintFreeText(step.expected_outcome),
    fields: step.fields.map((alias) => ({ alias, shown: PAINT })),
    evidence,
    decisions: ['approve', 'decline'],
  };
}
