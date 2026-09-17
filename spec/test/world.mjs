// One world for the trust-side tests: a vault, the hash service and the edge
// proxy in front of it, a ledger, the task service's signing key, the
// substitutor with its public keys, the party directory and a bound device.
import { Ids } from '../lib/ids.mjs';
import { Vault } from '../lib/vault.mjs';
import { HashService, EdgeProxy } from '../lib/hash-service.mjs';
import { Ledger } from '../lib/ledger.mjs';
import { keyPair, KeyRing, Device } from '../lib/signing.mjs';
import { Substitutor } from '../lib/substitutor.mjs';
import * as E from '../lib/envelope.mjs';
import { issueContext, issueVersionStamp } from '../lib/context.mjs';
import { evaluate } from '../lib/policy.mjs';
import { actKind } from '../lib/vocab.mjs';
import { add } from '../lib/time.mjs';
import { fixture, clone } from './helpers.mjs';

export const T = '2026-09-02T14:35:00+05:30';
export const AT = add(T, 'PT30M');

export function buildWorld({ user = 'u_3f9a', region = 'in-south' } = {}) {
  const ids = new Ids();
  const vault = new Vault({ region });
  const hash = new HashService({ vault, user, ids });
  const proxy = new EdgeProxy({ vault, hashService: hash, user, ids });
  const ledger = new Ledger({ ids });
  const signer = keyPair('k_in-2026q3');
  const keys = new KeyRing(signer);
  const parties = new Map(fixture('parties.json').map((p) => [p.party_id, p]));
  const substitutor = new Substitutor({ vault, keys, ledger, parties, user, ids });
  const device = new Device('dev_12a');
  const flags = fixture('flags-pilot.json');
  return { ids, vault, hash, proxy, ledger, signer, keys, parties, substitutor, device, user, flags, region };
}

// The user's onboarding: the values the device form posts to the proxy.
export const ONBOARDING = {
  name: { cls: 'personal-fact', type: 'name', value: 'Priya Sharma' },
  dob: { cls: 'personal-fact', type: 'dob', value: '14/03/1985' },
  phone: { cls: 'personal-fact', type: 'phone', value: '+91 98765 43210' },
  email: { cls: 'personal-fact', type: 'email', value: 'priya.sharma@example.in' },
  pan: { cls: 'identity-number', type: 'pan', value: 'ABCDE1234F' },
  aadhaar: { cls: 'identity-number', type: 'aadhaar', value: '2345 6789 0123' },
  card: { cls: 'payment-instrument', type: 'card', qualifier: 'primary', value: '4111 1111 1111 1111' },
  account: { cls: 'payment-instrument', type: 'account', qualifier: 'hdfc', value: '50100123456789' },
  address: { cls: 'personal-fact', type: 'address', qualifier: 'home', value: '14 Lodhi Road, New Delhi 110003' },
  condition: { cls: 'health-and-legal-matter', type: 'health', qualifier: 'condition', value: 'type 2 diabetes' },
  credential: { cls: 'credential', type: 'credential', qualifier: 'portal', value: 'hunter2-Sup3r!' },
};

export function onboard(world, which = Object.keys(ONBOARDING)) {
  const aliases = {};
  for (const k of which) {
    const v = ONBOARDING[k];
    aliases[k] = world.proxy.tokeniseField({ cls: v.cls, type: v.type, qualifier: v.qualifier || null, value: v.value, at: T });
  }
  return aliases;
}

export function signedEnvelope(world, mutate = () => {}) {
  const v1 = E.propose({ envelope_id: 'env_12', task_id: 't_12', spend_cap: { currency: 'INR', amount: 0 }, contactable_parties: [{ party: 'party_max-healthcare', scope: 'task' }], committable_acts: [{ act: 'schedule', scope: 'task' }, { act: 'cancel', scope: 'task' }], delegated_identity_acts: [{ act: 'attest-fact', scope: 'task' }, { act: 'present-document', scope: 'task' }], validity: { from: T, to: add(T, 'P7D') } });
  mutate(v1);
  return E.authorise(v1, { device: 'dev_12a', at: T, sign: (r) => world.device.sign(r) });
}

export function stepS04(over = {}) {
  const s = clone(fixture('task-12/plan-p12-1.json').steps.find((x) => x.step_id === 's_04'));
  s.state = 'running';
  s.envelope_version = 'env_12/v2';
  return { ...s, ...over };
}

export function contextFor(world, { step, envelope, at = AT, delegation = null, money = null, approval_token = null, committing_placement = false, holds = () => true }) {
  const party = world.parties.get(step.party.id);
  const policy = evaluate(world.flags, { act: step.identity_acts[0] || step.act, delegator_jurisdiction: 'IN', institution_market: party ? party.market : null, holds });
  const ctx = issueContext({ ids: world.ids, signer: world.signer, step, envelope, policy, delegation, money, approval_token, at });
  if (committing_placement) {
    ctx.committing_placement = true;
    const { signRecord } = world.signingOverride || {};
    // re-sign with the extra field
    delete ctx.signature;
    ctx.signature = (signRecord || ((k, r) => world.signer && signWith(world.signer, r)))(world.signer.privateKey, ctx);
  }
  return ctx;
}

import { signRecord as _signRecord } from '../lib/signing.mjs';
function signWith(signer, record) {
  return _signRecord(signer.privateKey, record);
}

export function stampFor(world, envelope, at = AT) {
  return issueVersionStamp({ signer: world.signer, task_id: 't_12', envelope, at });
}

export function browserTarget(label = 'Date of birth', kind = 'text', over = {}) {
  return { session: 'sess_1', frame: 'main', node: `node-${label.toLowerCase().replace(/\s+/g, '-')}`, kind, label, origin: 'https://book.maxhealthcare.in', certificate_valid: true, ...over };
}

export function placementRequest(world, { step, envelope, alias, target = browserTarget(), caller = 'browser-controller', surface = 'browser', at = AT, context = null, stamp = undefined, approval_token = null, retry_token = null, ctxOver = {} }) {
  const ctx = context || contextFor(world, { step, envelope, at, ...ctxOver });
  return { task_id: 't_12', step_id: step.step_id, alias, surface, caller, target, context: ctx, version_stamp: stamp === undefined ? stampFor(world, envelope, at) : stamp, approval_token, retry_token, requested_at: at };
}

// A driver that records what it was asked to inject: the surface side, where
// the value legitimately exists between placement and consumption.
export function driver({ confirm = true, delayMs = 500, rectangle = { x: 100, y: 200, w: 180, h: 24 } } = {}) {
  const log = [];
  return {
    log,
    inject({ target, value, placement_id, alias }) {
      log.push({ target: target.node || target.message_id, value, placement_id, alias });
      const at = add(AT, `PT${Math.floor(delayMs / 1000)}S`);
      return { confirmed: confirm, at: delayMs >= 120000 ? add(AT, 'PT3M') : at, rectangle, seen_by: 'no person; the field rendered as dots' };
    },
  };
}

export function deps(world, { stepState = () => 'running', consumed = [] } = {}) {
  return {
    stepState,
    actKind,
    consumeToken: (id, at) => consumed.push({ id, at }),
    driver: driver(),
  };
}

export { actKind };
