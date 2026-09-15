// Closed lists, loaded from spec/vocab. `ids('states')` returns the member ids
// of a map-derived vocabulary; `local('step-states')` the ids of a list the
// pages state but the map does not carry as a vocabulary node.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'vocab');

const mapped = new Map();
for (const f of readdirSync(dir).filter((f) => f.endsWith('.map.json'))) {
  const v = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  mapped.set(v.slug, v);
}
const localFile = JSON.parse(readFileSync(join(dir, 'local.json'), 'utf8'));

export function vocabulary(slug) {
  const v = mapped.get(slug);
  if (!v) throw new Error(`no map vocabulary "${slug}"`);
  return v;
}

export function ids(slug) {
  return vocabulary(slug).members.map((m) => m.id);
}

export function localVocabulary(slug) {
  const v = localFile.vocabularies[slug];
  if (!v) throw new Error(`no local vocabulary "${slug}"`);
  return v;
}

export function local(slug) {
  return localVocabulary(slug).members.map((m) => m.id);
}

export function mappedSlugs() {
  return [...mapped.keys()].sort();
}

export function localSlugs() {
  return Object.keys(localFile.vocabularies).sort();
}

export const STATES = ids('states');
export const LIVE_STATES = STATES.filter((s) => !['closed', 'lapsed', 'refused'].includes(s));
export const TERMINAL_STATES = ['closed', 'lapsed', 'refused'];
export const TRANSITIONS = ids('transitions');
export const OUTCOME_CODES = ids('outcome-codes');
export const REFUSAL_CODES = ids('refusal-codes');
export const VERDICTS = ids('verdicts');
export const IDENTITY_ACTS = ids('identity-acts');
export const COMMITTABLE_ACTS = ids('committable-acts');
export const FLAG_VALUES = ids('flag-values');
export const CLASSES = ids('classes');
export const ROUTES = ids('routes');
export const BOUNCE_FORMS = ids('bounce-forms');
export const ALIAS_CLASSES = ids('alias-classes');
export const COMMITTING_ACTIONS = ids('committing-actions');
export const LEDGER_EVENTS = ids('ledger-events');
export const TIMERS = ids('timers');
export const DETECTORS = ids('detectors');
export const BROWSER_MASKS = ids('browser-masks');
export const REDACTION_MASKS = ids('redaction-masks');

export const ACT_TYPES = local('act-types');
export const USER_ONLY_ACTS = localVocabulary('act-types').members.filter((m) => m.kind === 'user-only').map((m) => m.id);
export const STEP_STATES = local('step-states');
export const CANCELLATION_CAUSES = local('cancellation-causes');
export const EVENT_KINDS = local('event-kinds');
export const SURFACES = local('surfaces');
export const MARKETS = local('markets');
export const EVIDENCE_KINDS = local('evidence-kinds');
export const CHANNELS = local('channels');
export const FACT_SOURCES = local('fact-sources');
export const CONFIDENCE = local('confidence');
export const PLACEMENT_STATUSES = local('placement-statuses');
export const LEDGER_OUTCOMES = local('ledger-outcomes');
export const BOARD_COLUMNS = local('board-columns');
export const BOARD_ACTIONS = local('board-actions');
export const SUBSTITUTOR_CHECKS = localVocabulary('substitutor-checks').members;
export const CONDITION_PREDICATES = local('condition-predicates');
export const FLAG_ROWS = local('flag-rows');

export function flagRowFor(act, { healthRecord = false } = {}) {
  const m = localVocabulary('act-types').members.find((x) => x.id === act);
  if (!m) throw new Error(`unknown act type "${act}"`);
  if (healthRecord && m.flag_row_for_health_record) return m.flag_row_for_health_record;
  return m.flag_row;
}

export function actKind(act) {
  const m = localVocabulary('act-types').members.find((x) => x.id === act);
  if (!m) throw new Error(`unknown act type "${act}"`);
  return m.kind;
}
