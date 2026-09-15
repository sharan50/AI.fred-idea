// The signed step context (02, 4.6; 03, 2.1): issued by the task service when
// a step enters running, canonical JSON under Ed25519, valid no longer than
// the placement window, naming the envelope version it was issued against,
// dying at the earlier of the window's end and any dependant's delegation
// end, and with any edit to the envelope.
import { add, min, ms } from './time.mjs';
import { signRecord, nonce } from './signing.mjs';
import { versionRef } from './envelope.mjs';

export function issueContext({ ids, signer, step, envelope, policy, delegation = null, money = null, approval_token = null, at, placement_window = 'PT2M', device_signature, device }) {
  let expires = min(add(at, placement_window), envelope.validity.to);
  if (delegation) expires = min(expires, delegation.validity_end);
  const ctx = {
    context_id: ids.next('ctx', 4),
    task_id: step.task_id,
    step_id: step.step_id,
    executor: step.executor ? { kind: step.executor.kind, ...(step.executor.pool ? { pool: step.executor.pool } : {}) } : { kind: 'harness' },
    surface: step.surface,
    party: step.party ? step.party.id : 'party_none',
    act: step.act,
    identity_acts: step.identity_acts,
    fields: step.fields,
    reversibility: step.reversibility,
    envelope: {
      version: versionRef(envelope),
      lines: linesOf(envelope),
      validity: envelope.validity,
      device_signature: device_signature === undefined ? (envelope.authorised_by ? envelope.authorised_by.signature || null : null) : device_signature,
      device: device === undefined ? (envelope.authorised_by ? envelope.authorised_by.device : null) : device,
    },
    policy: {
      act: policy.act,
      delegator_jurisdiction: policy.delegator_jurisdiction,
      institution_market: policy.institution_market,
      under_delegator: policy.under_delegator,
      under_institution: policy.under_institution,
      governing: policy.governing,
    },
    delegation: delegation ? { record: delegation.delegation_id, delegator: delegation.delegator, validity_end: delegation.validity_end } : null,
    money,
    approval_token,
    issued_at: at,
    expires_at: expires,
    nonce: nonce(),
    key_id: signer.key_id,
  };
  ctx.signature = signRecord(signer.privateKey, ctx);
  return ctx;
}

export function linesOf(envelope) {
  const out = [];
  for (const p of envelope.contactable_parties) out.push(`party:${p.party}:${p.scope}`);
  for (const a of envelope.committable_acts) out.push(`act:${a.act}:${a.scope}`);
  for (const a of envelope.delegated_identity_acts) out.push(`identity-act:${a.act}:${a.scope}`);
  out.push(`spend-cap:${envelope.spend_cap.currency}:${envelope.spend_cap.amount}`);
  out.push(`validity:${envelope.validity.from}:${envelope.validity.to}`);
  for (const c of envelope.health_record_consents || []) out.push(`consent:${c.record}:${c.scope}`);
  for (const c of envelope.delegated_logins || []) out.push(`login:${c.record}:${c.scope}`);
  return out;
}

// For a reversible step the controller also sends an envelope version stamp:
// a second signed statement of the task id, the envelope version and its
// time, fetched from the task service at request time and dated inside the
// window, so a placement is never checked against a superseded envelope.
export function issueVersionStamp({ signer, task_id, envelope, at }) {
  const stamp = { task_id, envelope_version: versionRef(envelope), at, key_id: signer.key_id };
  stamp.signature = signRecord(signer.privateKey, stamp);
  return stamp;
}

export function contextLive(ctx, at) {
  return ms(at) >= ms(ctx.issued_at) && ms(at) < ms(ctx.expires_at);
}
