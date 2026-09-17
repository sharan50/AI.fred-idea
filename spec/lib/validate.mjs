// A small JSON Schema validator (a 2020-12 subset), with no dependencies.
//
// Supported: type, enum, const, properties, required, additionalProperties,
// patternProperties, items, minItems, maxItems, uniqueItems, minLength,
// maxLength, pattern, format (date-time, date, duration), contains, minimum, maximum,
// exclusiveMinimum, exclusiveMaximum, allOf, anyOf, oneOf, not, if/then/else,
// dependentRequired and $ref (local "#/..." pointers and "<$id>#/..." across
// the registry). Nothing else is needed by spec/schemas, and an unknown
// keyword throws so a schema cannot silently rely on one.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const KNOWN = new Set([
  '$schema', '$id', '$defs', '$comment', 'title', 'description', 'examples', 'default', 'deprecated',
  'type', 'enum', 'const', 'properties', 'required', 'additionalProperties', 'patternProperties',
  'items', 'contains', 'minItems', 'maxItems', 'uniqueItems', 'minLength', 'maxLength', 'pattern', 'format',
  'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'allOf', 'anyOf', 'oneOf', 'not',
  'if', 'then', 'else', 'dependentRequired', '$ref', 'x-locus',
]);

const FORMATS = {
  'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  duration: /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/,
};

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeOf(a) !== typeOf(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (a && typeof a === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return deepEqual(ka, kb) && ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function pointer(doc, ptr) {
  if (ptr === '' || ptr === '#') return doc;
  const parts = ptr.replace(/^#?\/?/, '').split('/').map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
  let cur = doc;
  for (const p of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export class SchemaRegistry {
  constructor() {
    this.byId = new Map();
  }

  add(schema) {
    if (!schema || typeof schema !== 'object') throw new Error('schema must be an object');
    if (!schema.$id) throw new Error('a registered schema needs an $id');
    this.byId.set(schema.$id, schema);
    return this;
  }

  get(id) {
    const s = this.byId.get(id);
    if (!s) throw new Error(`unknown schema ${id}`);
    return s;
  }

  ids() {
    return [...this.byId.keys()];
  }

  resolve(ref, root) {
    const hash = ref.indexOf('#');
    const base = hash === -1 ? ref : ref.slice(0, hash);
    const frag = hash === -1 ? '' : ref.slice(hash + 1);
    const doc = base === '' ? root : this.get(base);
    const target = pointer(doc, frag);
    if (target === undefined) throw new Error(`unresolvable $ref ${ref}`);
    return { schema: target, root: doc };
  }

  validate(schemaOrId, value) {
    const root = typeof schemaOrId === 'string' ? this.get(schemaOrId) : schemaOrId;
    const errors = [];
    this._validate(root, root, value, '', errors);
    return { ok: errors.length === 0, errors };
  }

  assert(schemaOrId, value, what = 'value') {
    const r = this.validate(schemaOrId, value);
    if (!r.ok) {
      const lines = r.errors.slice(0, 12).map((e) => `  ${e.path || '/'}: ${e.message}`);
      throw new Error(`${what} does not match ${typeof schemaOrId === 'string' ? schemaOrId : 'schema'}:\n${lines.join('\n')}`);
    }
    return value;
  }

  _validate(schema, root, value, path, errors) {
    if (schema === true) return;
    if (schema === false) {
      errors.push({ path, message: 'no value is allowed here' });
      return;
    }
    for (const k of Object.keys(schema)) {
      if (!KNOWN.has(k)) throw new Error(`unsupported schema keyword "${k}" at ${path || '/'}`);
    }
    if (schema.$ref !== undefined) {
      const { schema: target, root: targetRoot } = this.resolve(schema.$ref, root);
      this._validate(target, targetRoot, value, path, errors);
    }
    const t = typeOf(value);
    if (schema.type !== undefined) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      const ok = types.some((x) => x === t || (x === 'number' && t === 'integer'));
      if (!ok) {
        errors.push({ path, message: `expected ${types.join(' or ')}, got ${t}` });
        return;
      }
    }
    if (schema.enum !== undefined && !schema.enum.some((e) => deepEqual(e, value))) {
      errors.push({ path, message: `must be one of ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}; got ${JSON.stringify(value)}` });
    }
    if (schema.const !== undefined && !deepEqual(schema.const, value)) {
      errors.push({ path, message: `must equal ${JSON.stringify(schema.const)}; got ${JSON.stringify(value)}` });
    }
    if (t === 'object') this._object(schema, root, value, path, errors);
    if (t === 'array') this._array(schema, root, value, path, errors);
    if (t === 'string') this._string(schema, value, path, errors);
    if (t === 'number' || t === 'integer') this._number(schema, value, path, errors);
    if (schema.allOf) for (const s of schema.allOf) this._validate(s, root, value, path, errors);
    if (schema.anyOf) {
      const ok = schema.anyOf.some((s) => this._quiet(s, root, value, path));
      if (!ok) errors.push({ path, message: 'matches none of the anyOf alternatives' });
    }
    if (schema.oneOf) {
      const n = schema.oneOf.filter((s) => this._quiet(s, root, value, path)).length;
      if (n !== 1) errors.push({ path, message: `must match exactly one alternative, matched ${n}` });
    }
    if (schema.not && this._quiet(schema.not, root, value, path)) {
      errors.push({ path, message: 'matches a forbidden schema' });
    }
    if (schema.if) {
      const branch = this._quiet(schema.if, root, value, path) ? schema.then : schema.else;
      if (branch !== undefined) this._validate(branch, root, value, path, errors);
    }
  }

  _quiet(schema, root, value, path) {
    const errs = [];
    this._validate(schema, root, value, path, errs);
    return errs.length === 0;
  }

  _object(schema, root, value, path, errors) {
    const props = schema.properties || {};
    for (const r of schema.required || []) {
      if (!(r in value)) errors.push({ path, message: `missing required property "${r}"` });
    }
    if (schema.dependentRequired) {
      for (const [k, deps] of Object.entries(schema.dependentRequired)) {
        if (k in value) for (const d of deps) if (!(d in value)) errors.push({ path, message: `"${k}" requires "${d}"` });
      }
    }
    for (const [k, v] of Object.entries(value)) {
      let matched = false;
      if (k in props) {
        matched = true;
        this._validate(props[k], root, v, `${path}/${k}`, errors);
      }
      if (schema.patternProperties) {
        for (const [pat, s] of Object.entries(schema.patternProperties)) {
          if (new RegExp(pat).test(k)) {
            matched = true;
            this._validate(s, root, v, `${path}/${k}`, errors);
          }
        }
      }
      if (!matched) {
        if (schema.additionalProperties === false) {
          errors.push({ path, message: `unexpected property "${k}"` });
        } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
          this._validate(schema.additionalProperties, root, v, `${path}/${k}`, errors);
        }
      }
    }
  }

  _array(schema, root, value, path, errors) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push({ path, message: `needs at least ${schema.minItems} items` });
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push({ path, message: `allows at most ${schema.maxItems} items` });
    if (schema.uniqueItems) {
      for (let i = 0; i < value.length; i++) {
        for (let j = i + 1; j < value.length; j++) {
          if (deepEqual(value[i], value[j])) errors.push({ path, message: `items ${i} and ${j} are duplicates` });
        }
      }
    }
    if (schema.items !== undefined) value.forEach((v, i) => this._validate(schema.items, root, v, `${path}/${i}`, errors));
    if (schema.contains !== undefined && !value.some((v, i) => this._quiet(schema.contains, root, v, `${path}/${i}`))) {
      errors.push({ path, message: 'no item matches the contains schema' });
    }
  }

  _string(schema, value, path, errors) {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push({ path, message: `shorter than ${schema.minLength}` });
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push({ path, message: `longer than ${schema.maxLength}` });
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, 'u').test(value)) errors.push({ path, message: `does not match ${schema.pattern}` });
    if (schema.format !== undefined) {
      const re = FORMATS[schema.format];
      if (!re) throw new Error(`unsupported format ${schema.format}`);
      if (!re.test(value)) errors.push({ path, message: `is not a ${schema.format}` });
    }
  }

  _number(schema, value, path, errors) {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push({ path, message: `below minimum ${schema.minimum}` });
    if (schema.maximum !== undefined && value > schema.maximum) errors.push({ path, message: `above maximum ${schema.maximum}` });
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push({ path, message: `must exceed ${schema.exclusiveMinimum}` });
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) errors.push({ path, message: `must be below ${schema.exclusiveMaximum}` });
  }
}

export function loadSchemaDir(dir) {
  const reg = new SchemaRegistry();
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.schema.json')).sort()) {
    reg.add(JSON.parse(readFileSync(join(dir, f), 'utf8')));
  }
  return reg;
}

// Canonical JSON: keys sorted at every level, no whitespace. Used wherever a
// record is signed or hashed so that two encodings of one record cannot differ.
export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}
