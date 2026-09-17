import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deriveVocabularies, loadGraph, loadLocal, buildVocabSchema } from '../vocab/derive.mjs';
import * as V from '../lib/vocab.mjs';
import { specDir } from './helpers.mjs';

const derived = deriveVocabularies(loadGraph());

test('every map vocabulary has a copy under spec/vocab and the copy has not drifted', () => {
  for (const v of derived) {
    const copy = V.vocabulary(v.slug);
    assert.deepEqual(copy, v, `spec/vocab/${v.slug}.map.json differs from the map; run node spec/vocab/derive.mjs`);
  }
  assert.deepEqual(V.mappedSlugs(), derived.map((v) => v.slug).sort());
});

test('the enum schema is what derive.mjs would write now', () => {
  const written = JSON.parse(readFileSync(join(specDir, 'schemas', 'vocab.schema.json'), 'utf8'));
  assert.deepEqual(written, buildVocabSchema(derived, loadLocal()), 'spec/schemas/vocab.schema.json is stale; run node spec/vocab/derive.mjs');
});

test('the act types are the two envelope lists plus the two acts reserved to the user', () => {
  const expected = [...V.COMMITTABLE_ACTS, ...V.IDENTITY_ACTS, 'undergo-identification', 'enter-one-time-code'].sort();
  assert.deepEqual([...V.ACT_TYPES].sort(), expected);
  assert.equal(V.ACT_TYPES.length, 16);
  for (const m of V.localVocabulary('act-types').members) {
    if (m.flag_row !== null) assert.ok(V.FLAG_ROWS.includes(m.flag_row), `${m.id} consults an unknown flag row ${m.flag_row}`);
  }
  assert.equal(V.flagRowFor('enter-one-time-code'), null, 'a one-time code has no line in the flag table');
});

test('the closed lists have the sizes the pages name', () => {
  assert.equal(V.STATES.length, 10);
  assert.equal(V.LIVE_STATES.length, 7);
  assert.equal(V.TRANSITIONS.length, 18);
  assert.equal(V.OUTCOME_CODES.length, 9);
  assert.equal(V.REFUSAL_CODES.length, 9);
  assert.equal(V.VERDICTS.length, 5);
  assert.equal(V.IDENTITY_ACTS.length, 7);
  assert.equal(V.COMMITTABLE_ACTS.length, 7);
  assert.equal(V.FLAG_VALUES.length, 3);
  assert.equal(V.ROUTES.length, 4);
  assert.equal(V.BOUNCE_FORMS.length, 4);
  assert.equal(V.ALIAS_CLASSES.length, 8);
  assert.equal(V.COMMITTING_ACTIONS.length, 6);
  assert.equal(V.TIMERS.length, 10);
  assert.equal(V.DETECTORS.length, 4);
  assert.equal(V.BROWSER_MASKS.length, 5);
  assert.equal(V.REDACTION_MASKS.length, 5);
  assert.equal(V.SUBSTITUTOR_CHECKS.length, 10);
  assert.equal(V.EVENT_KINDS.length, 25);
  assert.equal(V.BOARD_COLUMNS.length, 4);
});

test('the ledger event types are the fourteen of 03, section 8.1, and exposure-recorded is keyed by id', () => {
  assert.equal(V.LEDGER_EVENTS.length, 14);
  assert.ok(V.LEDGER_EVENTS.includes('exposure-recorded'));
  assert.ok(!V.LEDGER_EVENTS.includes('read-back-muted'), 'the spec keys on member ids; the map member carries a legacy code');
});
