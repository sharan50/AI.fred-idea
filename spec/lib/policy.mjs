// The policy layer: one interface, keyed by jurisdiction and act type, that
// answers delegated, bounce or prohibited pending with a condition. A row that
// does not exist evaluates to bounce; a delegated whose condition does not
// hold reads bounce; for an act toward an institution the lookup is made
// twice and the stricter result governs.
import { flagRowFor, CONDITION_PREDICATES, FLAG_VALUES } from './vocab.mjs';

export const STRICTNESS = { delegated: 1, bounce: 2, 'prohibited-pending': 3 };

export function stricter(a, b) {
  return STRICTNESS[a] >= STRICTNESS[b] ? a : b;
}

export function lookup(table, jurisdiction, row) {
  if (row === null) return null;
  const r = table.rows[row];
  if (!r) return null;
  return r[jurisdiction] || null;
}

// Evaluates one cell under one jurisdiction. `holds(predicate)` is the policy
// layer's own evaluation of a named predicate from the envelope record and the
// adapter's facts; a condition is a conjunction of named predicates and never a
// free expression.
export function readCell(table, jurisdiction, row, holds = () => false) {
  const cell = lookup(table, jurisdiction, row);
  if (!cell) return { jurisdiction, row, flag: 'bounce', condition: null, condition_holds: null, reads: 'bounce' };
  if (!FLAG_VALUES.includes(cell.flag)) throw new Error(`flag ${cell.flag} is not one of the three values`);
  if (!cell.condition) return { jurisdiction, row, flag: cell.flag, condition: null, condition_holds: null, reads: cell.flag };
  for (const p of cell.condition) if (!CONDITION_PREDICATES.includes(p)) throw new Error(`condition names an unknown predicate ${p}`);
  const conditionHolds = cell.condition.every((p) => holds(p) === true);
  const reads = cell.flag === 'delegated' && !conditionHolds ? 'bounce' : cell.flag;
  return { jurisdiction, row, flag: cell.flag, condition: cell.condition, condition_holds: conditionHolds, reads };
}

export function evaluate(table, { act, delegator_jurisdiction, institution_market = null, holds = () => false, healthRecord = false }) {
  const row = flagRowFor(act, { healthRecord });
  if (row === null) {
    // A one-time code has no line: it is the user's factor by design.
    return { act, row: null, delegator_jurisdiction, institution_market, under_delegator: null, under_institution: null, governing: 'bounce', consulted: false };
  }
  const underDelegator = readCell(table, delegator_jurisdiction, row, holds);
  const underInstitution = institution_market ? readCell(table, institution_market, row, holds) : null;
  const governing = underInstitution ? stricter(underDelegator.reads, underInstitution.reads) : underDelegator.reads;
  return { act, row, delegator_jurisdiction, institution_market, under_delegator: underDelegator, under_institution: underInstitution, governing, consulted: true };
}

// The six named predicates, evaluated from the envelope record and the
// adapter's facts. Everything the predicates need is passed in; nothing is a
// free expression.
export function predicateEvaluator({ envelope = null, stepId = null, party = null, facts = [], credentialAlias = null, recordAlias = null, rail = {} } = {}) {
  const scoped = (lines, key, value) => (lines || []).some((l) => l[key] === value && (l.scope === 'task' || l.scope === stepId));
  return (predicate) => {
    switch (predicate) {
      case 'portal-non-financial':
        return !!party && party.financial === false;
      case 'login-delegated-in-envelope':
        return !!envelope && !!credentialAlias && scoped(envelope.delegated_logins, 'record', credentialAlias);
      case 'consent-in-envelope':
        return !!envelope && !!recordAlias && scoped(envelope.health_record_consents, 'record', recordAlias);
      case 'fact-user-confirmed':
        return facts.length > 0 && facts.every((f) => f.user_confirmed === true && f.quality_flag === null);
      case 'mandate-names-payee':
        return !!rail.mandate && !!party && rail.mandate.payee === party.party_id && rail.mandate.revoked !== true;
      case 'network-token-bound':
        return !!rail.network_token && !!party && rail.network_token.merchant === party.party_id && rail.network_token.task_id === rail.task_id && rail.network_token.cap_bound === true;
      default:
        throw new Error(`unknown predicate ${predicate}`);
    }
  };
}
