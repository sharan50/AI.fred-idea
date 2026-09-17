// The substitution component (03, section 2): one component holds the right
// to turn an alias back into a value, and it does one thing with that right:
// it places the value into a surface we run, writes the line, and tells
// nobody, its caller included, what the value was. Every check passes, in
// order, or the first failure returns a receipt naming the check.
import { SUBSTITUTOR_CHECKS, COMMITTING_ACTIONS } from './vocab.mjs';
import { ms, add } from './time.mjs';
import { contextLive } from './context.mjs';
import { tokenState } from './envelope.mjs';

// Which surfaces each alias class admits (Table 3.1). A call admits none.
export const ALIAS_SURFACES = {
  'identity-number': ['browser', 'relay'],
  'payment-instrument': ['browser', 'relay'],
  'financial-fact': ['browser', 'relay'],
  'personal-fact': ['browser', 'relay'],
  document: ['browser', 'relay'],
  'health-and-legal-matter': ['browser', 'relay'],
  credential: ['browser'],
  'never-an-alias': [],
};

const CONTROLLER_FOR = { browser: 'browser-controller', relay: 'mail-relay' };

// What field a class may plausibly be typed into: a card number goes only
// into a field whose declared kind or label matches.
const PLAUSIBLE = {
  'identity-number': (t) => t.kind === 'text' && /pan|aadhaar|ssn|nhs|national insurance|\bni\b|passport|reference|policy|id number|identity|number/i.test(t.label || ''),
  'payment-instrument': (t) => t.kind === 'text' && /card|account|ifsc|sort code|expiry|payment/i.test(t.label || ''),
  'financial-fact': (t) => t.kind === 'text' && /amount|fee|balance|sum|salary|income/i.test(t.label || ''),
  'personal-fact': (t) => t.kind === 'text' && /name|birth|dob|phone|mobile|email|address|postcode|pin ?code|maiden/i.test(t.label || ''),
  document: (t) => t.kind === 'upload',
  'health-and-legal-matter': (t) => t.kind === 'text' && /condition|diagnosis|medication|medicine|reason|matter|case|claim/i.test(t.label || ''),
  credential: (t) => t.kind === 'password' || /password|login|passcode/i.test(t.label || ''),
};

export class Substitutor {
  constructor({ vault, keys, ledger, parties, user, ids, placementWindow = 'PT2M', devicePublicKeys = null, isDelegationLive = null }) {
    this.vault = vault;
    this.cred = vault.issueCredential({ holder: 'substitution-component', ops: ['detokenise'] });
    this.keys = keys;
    this.ledger = ledger;
    this.parties = parties;
    this.user = user;
    this.ids = ids;
    this.placementWindow = placementWindow;
    this.devicePublicKeys = devicePublicKeys;
    this.isDelegationLive = isDelegationLive;
    this.registry = new Set();
    this.receipts = [];
    this.counts = { placed: 0, 'not-confirmed': 0, refused: 0, failed: 0 };
  }

  check(n) {
    return SUBSTITUTOR_CHECKS.find((c) => c.n === n).id;
  }

