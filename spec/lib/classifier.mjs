// The classifier (02, section 3): every step gets exactly one class, one
// reversibility and one route, by a rule that is the same in every document.
// Deterministic: the model proposes a step type; the catalogue and the policy
// layer decide.
import { USER_ONLY_ACTS, actKind, IDENTITY_ACTS } from './vocab.mjs';
import { evaluate, stricter } from './policy.mjs';
import { admits, withinCap, windowOpen, hasAuthority } from './envelope.mjs';

export const POINT_OF_NO_RETURN_TEST = "can we return the world to its prior state by our own action, at no cost to the user and without a third party's consent?";

// Two questions give four routes, and none has us executing outside the envelope.
export function route(reversibility, inside) {
  if (reversibility === 'reversible') return inside ? 'execute' : 'extension-request';
  return inside ? 'dual-control' : 'bounce';
}

export const DEFAULT_SCOPE = {
  ai_surfaces: ['browser'],
  mail_compose: false,
  irreversible_human_pools: ['L3'],
  verticals: ['health', 'banking', 'legal', 'identity', 'family', 'travel', 'any'],
};

export function classify({ step, catalogue, parties, envelope, flags, scope = DEFAULT_SCOPE, market, at, delegations = [], holds = () => false, committed = { fired: 0, reserved: 0 }, aliasClassOf = () => null, consents = {}, healthRecord = false }) {
  const reasons = [];
  const entry = catalogue.get ? catalogue.get(step.step_type) : catalogue.find((e) => e.step_type === step.step_type);
  const stepId = step.step_id;

  // An unknown step type is irreversible and outside the envelope: it bounces
  // in the do-this-yourself form and the catalogue grows by a request.
  if (!entry) {
    reasons.push('unknown step type: classified irreversible and outside the envelope');
    return {
      class: 'user', reversibility: 'irreversible', route: 'bounce', bounce_form: 'do-yourself', surface: 'device', executor: null, catalogue_request: true,
      policy: { jurisdiction: market, institution_market: null, delegator: 'user', act: step.act, flag: 'bounce' }, lookups: [], inside: null, reasons,
    };
  }

  const party = step.party ? (parties.get ? parties.get(step.party.id) : parties.find((p) => p.party_id === step.party.id)) : null;
  const surface = chooseSurface(entry, step, scope);

  // Reversibility: the catalogue's default, tightened where the envelope does
  // not admit the undo route's act; never loosened.
  let reversibility = entry.reversibility_default.kind;
  if (reversibility === 'reversible' && entry.reversibility_default.undo && entry.reversibility_default.undo.act) {
    if (!admits(envelope, 'act', entry.reversibility_default.undo.act, stepId)) {
      reversibility = 'irreversible';
      reasons.push(`the undo route needs ${entry.reversibility_default.undo.act}, which the envelope does not admit`);
    }
  }
  if (step.reversibility_hint === 'irreversible' && reversibility === 'reversible') {
    reversibility = 'irreversible';
    reasons.push("the planner's hint tightens; the classifier may tighten, never loosen");
  }

  // Inside or outside the envelope, line by line.
  const inside = insideEnvelope({ step, entry, envelope, party, at, committed, stepId });
  if (!inside.ok) reasons.push(`outside the envelope: ${inside.failed.join(', ')}`);

  // Whose aliases: a dependant's delegation record carries the jurisdiction.
  const delegation = delegations.find((d) => d.revoked_at === null && step.fields.some((a) => d.aliases.includes(a))) || null;
  const delegatorJurisdiction = delegation ? delegation.jurisdiction : market;
  const delegator = delegation ? delegation.delegator : 'user';
  const institutionMarket = party ? party.market : null;

  const base = { surface, reversibility, delegation, reasons };

  // A step is user in three cases, checked in this order.
  // First: the act needs a factor only the user holds; no flag is consulted.
  const userOnly = USER_ONLY_ACTS.includes(step.act) || step.fields.some((a) => aliasClassOf(a) === 'never-an-alias');
  if (userOnly) {
    reasons.push('a factor only the user holds; no flag table is consulted');
    return finish({ ...base, class: 'user', route: 'bounce', bounce_form: entry.bounce_form || (step.act === 'enter-one-time-code' ? 'one-time-code' : 'do-yourself'), executor: null, lookups: [], inside, policy: { jurisdiction: delegatorJurisdiction, institution_market: institutionMarket, delegator, act: step.act, flag: 'bounce' } });
  }

  // Second: the policy layer, keyed by jurisdiction and act type, once under
  // the delegator's jurisdiction and once under the institution's market, for
  // the act and for every identity act the step implies; the stricter governs.
  const acts = [...step.identity_acts, step.act].filter((a, i, arr) => arr.indexOf(a) === i);
  const lookups = acts.filter((a) => actKind(a) !== 'committable' || a === 'pay-under-cap').map((a) => evaluate(flags, { act: a, delegator_jurisdiction: delegatorJurisdiction, institution_market: institutionMarket, holds, healthRecord: healthRecord && a === 'present-document' }));
  const committableLookups = acts.filter((a) => actKind(a) === 'committable' && a !== 'pay-under-cap').map((a) => evaluate(flags, { act: a, delegator_jurisdiction: delegatorJurisdiction, institution_market: institutionMarket, holds }));
  const all = [...lookups, ...committableLookups];
  // The policy block names the act whose lookup governs; on a tie it names
  // the identity act, whose line is the one the flag table is about, as the
  // printed step record does for the booking call (attest-fact beside schedule).
  const ordered = [...lookups, ...committableLookups];
  let governing = 'delegated';
  let governingAct = ordered.length ? ordered[0].act : step.act;
  for (const l of ordered) {
    if (stricter(l.governing, governing) !== governing) {
      governing = l.governing;
      governingAct = l.act;
    }
  }
  const policy = { jurisdiction: delegatorJurisdiction, institution_market: institutionMarket, delegator, act: governingAct, flag: governing };
  if (governing === 'prohibited-pending') {
    reasons.push(`prohibited pending a regulatory answer for ${governingAct}: the step closes refused-policy before anyone attempts it`);
    return finish({ ...base, class: null, route: null, bounce_form: null, executor: null, lookups: all, inside, policy, outcome: { code: 'refused-policy', policy_reference: `${delegatorJurisdiction}/${governingAct}` } });
  }
  if (governing === 'bounce') {
    reasons.push(`the flag for ${governingAct} reads bounce; bounce wins even where the user ticked the act`);
    return finish({ ...base, class: 'user', route: 'bounce', bounce_form: entry.bounce_form && entry.bounce_form !== 'approval' ? entry.bounce_form : 'do-yourself', executor: null, lookups: all, inside, policy });
  }

  // Third: irreversible and outside the envelope.
  if (reversibility === 'irreversible' && !inside.ok) {
    reasons.push('irreversible and outside the envelope: bounce to the user\'s device');
    return finish({ ...base, class: 'user', route: 'bounce', bounce_form: entry.bounce_form || 'approval', executor: null, lookups: all, inside, policy });
  }

  // A mail step for a user who has not granted the send scope is the user's,
  // with a draft the harness wrote (DR-018).
  if (surface === 'relay' && !consents.mailbox_send) {
    reasons.push("no mailbox send scope: the message is the user's to send, with our draft");
    return finish({ ...base, class: 'user', route: 'bounce', bounce_form: 'do-yourself', executor: null, lookups: all, inside, policy });
  }

  const r = route(reversibility, inside.ok);
  const ai = aiConditions({ entry, party, surface, scope, step });
  const cls = ai.ok ? 'ai' : 'human';
  if (!ai.ok) reasons.push(`human: ${ai.failed.join(', ')}`);
  const executor = cls === 'ai' ? { kind: 'harness' } : { kind: 'worker', pool: reversibility === 'irreversible' && scope.irreversible_human_pools && !scope.irreversible_human_pools.includes(entry.pool) ? scope.irreversible_human_pools[0] : entry.pool };
  return finish({ ...base, class: cls, route: r, bounce_form: null, executor, lookups: all, inside, policy });
}

