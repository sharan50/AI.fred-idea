// The vault, in memory, behind the one interface the harness codes against
// (03, 1.1): tokenise, detokenise, digest, issue-partial and a custody feed.
// Credentials are issued per operation, per class and per region, to a
// workload identity and never to a person. The provider's access log is what
// reconciliation (DR-008) matches against placement ids.
import { ALIAS_CLASSES } from './vocab.mjs';

export class VaultError extends Error {}

const NEVER = 'never-an-alias';

export class Vault {
  constructor({ region }) {
    this.region = region;
    this.byAlias = new Map();
    this.byValue = new Map();
    this.credentials = new Map();
    this.accessLog = [];
    this.custody = [];
    this.counters = new Map();
  }

  issueCredential({ holder, ops, classes = ALIAS_CLASSES.filter((c) => c !== NEVER), region = this.region }) {
    if (ops.includes('detokenise') && holder !== 'substitution-component') throw new VaultError('the detokenise right is the substitutor\'s alone');
    const id = `cred_${holder}_${this.credentials.size + 1}`;
    const cred = { id, holder, ops, classes, region };
    this.credentials.set(id, cred);
    return cred;
  }

  check(cred, op, cls = null) {
    const c = cred && this.credentials.get(cred.id);
    if (!c) throw new VaultError('no credential');
    if (!c.ops.includes(op)) throw new VaultError(`credential of ${c.holder} has no ${op} right`);
    if (cls && !c.classes.includes(cls)) throw new VaultError(`credential of ${c.holder} is not scoped to ${cls}`);
    if (c.region !== this.region) throw new VaultError('credential for another region');
    return c;
  }

  // The qualifier is chosen at issue from a non-sensitive attribute by a rule
  // per class; a collision takes a numeric suffix.
  aliasFor(user, cls, type, qualifier) {
    const base = qualifier ? `${type}.${qualifier}` : type;
    let name = base;
    let n = 1;
    while (this.byAlias.has(`${user}|{{${name}}}`)) {
      n += 1;
      name = `${base}-${n}`;
    }
    return `{{${name}}}`;
  }

  tokenise(cred, { user, cls, type, qualifier = null, value, entered_by, at }) {
    if (cls === NEVER) throw new VaultError('an OTP, a PIN, a bank login or a biometric is never an alias');
    if (!ALIAS_CLASSES.includes(cls)) throw new VaultError(`unknown class ${cls}`);
    this.check(cred, 'tokenise', cls);
    const key = `${user}|${cls}|${normaliseForKey(value)}`;
    if (this.byValue.has(key)) return this.byValue.get(key);
    const alias = this.aliasFor(user, cls, type, qualifier);
    const record = { alias, user, cls, type, versions: [{ value, at, entered_by }], region: this.region, confirmed: false };
    this.byAlias.set(`${user}|${alias}`, record);
    this.byValue.set(key, alias);
    this.custody.push({ alias, version: 1, kind: 'received', at, entered_by });
    return alias;
  }

  newVersion(cred, { user, alias, value, at, entered_by }) {
    this.check(cred, 'tokenise');
    const r = this.record(user, alias);
    r.versions.push({ value, at, entered_by });
    this.custody.push({ alias, version: r.versions.length, kind: 'new-version', at, entered_by });
    return alias;
  }

  record(user, alias) {
    const r = this.byAlias.get(`${user}|${alias}`);
    if (!r) throw new VaultError(`unknown alias ${alias}`);
    return r;
  }

  classOf(user, alias) {
    const r = this.byAlias.get(`${user}|${alias}`);
    return r ? r.cls : null;
  }

  // Held by the substitutor alone. Every call is a line in the provider's
  // access log, keyed by placement id, so a detokenisation with no placement
  // is visible to reconciliation.
  detokenise(cred, { user, alias, placement_id, at }) {
    this.check(cred, 'detokenise');
    const r = this.record(user, alias);
    this.check(cred, 'detokenise', r.cls);
    if (!placement_id) throw new VaultError('detokenise needs a placement id');
    this.accessLog.push({ alias, placement_id, at, holder: cred.holder });
    if (r.partial_of) return r.versions.at(-1).value;
    return r.versions.at(-1).value;
  }

  // The digest right: the hash service computes keyed digests of every value
  // in every normalised form; the vault hands each value to the computation
  // and keeps nothing of the keys. Only the hash service holds this right.
  digest(cred, compute) {
    this.check(cred, 'digest');
    const out = [];
    for (const r of this.byAlias.values()) {
      if (r.partial_of) continue;
      out.push(...compute({ user: r.user, alias: r.alias, cls: r.cls, type: r.type, value: r.versions.at(-1).value }));
    }
    return out;
  }

  // A partial under its own alias, cut by the vault and never by us.
  issuePartial(cred, { user, alias, form, at }) {
    this.check(cred, 'issue-partial');
    const r = this.record(user, alias);
    const value = r.versions.at(-1).value;
    const digits = value.replace(/\D/g, '');
    let partial;
    if (form === 'last4') partial = digits.slice(-4);
    else if (form === 'masked') partial = `XXXX XXXX ${digits.slice(-4)}`;
    else throw new VaultError(`no partial form ${form}`);
    const pa = `{{${alias.slice(2, -2)}.${form}}}`;
    if (!this.byAlias.has(`${user}|${pa}`)) {
      this.byAlias.set(`${user}|${pa}`, { alias: pa, user, cls: r.cls, type: r.type, versions: [{ value: partial, at, entered_by: 'vault' }], region: this.region, partial_of: alias });
      this.custody.push({ alias: pa, version: 1, kind: 'partial-issued', at, entered_by: 'vault' });
    }
    return pa;
  }

  destroy(cred, { user, alias, at }) {
    this.check(cred, 'tokenise');
    const r = this.record(user, alias);
    r.versions = [];
    r.destroyed = at;
    this.custody.push({ alias, version: null, kind: 'destroyed', at, entered_by: 'vault' });
  }

  aliasesOf(user) {
    return [...this.byAlias.values()].filter((r) => r.user === user).map((r) => r.alias);
  }
}

export function normaliseForKey(value) {
  return String(value).replace(/[\s-]/g, '').toLowerCase();
}