  // The ordered checks. Each returns null or the reason it failed; the caller
  // stops at the first failure and names the check, nothing else.
  checks(request, deps) {
    const { context: ctx, alias, surface, target, caller } = request;
    const at = request.requested_at;
    const party = ctx && this.parties.get(ctx.party);
    const cls = this.vault.classOf(this.user, alias);
    return [
      () => (this.keys.verify(ctx) && contextLive(ctx, at) ? null : 'context signature or validity'),
      () => (deps.stepState(ctx.step_id) === 'running' && surface === ctx.surface && caller === CONTROLLER_FOR[ctx.surface] ? null : 'step not running or caller is not the controller of its surface'),
      () => (ctx.fields.includes(alias) ? null : 'alias not in the field list'),
      () => {
        const owner = aliasOwner(alias);
        if (owner === 'user') return null;
        if (!ctx.delegation || ms(ctx.delegation.validity_end) <= ms(at)) return 'no live delegation record for the alias\'s owner';
        if (this.isDelegationLive && !this.isDelegationLive(ctx.delegation.record, at)) return 'delegation revoked';
        return null;
      },
      () => {
        if (!cls || cls === 'never-an-alias') return 'not an alias of a placeable class';
        if (!ALIAS_SURFACES[cls].includes(surface)) return `class ${cls} does not admit ${surface}`;
        if (/^\{\{aadhaar\}\}$/.test(alias)) return 'aadhaar is never placed in full; only the vault-issued partial';
        if (!ctx.policy.under_delegator || ctx.policy.under_delegator.reads !== 'delegated') return 'flag does not read delegated under the delegator\'s jurisdiction';
        if (ctx.policy.under_institution && ctx.policy.under_institution.reads !== 'delegated') return 'flag does not read delegated under the institution\'s market';
        if (ctx.policy.governing !== 'delegated') return 'governing flag is not delegated';
        return null;
      },
      () => {
        const lines = ctx.envelope.lines;
        const scoped = (prefix) => lines.some((l) => l === `${prefix}:task` || l === `${prefix}:${ctx.step_id}`);
        const actKind = deps.actKind(ctx.act);
        if (actKind === 'committable' && !scoped(`act:${ctx.act}`)) return 'the envelope does not admit the act';
        if (actKind === 'identity' && !scoped(`identity-act:${ctx.act}`)) return 'the envelope does not delegate the identity act';
        for (const a of ctx.identity_acts) if (!scoped(`identity-act:${a}`)) return `the envelope does not delegate ${a}`;
        if (!(ms(at) >= ms(ctx.envelope.validity.from) && ms(at) < ms(ctx.envelope.validity.to))) return 'the validity window is not open';
        if (ctx.money && ctx.money.amount.amount > ctx.money.remaining_cap.amount) return 'the amount exceeds the remaining cap';
        if (!party) return 'no party directory entry';
        if (!scoped(`party:${party.party_id}`)) return 'the party is not contactable';
        if (surface === 'browser') {
          const host = target.origin.replace(/^https:\/\//, '');
          if (!party.domains.includes(host) || target.certificate_valid !== true) return 'origin is not on the party\'s declared domains with its certificate';
        } else if (!party.mail_domains.includes(target.recipient_domain)) return 'recipient is not on the party\'s mail domain';
        return null;
      },
      () => {
        if (!ctx.envelope.device_signature) return 'the envelope version carries no device signature';
        if (this.devicePublicKeys && deps.envelopeUnsigned) {
          const pub = this.devicePublicKeys.get(ctx.envelope.device);
          if (!pub || !deps.verifyDevice(pub, deps.envelopeUnsigned, ctx.envelope.device_signature)) return 'device signature does not verify';
        }
        return null;
      },
      () => {
        const committing = this.isCommitting(request, cls);
        if (ctx.reversibility === 'reversible' && !committing) {
          const stamp = request.version_stamp;
          if (!stamp || !this.keys.verify(stamp)) return 'no valid envelope version stamp for a reversible step';
          if (stamp.envelope_version !== ctx.envelope.version || stamp.task_id !== ctx.task_id) return 'the version stamp names another envelope version';
          if (ms(stamp.at) > ms(at) || ms(at) - ms(stamp.at) > ms(add(at, this.placementWindow)) - ms(at)) return 'the version stamp is not dated inside the window';
          return null;
        }
        const state = tokenState(request.approval_token, { keys: this.keys, envelope_version: ctx.envelope.version, at });
        if (!state.ok) return `approval token: ${state.why}`;
        if (request.approval_token.step_id !== ctx.step_id) return 'the token names another step';
        if (ctx.approval_token && ctx.approval_token !== request.approval_token.token_id) return 'the token is not the one the context names';
        return null;
      },
      () => (surface === 'browser' ? (PLAUSIBLE[cls] && PLAUSIBLE[cls](target) ? null : `a ${cls} does not go into a ${target.kind} field labelled "${target.label || ''}"`) : target.occurrences && target.occurrences.length ? null : 'no placeholder occurrence to rewrite'),
      () => {
        const key = `${ctx.step_id}|${alias}|${targetKey(target)}`;
        if (!this.registry.has(key)) return null;
        return request.retry_token ? null : 'a repeat placement for this step, alias and target without the runner\'s retry token';
      },
    ];
  }

  // A committing placement: the alias is a payment instrument that a party
  // may charge on receipt (a card), a payment instruction, or the catalogue
  // entry marks the step consumed on placement. The spec reads the class rule
  // narrowly, as SEAMS.md records: an account number sent in a message is a
  // payment-instrument alias and is not itself a payment.
  isCommitting(request, cls) {
    const type = request.alias.slice(2, -2).split('.')[0];
    return (cls === 'payment-instrument' && type === 'card') || request.context.committing_placement === true;
  }

  // The one message the substitutor accepts. Aliases, a target descriptor and
  // a signed step context go in; a receipt and ledger lines come out. It never
  // returns the value, its length, a partial, a digest or a rendering of it.
  place(request, deps) {
    const { context: ctx, alias, surface, target } = request;
    const at = request.requested_at;
    const placementId = this.ids.next('pl', 6);
    const cls = this.vault.classOf(this.user, alias);
    const party = ctx && this.parties.get(ctx.party);
    const partyName = party ? party.name : 'the party';
    const receipt = (status, extra = {}) => {
      const r = { placement_id: placementId, status, check: null, reason: null, committing: this.isCommitting(request, cls), at: extra.at || at, ...extra };
      this.receipts.push(r);
      this.counts[status] += 1;
      return r;
    };
    const ledgerIds = [];
    const writeLine = (fields) => {
      const e = this.ledger.append({ task_id: ctx.task_id, step_id: ctx.step_id, at, alias, surface: surface === 'browser' ? 'managed-browser' : 'mail-relay', party: partyName, policy_ref: `${ctx.policy.delegator_jurisdiction}/${ctx.policy.act}`, envelope_version: ctx.envelope.version, placement_id: placementId, written_by: 'substitution-component', ...fields });
      ledgerIds.push(e.ledger_id);
      return e;
    };

    const checks = this.checks(request, deps);
    for (let i = 0; i < checks.length; i++) {
      const why = checks[i]();
      if (why !== null) {
        const check = this.check(i + 1);
        writeLine({ event_type: 'refused', form: request.caller === 'console' || request.caller === 'person' ? 'worker-request' : null, use: `requested by ${request.caller}`, outcome: 'refused', seen_by: 'no person', placed_by: null });
        return { receipt: receipt('refused', { check, reason: null }), ledger_ids: ledgerIds, fired_marker: null, detail: why };
      }
    }

    const useVerb = surface === 'browser' ? (target.kind === 'upload' ? 'uploaded to' : 'typed into') : (cls === 'document' ? 'attached to' : 'sent to');
    const use = surface === 'browser' ? `${useVerb} ${partyName}'s form` : `${useVerb} ${partyName} in an email`;

    // The line is written ahead of the injection, as "placing"; a substitutor
    // that cannot write the ledger cannot place.
    try {
      writeLine({ event_type: 'placed', form: 'placing', use: `being placed into ${partyName}'s ${surface === 'browser' ? 'form' : 'message'}`, outcome: 'placing', seen_by: 'no person', placed_by: null });
    } catch (e) {
      return { receipt: receipt('failed', { reason: 'ledger-unavailable' }), ledger_ids: ledgerIds, fired_marker: null, detail: e.message };
    }

    // A committing placement consumes the token and writes the fired marker
    // before the first tone or character leaves.
    let firedMarker = null;
    const committing = this.isCommitting(request, cls);
    if (committing) {
      firedMarker = { at, action: 'committing-placement', written_by: 'substitution-component', token_id: request.approval_token.token_id };
      deps.consumeToken(request.approval_token.token_id, at);
      if (!COMMITTING_ACTIONS.includes(firedMarker.action)) throw new Error('unreachable');
    }
    this.registry.add(`${ctx.step_id}|${alias}|${targetKey(target)}`);

    let value = null;
    let signal;
    try {
      value = this.vault.detokenise(this.cred, { user: this.user, alias, placement_id: placementId, at });
      if (target.format) value = formatValue(value, target.format);
      signal = deps.driver.inject({ target, value, placement_id: placementId, alias });
    } catch (e) {
      value = null;
      writeLine({ event_type: 'placed', form: 'not-confirmed', use: `could not be placed`, outcome: 'not-confirmed', seen_by: 'no person', placed_by: null });
      return { receipt: receipt('failed', { reason: /region/i.test(e.message) ? 'region-unavailable' : 'driver-error' }), ledger_ids: ledgerIds, fired_marker: firedMarker, detail: e.message.replace(/[0-9]/g, '#') };
    } finally {
      value = null;
    }

    const deadline = ms(add(at, this.placementWindow));
    if (signal && signal.confirmed && ms(signal.at) <= deadline) {
      writeLine({ event_type: 'placed', form: null, use, outcome: 'placed', seen_by: signal.seen_by || 'no person; the field rendered as dots', placed_by: 'system', at: signal.at });
      return { receipt: receipt('placed', { at: signal.at }), ledger_ids: ledgerIds, fired_marker: firedMarker, registry_entry: { placement_id: placementId, alias, ...(signal.rectangle ? { rectangle: signal.rectangle } : {}), ...(signal.occurrence !== undefined ? { occurrence: signal.occurrence } : {}) } };
    }
    writeLine({ event_type: 'placed', form: 'not-confirmed', use: 'could not be placed', outcome: 'not-confirmed', seen_by: 'no person', placed_by: null });
    return { receipt: receipt('not-confirmed', { reason: 'window-expired' }), ledger_ids: ledgerIds, fired_marker: firedMarker, registry_entry: { placement_id: placementId, alias, ...(signal && signal.rectangle ? { rectangle: signal.rectangle } : {}) } };
  }
}

export function aliasOwner(alias) {
  const segs = alias.slice(2, -2).split('.');
  const q = segs[1];
  if (q && /^(nominee|mother|father|spouse|child|daughter|son|parent|dependant|sister|brother)$/.test(q)) return `p_${q}`;
  return 'user';
}

function targetKey(target) {
  return target.node ? `${target.origin}#${target.node}` : `${target.message_id}#${(target.occurrences || []).join(',')}`;
}

// A format the descriptor asks for: the value is rendered in that format and
// in no other place.
export function formatValue(value, format) {
  const digits = String(value).replace(/\D/g, '');
  switch (format) {
    case 'unspaced': return String(value).replace(/[\s-]/g, '');
    case 'grouped-4': return digits.replace(/(.{4})/g, '$1 ').trim();
    case 'hyphenated-ssn': return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    case 'as-received': return String(value);
    default: throw new Error(`format ${format} is not one the descriptor may name`);
  }
}

// The mapping from a receipt to the step's outcome is one way: refused closes
// refused-policy; not-confirmed and failed close failed-retryable with a retry
// token, then failed-final at the cap, except on a committing placement,
// whose fired marker already stands.
export function outcomeForReceipt(result, { ids, step }) {
  const r = result.receipt;
  if (r.status === 'placed') return null;
  if (r.status === 'refused') return { code: 'refused-policy', fields: { policy_reference: `substitutor:${r.check}` } };
  if (result.fired_marker || step.fired_marker) {
    return { code: 'failed-final', fields: { reason: `${r.status}: the committing placement was not confirmed; a status enquiry follows before any repeat`, alternatives_considered: ['status enquiry with the party'] }, retry_token: null, keep_reservation: true };
  }
  return { code: 'failed-retryable', fields: { error_class: r.reason || r.status }, retry_token: ids.next('rt', 4) };
}
