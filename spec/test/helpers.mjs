import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSchemaDir } from '../lib/validate.mjs';

export const specDir = join(dirname(fileURLToPath(import.meta.url)), '..');
export const registry = loadSchemaDir(join(specDir, 'schemas'));

export function fixture(name) {
  return JSON.parse(readFileSync(join(specDir, 'fixtures', name), 'utf8'));
}

export function fixtureFiles(sub) {
  return readdirSync(join(specDir, 'fixtures', sub)).filter((f) => f.endsWith('.json'));
}

export function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

// A tiny seeded generator for the property tests, so a failure reproduces.
export function rng(seed) {
  let s = seed >>> 0 || 1;
  const next = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  return {
    next,
    int: (n) => Math.floor(next() * n),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
  };
}