function finish(result) {
  return { ...result, delegation: result.delegation ? result.delegation.delegation_id : null };
}

export function chooseSurface(entry, step, scope) {
  if (step.surface && entry.surfaces.includes(step.surface)) return step.surface;
  return entry.surfaces[0];
}

export function insideEnvelope({ step, entry, envelope, party, at, committed, stepId }) {
  const failed = [];
  if (!hasAuthority(envelope)) failed.push('the envelope version carries no device signature');
  if (at && !windowOpen(envelope, at)) failed.push('the validity window is not open');
  if (party && !admits(envelope, 'party', party.party_id, stepId)) failed.push(`party ${party.party_id} is not contactable`);
  if (actKind(step.act) === 'committable' && !admits(envelope, 'act', step.act, stepId)) failed.push(`act ${step.act} is not committable`);
  if (actKind(step.act) === 'identity' && !admits(envelope, 'identity-act', step.act, stepId)) failed.push(`identity act ${step.act} is not delegated`);
  for (const a of step.identity_acts) if (!admits(envelope, 'identity-act', a, stepId)) failed.push(`identity act ${a} is not delegated`);
  if (step.amount && !withinCap(envelope, committed, step.amount, stepId)) failed.push('the amount exceeds the remaining cap');
  return { ok: failed.length === 0, failed };
}

// A step is ai when its catalogue entry lists ai, its surface is one the scope
// block opens to ai steps, the party is machine-navigable for the step type,
// and the entry names a verifier the harness can run; otherwise human.
export function aiConditions({ entry, party, surface, scope, step }) {
  const failed = [];
  if (!entry.executor_classes.includes('ai')) failed.push('the entry does not list ai');
  if (!(scope.ai_surfaces || []).includes(surface)) failed.push(`the scope block does not open ${surface} to ai steps`);
  if (party && !(party.machine_navigable && party.machine_navigable[step.step_type] === true)) failed.push('the party is not machine-navigable for this step type');
  if (!entry.verifier) failed.push('the entry names no verifier');
  if (surface === 'relay' && !scope.mail_compose) failed.push('the scope block does not let the harness compose mail');
  return { ok: failed.length === 0, failed };
}

export { IDENTITY_ACTS };
