#!/usr/bin/env node
// AI.fred dependency map. Node 18 or later, no dependencies.
// The schema, the locus grammar and the change protocol are in tools/depmap/SCHEMA.md.
// `check()` is exported for tools/verify.mjs; every failure is { file, line, msg } with a repo-relative file.
// Importing this module has no side effects; the command line runs only when the file is executed directly.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, resolve, basename, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..');

const KINDS = ['fatal', 'premise', 'ledger', 'dr', 'alt', 'inv', 'comp', 'vocab', 'flag', 'stage', 'open', 'obj', 'res'];
const ID_RE = /^(fatal|premise|ledger|dr|alt|inv|comp|vocab|flag|stage|open|obj|res)-[a-z0-9.-]+$/;
const MEMBER_RE = /^(vocab-[a-z0-9.-]+)\/([a-z0-9.-]+)$/;
const ROLES = ['canonical', 'restates', 'partial', 'mentions', 'home', 'evidence'];
const CHECKS = ['members', 'verbatim', 'none'];
const FACETS = {
  layer: ['index', 'thesis', 'product', 'architecture', 'trust', 'operations', 'business', 'roadmap', 'open', 'publishing'],
  fixity: ['fixed', 'amber', 'to-verify', 'assumption', 'illustrative', 'derived'],
  fatal: ['1', '2', 'both', 'none'],
  surface: ['browser', 'telephony', 'mail', 'device', 'console', 'all'],
  market: ['in', 'uk', 'us', 'all'],
  zone: ['device', 'entry', 'alias', 'real-value', 'market', 'floor'],
};
const EDGES = {
  'justifies': [['fatal', 'premise', 'ledger', 'dr'], ['ledger', 'dr', 'comp', 'inv', 'vocab', 'stage', 'flag']],
  'depends-on': [['comp', 'stage', 'vocab', 'flag'], ['comp', 'vocab', 'inv', 'dr', 'stage']],
  'closes-off': [['dr'], ['inv']],
  'rejects': [['dr'], ['alt']],
  'conflicts-with': [['res'], KINDS.filter((k) => k !== 'res')],
  'lands-in': [['open', 'obj'], ['dr', 'comp', 'vocab', 'flag', 'inv', 'stage']],
};
const HUB = 12;
const BANNED = [/in today[\u2019']s/i, /fast-paced world/i, /game-?changer/i, /cutting-edge/i, /seamless/i, /leverage synergies/i, /it[\u2019']s important to note/i, /in conclusion/i];
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty', 'thirty-one', 'thirty-two', 'thirty-three', 'thirty-four',
  'thirty-five', 'thirty-six', 'thirty-seven', 'thirty-eight', 'thirty-nine', 'forty', 'forty-one',
  'forty-two', 'forty-three', 'forty-four', 'forty-five', 'forty-six', 'forty-seven', 'forty-eight',
  'forty-nine', 'fifty'];

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------
const lineOf = (text, index) => text.slice(0, Math.max(0, index)).split('\n').length;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function decode(t) {
  return t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n)));
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ');
}

// One normaliser for every comparison. In verbatim mode every separator run collapses to ", ".
export function normalise(html, { verbatim = false } = {}) {
  let t = decode(stripTags(html));
  t = t.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u00A0/g, ' ');
  t = t.toLowerCase().replace(/\s+/g, ' ').trim();
  if (verbatim) t = t.replace(/\s*(?:,|;|:|\band\b)\s*/g, ', ').replace(/(?:, )+/g, ', ');
  return t;
}

// Chips and reference markers carry status, not content; a table cell reads "bounce", not "bounce to-verify".
function cellText(html) {
  return normalise(html.replace(/<span\s+class="chip[^"]*"[^>]*>[\s\S]*?<\/span>/g, ' ').replace(/<a\s+class="ref"[^>]*>[\s\S]*?<\/a>/g, ' ')).slice(0, 80);
}

const hasToken = (text, needle) => new RegExp(`(?:^|[^a-z0-9-])${escapeRe(needle)}(?=$|[^a-z0-9-])`).test(text);

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------
function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const rel = (root, f) => relative(root, f).split('\\').join('/');

function paths(root) {
  return {
    root,
    docs: join(root, 'docs'),
    dir: join(root, 'tools', 'depmap'),
    graph: join(root, 'tools', 'depmap', 'graph.json'),
    refs: join(root, 'tools', 'depmap', 'refs.json'),
    manifest: join(root, 'manifest.json'),
    report: join(root, 'SURFACING_REPORT.md'),
  };
}

// ---------------------------------------------------------------------------
// The reference layer: every page, anchor, table and internal link under docs/
// ---------------------------------------------------------------------------
const EXCLUDED_ID = (id) => id === 'main' || id === 'rail' || id === 'publication' || /^src-/.test(id) || /^fig-.*-(title|desc|arrow.*)$/.test(id);

function pageOrder(P) {
  const order = [];
  if (existsSync(P.manifest)) {
    try { for (const e of readJson(P.manifest).pages || []) order.push(e.path); } catch { /* the harness reports a broken manifest */ }
  }
  return order;
}

function tagAt(text, idIndex) {
  // idIndex points at ' id="' inside a tag; find the tag's opening '<' and its name.
  const start = text.lastIndexOf('<', idIndex);
  const m = text.slice(start).match(/^<([a-zA-Z][a-zA-Z0-9]*)\b/);
  return { start, tag: m ? m[1].toLowerCase() : '' };
}

function elementEnd(text, start, tag, mainEnd) {
  const after = start + 1;
  const nextOf = (re) => { re.lastIndex = after; const m = re.exec(text); return m ? m.index : mainEnd; };
  if (tag === 'h2') return nextOf(/<h2\b/g);
  if (tag === 'h3') return nextOf(/<h2\b|<h3\b/g);
  if (tag === 'div') { const i = text.indexOf('</table>', after); return i < 0 ? mainEnd : Math.min(mainEnd, i + 8); }
  const close = text.indexOf(`</${tag}>`, after);
  return close < 0 ? mainEnd : Math.min(mainEnd, close + tag.length + 3);
}

function headingText(inner) {
  return normaliseCase(decode(stripTags(inner.replace(/<span\s+class="(?:no|fig-no|tab-no)">[\s\S]*?<\/span>/, ' '))).replace(/\s+/g, ' ').trim());
}
const normaliseCase = (s) => s;

export function buildRefs(root = DEFAULT_ROOT) {
  const P = paths(root);
  const files = walk(P.docs).filter((f) => f.endsWith('.html'));
  const relOf = (f) => posix.relative(P.docs.split('\\').join('/'), f.split('\\').join('/'));
  const order = pageOrder(P);
  const rank = (p) => { const i = order.indexOf(p); return i < 0 ? order.length : i; };
  const sorted = files.map((f) => [relOf(f), f]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
  const pages = {};
  for (const [p, f] of sorted) {
    const t = readFileSync(f, 'utf8');
    const mainStart = Math.max(0, t.search(/<main\b/));
    const mainEndIdx = t.indexOf('</main>');
    const mainEnd = mainEndIdx < 0 ? t.length : mainEndIdx;
    const title = (t.match(/<title>([^<]*)<\/title>/) || [, ''])[1].trim();
    const kind = (t.match(/<body\s+class="kind-([a-z]+)"/) || [, ''])[1];
    const header = t.match(/<header\s+class="page-header"[\s\S]*?<\/header>/);
    const status = header ? (header[0].match(/class="chip chip-([a-z-]+)"/) || [, ''])[1] : '';
    const page = { title, kind, status, anchors: {}, tables: {}, links: [] };

    const headings = []; // [{index, id, tag}]
    const idRe = /\sid\s*=\s*"([^"]+)"/g;
    let m;
    const found = [];
    while ((m = idRe.exec(t))) {
      const id = m[1];
      if (EXCLUDED_ID(id)) continue;
      const { start, tag } = tagAt(t, m.index);
      if (['title', 'desc', 'marker', 'lineargradient', 'pattern', 'clippath', 'filter'].includes(tag)) continue;
      found.push({ id, start, tag });
      if (tag === 'h2' || tag === 'h3') headings.push({ index: start, id, tag });
    }
    const under = (pos, tag) => {
      let best = null;
      for (const h of headings) {
        if (h.index >= pos) break;
        if (tag === 'h3' && h.tag !== 'h2') continue;
        if (tag === 'h2') continue;
        best = h.id;
      }
      return best;
    };
    for (const a of found) {
      const end = elementEnd(t, a.start, a.tag, a.start < mainEnd ? mainEnd : t.length);
      const inner = t.slice(a.start, end);
      const entry = { kind: a.tag === 'div' ? 'table-wrap' : a.tag, line: lineOf(t, a.start) };
      if (a.tag === 'h2' || a.tag === 'h3') {
        const no = inner.match(/<span class="no">([^<]+)<\/span>/);
        if (no) entry.no = no[1].trim();
        entry.text = headingText(inner.match(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/)?.[1] || '');
      } else if (a.tag === 'figure') {
        const cap = inner.match(/<figcaption>([\s\S]*?)<\/figcaption>/);
        const no = cap && cap[1].match(/<span class="fig-no">([^<]+)<\/span>/);
        if (no) entry.no = no[1].trim();
        entry.text = headingText(cap ? cap[1] : '').slice(0, 120);
      } else if (a.tag === 'div' || a.tag === 'table') {
        const cap = inner.match(/<caption>([\s\S]*?)<\/caption>/);
        const no = cap && cap[1].match(/<span class="tab-no">([^<]+)<\/span>/);
        if (no) entry.no = no[1].trim();
        entry.text = headingText(cap ? cap[1] : '').slice(0, 120);
      } else {
        entry.text = normalise(inner).slice(0, 80);
      }
      const u = under(a.start, a.tag);
      if (u) entry.under = u;
      page.anchors[a.id] = entry;
    }

    const tableRe = /<table\b([^>]*)>([\s\S]*?)<\/table>/g;
    while ((m = tableRe.exec(t))) {
      const body = m[2];
      const no = body.match(/<span class="tab-no">Table ([A-Za-z0-9]+\.\d+)<\/span>/);
      const key = no ? no[1] : `at-line-${lineOf(t, m.index)}`;
      const cap = body.match(/<caption>([\s\S]*?)<\/caption>/);
      const rows = [];
      const bodyOnly = body.replace(/<thead>[\s\S]*?<\/thead>/, '');
      const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/g;
      let r;
      while ((r = trRe.exec(bodyOnly))) {
        const cells = [];
        const tdRe = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g;
        let c;
        while ((c = tdRe.exec(r[1]))) cells.push(cellText(c[1]));
        if (cells.length) rows.push(cells);
      }
      const entry = { line: lineOf(t, m.index), caption: headingText(cap ? cap[1] : '').slice(0, 120), rows };
      const wrapId = (t.slice(Math.max(0, m.index - 200), m.index).match(/id="([^"]+)"[^<]*$/) || [])[1] || (m[1].match(/\sid="([^"]+)"/) || [])[1];
      if (wrapId) entry.id = wrapId;
      const u = under(m.index, 'table');
      if (u) entry.under = u;
      page.tables[key] = entry;
    }

    // Internal links, resolved exactly as tools/verify.mjs resolves them (its section 5, "Links and assets").
    const dir = dirname(f);
    const aRe = /<a\b([^>]*)>/g;
    while ((m = aRe.exec(t))) {
      const h = m[1].match(/\bhref\s*=\s*"([^"]*)"/);
      if (!h) continue;
      const url = h[1].trim();
      if (!url || /^(https?:)?\/\//i.test(url) || /^(mailto|tel|data):/i.test(url)) continue;
      let to;
      if (url.startsWith('#')) to = url.length > 1 ? `${p}#${url.slice(1)}` : p;
      else {
        const [pathPart, frag] = url.split('#');
        const clean = pathPart.split('?')[0];
        let target = clean.startsWith('/') ? join(P.docs, clean) : resolve(dir, clean);
        if (clean.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) target = join(target, 'index.html');
        if (!target.startsWith(P.docs)) continue;
        to = relOf(target) + (frag ? `#${frag}` : '');
      }
      page.links.push({ line: lineOf(t, m.index), to });
    }
    pages[p] = page;
  }
  return { schema: 1, generated: 'node tools/depmap.mjs extract', pages };
}

const serialise = (obj) => JSON.stringify(obj, null, 2) + '\n';

// ---------------------------------------------------------------------------
// Loci
// ---------------------------------------------------------------------------
export function parseLocus(at) {
  const m = /^([^#!"]+?)(?:#([^!"]+))?(?:!"(.*)")?$/.exec(at);
  if (!m) return null;
  const [, page, anchor, phrase] = m;
  const out = { page, anchor: anchor || null, phrase: phrase || null, table: null };
  if (anchor && /^table:/.test(anchor)) { out.table = anchor.slice(6); out.anchor = null; }
  return out;
}
const locusBase = (at) => { const l = parseLocus(at); return l ? `${l.page}#${l.table ? 'table:' + l.table : l.anchor || ''}` : at; };

// Resolve a locus to the HTML slice it names. Returns { html, line, table } or { error }.
function resolveLocus(ctx, at) {
  const l = parseLocus(at);
  if (!l) return { error: `locus "${at}" does not parse; see the grammar in SCHEMA.md` };
  const text = ctx.texts.get(l.page);
  if (text === undefined) return { error: `page "${l.page}" does not exist under docs/` };
  const mainStart = Math.max(0, text.search(/<main\b/));
  const mainEndIdx = text.indexOf('</main>');
  const mainEnd = mainEndIdx < 0 ? text.length : mainEndIdx;
  const page = ctx.refs.pages[l.page];
  if (l.table) {
    const tb = page.tables[l.table];
    if (!tb) return { error: `page "${l.page}" has no Table ${l.table}` };
    const re = new RegExp(`<table\\b[^>]*>(?:(?!<\\/table>)[\\s\\S])*?<span class="tab-no">Table ${escapeRe(l.table)}<\\/span>[\\s\\S]*?<\\/table>`);
    const m = re.exec(text);
    if (!m) return { error: `Table ${l.table} on "${l.page}" could not be sliced` };
    return { html: m[0], line: tb.line, table: tb };
  }
  if (!l.anchor) return { html: text.slice(mainStart, mainEnd), line: 1, table: null };
  const a = page.anchors[l.anchor];
  if (!a) {
    const near = nearest(l.anchor, Object.keys(page.anchors));
    return { error: `#${l.anchor} does not exist on "${l.page}"${near ? ` (nearest: #${near})` : ''}` };
  }
  const re = new RegExp(`\\sid\\s*=\\s*"${escapeRe(l.anchor)}"`);
  const m = re.exec(text);
  const { start, tag } = tagAt(text, m.index);
  const end = elementEnd(text, start, tag, start < mainEnd ? mainEnd : text.length);
  return { html: text.slice(start, end), line: a.line, table: null };
}

function nearest(id, ids) {
  let best = null, bestD = Infinity;
  for (const c of ids) {
    const d = levenshtein(id, c);
    if (d < bestD) { bestD = d; best = c; }
  }
  return bestD <= Math.max(3, Math.floor(id.length / 3)) ? best : null;
}
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return dp[a.length][b.length];
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------
function loadContext(root, { needGraph = true } = {}) {
  const P = paths(root);
  const refs = buildRefs(root);
  const texts = new Map();
  for (const p of Object.keys(refs.pages)) texts.set(p, readFileSync(join(P.docs, p), 'utf8'));
  const ctx = { P, refs, texts, graph: null, raw: '', nodes: new Map(), byLocus: new Map() };
  if (needGraph && existsSync(P.graph)) {
    ctx.raw = readFileSync(P.graph, 'utf8');
    ctx.graph = JSON.parse(ctx.raw);
    for (const n of ctx.graph.nodes || []) {
      ctx.nodes.set(n.id, n);
      for (const l of n.loci || []) {
        const b = locusBase(l.at);
        if (!ctx.byLocus.has(b)) ctx.byLocus.set(b, []);
        ctx.byLocus.get(b).push({ node: n, locus: l });
      }
    }
  }
  return ctx;
}

// Line of a node or of a locus string inside graph.json, for failure messages.
function graphLine(ctx, nodeId, at) {
  const raw = ctx.raw;
  let i = raw.indexOf(`"id": ${JSON.stringify(nodeId)}`);
  if (i < 0) return 1;
  if (at) {
    const j = raw.indexOf(`"at": ${JSON.stringify(at)}`, i);
    if (j >= 0) i = j;
  }
  return lineOf(raw, i);
}

// ---------------------------------------------------------------------------
// check
// ---------------------------------------------------------------------------
export function check({ root = DEFAULT_ROOT, warnings = false } = {}) {
  const out = [];
  const warn = [];
  const P = paths(root);
  const gfile = rel(root, P.graph);
  const rfile = rel(root, P.refs);
  const fail = (line, msg, file = gfile) => out.push({ file, line, msg });

  if (!existsSync(P.graph)) { fail(1, 'graph.json is missing'); return finish(); }
  let ctx;
  try { ctx = loadContext(root); } catch (e) { fail(1, `graph.json is not valid JSON: ${e.message}`); return finish(); }

  // The reference layer must be fresh.
  if (!existsSync(P.refs)) fail(1, 'refs.json is missing; run node tools/depmap.mjs extract', rfile);
  else if (readFileSync(P.refs, 'utf8') !== serialise(ctx.refs)) fail(1, 'stale; run node tools/depmap.mjs extract', rfile);

  const g = ctx.graph;
  if (g.schema !== 1) fail(1, 'graph.json schema must be 1');
  const nodes = g.nodes || [];
  const edges = g.edges || [];
  const ids = new Set();

  for (const n of nodes) {
    const line = graphLine(ctx, n.id);
    if (!n.id || !ID_RE.test(n.id)) { fail(line, `node id "${n.id}" does not match the id scheme`); continue; }
    if (ids.has(n.id)) fail(line, `duplicate node id "${n.id}"`);
    ids.add(n.id);
    if (!KINDS.includes(n.kind)) fail(line, `${n.id}: unknown kind "${n.kind}"`);
    if (n.kind && n.id.split('-')[0] !== n.kind) fail(line, `${n.id}: id prefix does not match kind "${n.kind}"`);
    const label = n.label || '';
    if (!label.trim()) fail(line, `${n.id}: label is missing`);
    if (label.length > 80) fail(line, `${n.id}: label is longer than 80 characters (a name, not a sentence)`);
    if (/\.\s*$/.test(label)) fail(line, `${n.id}: label ends with a full stop (a name, not a sentence)`);
    if (/\u2014/.test(label)) fail(line, `${n.id}: label contains an em-dash`);
    for (const rx of BANNED) if (rx.test(label)) fail(line, `${n.id}: label carries a banned phrase`);
    for (const [k, v] of Object.entries(n.facets || {})) {
      if (!FACETS[k]) fail(line, `${n.id}: unknown facet "${k}"`);
      else if (!FACETS[k].includes(String(v))) fail(line, `${n.id}: facet ${k}="${v}" is not in its closed list`);
      if (k === 'zone' && n.kind !== 'comp') fail(line, `${n.id}: only a component carries a zone`);
    }
    if (n.kind === 'ledger' && !n.source) fail(line, `${n.id}: a ledger node carries a source naming the brief's line`);
    if (n.kind === 'res' && !n.source) fail(line, `${n.id}: a residual carries a source naming the finding in SURFACING_REPORT.md`);
    if (n.check && !CHECKS.includes(n.check)) fail(line, `${n.id}: unknown check mode "${n.check}"`);
    if (n.kind !== 'vocab' && n.members) fail(line, `${n.id}: only a vocabulary carries members`);
    if (n.kind === 'vocab') {
      if (!Array.isArray(n.members) || !n.members.length) fail(line, `${n.id}: a vocabulary carries members`);
      else {
        const seen = new Set();
        for (const mem of n.members) {
          if (!mem.id || !/^[a-z0-9.-]+$/.test(mem.id)) fail(line, `${n.id}: member id "${mem.id}" is not lower-case`);
          if (seen.has(mem.id)) fail(line, `${n.id}: duplicate member "${mem.id}"`);
          seen.add(mem.id);
          if (!mem.word && !mem.code) fail(line, `${n.id}: member "${mem.id}" has neither word nor code`);
        }
      }
    }

    // Loci
    const loci = n.loci || [];
    if (n.kind !== 'ledger' && !loci.length) fail(line, `${n.id}: no loci`);
    const canon = loci.filter((l) => l.role === 'canonical');
    if (['open', 'obj', 'res'].includes(n.kind)) {
      if (canon.length) fail(line, `${n.id}: ${n.kind} nodes use home or evidence, not canonical`);
      if (!loci.some((l) => l.role === (n.kind === 'res' ? 'evidence' : 'home'))) fail(line, `${n.id}: needs at least one ${n.kind === 'res' ? 'evidence' : 'home'} locus`);
    } else if (n.kind !== 'ledger' && canon.length !== 1) fail(line, `${n.id}: exactly one canonical locus, found ${canon.length}`);
    if (n.kind === 'dr' && canon[0]) {
      const l = parseLocus(canon[0].at);
      if (!l || !basename(l.page).startsWith(n.id + '-')) fail(graphLine(ctx, n.id, canon[0].at), `${n.id}: the canonical locus must be on decisions/${n.id}-*.html`);
    }
    for (const l of loci) {
      const lline = graphLine(ctx, n.id, l.at);
      if (!ROLES.includes(l.role)) { fail(lline, `${n.id}: unknown locus role "${l.role}"`); continue; }
      const parsed = parseLocus(l.at || '');
      if (!parsed) { fail(lline, `${n.id}: locus "${l.at}" does not parse`); continue; }
      if (!parsed.anchor && !parsed.table && l.role !== 'mentions') fail(lline, `${n.id}: a whole-page locus is allowed only with role "mentions"`);
      if (['mentions', 'home', 'evidence'].includes(l.role) && !parsed.phrase) fail(lline, `${n.id}: a ${l.role} locus carries a phrase`);
      if (parsed.phrase && parsed.phrase.length < 12) fail(lline, `${n.id}: phrase "${parsed.phrase}" is shorter than 12 characters`);
      if (l.check && !CHECKS.includes(l.check)) fail(lline, `${n.id}: unknown check mode "${l.check}" on a locus`);
      if (l.form && !['word', 'code'].includes(l.form)) fail(lline, `${n.id}: form is word or code`);
      if (l.role === 'partial' && !Array.isArray(l.omits)) fail(lline, `${n.id}: a partial locus carries omits: [member ids]`);
      if (l.drift && !/^(res|open)-/.test(l.drift)) fail(lline, `${n.id}: drift names a res-* or open-* node`);

      const r = resolveLocus(ctx, l.at);
      if (r.error) { fail(lline, `${n.id}: ${r.error}`); continue; }
      const problems = [];
      const text = normalise(r.html);
      if (parsed.phrase && !text.includes(normalise(parsed.phrase))) problems.push(`phrase "${parsed.phrase}" not found in ${locusBase(l.at)}`);

      // List checks
      const mode = l.check || (n.check || 'members');
      const isList = n.kind === 'vocab' && ['canonical', 'restates', 'partial'].includes(l.role) && mode !== 'none';
      if (isList) {
        const omit = new Set(l.omits || []);
        const members = n.members.filter((mem) => !omit.has(mem.id));
        const form = l.form || 'word';
        const needles = members.map((mem) => (form === 'code' ? mem.code || mem.word : mem.word || mem.code));
        if (mode === 'verbatim') {
          const expected = normalise(needles.join(', '), { verbatim: true });
          const got = normalise(r.html, { verbatim: true });
          if (!got.includes(expected)) problems.push(`verbatim list of ${n.id} not found as one run in ${locusBase(l.at)}`);
        } else {
          for (const mem of members) {
            const forms = [form === 'code' ? mem.code : mem.word, ...(mem.alt || [])].filter(Boolean).map((s) => normalise(s));
            if (!forms.some((s) => hasToken(text, s))) problems.push(`member "${mem.id}" (${forms[0] || mem.id}) not found in ${locusBase(l.at)}`);
          }
        }
      }
      if (n.kind === 'inv' && n.text && ['canonical', 'restates'].includes(l.role) && mode !== 'none') {
        const expected = normalise(n.text, { verbatim: mode === 'verbatim' });
        const got = normalise(r.html, { verbatim: mode === 'verbatim' });
        if (!got.includes(expected)) problems.push(`the invariant's text is not found in ${locusBase(l.at)}`);
      }
      if (l.cells) {
        if (!r.table) problems.push('cells given on a locus that is not a table');
        else {
          const row = r.table.rows.find((cells) => cells[0] && cells[0].includes(normalise(parsed.phrase || '')));
          if (!row) problems.push(`no row of Table ${parsed.table} starts with "${parsed.phrase}"`);
          else l.cells.forEach((c, i) => { if (!(row[i + 1] || '').startsWith(normalise(c))) problems.push(`Table ${parsed.table} row "${parsed.phrase}" column ${i + 1} reads "${(row[i + 1] || '').slice(0, 40)}", expected "${c}"`); });
        }
      }
      if (typeof n.count === 'number' && l.role === 'canonical') {
        if (r.table) { if (r.table.rows.length !== n.count) problems.push(`table has ${r.table.rows.length} rows, expected ${n.count}`); }
        const word = NUMBER_WORDS[n.count];
        if (!(word && hasToken(text, word)) && !hasToken(text, String(n.count))) problems.push(`the text does not state the count ${n.count}`);
      }

      if (l.drift) {
        if (!problems.length) fail(lline, `${n.id}: recorded drift ${l.drift} at ${locusBase(l.at)} has been resolved; remove the waiver`);
      } else for (const pr of problems) fail(lline, `${n.id}: ${pr}`);

      // Closedness scan: tokens shaped like a member that are not members.
      if (n.kind === 'vocab' && n.pattern && isList) {
        let rx;
        try { rx = new RegExp(n.pattern, 'g'); } catch { fail(line, `${n.id}: pattern does not compile`); rx = null; }
        if (rx) {
          const known = new Set(n.members.flatMap((mem) => [mem.word, mem.code, ...(mem.alt || [])].filter(Boolean).map((s) => normalise(s))));
          const seen = new Set();
          let mm;
          while ((mm = rx.exec(text))) { const tok = mm[0]; if (!known.has(tok) && !seen.has(tok)) { seen.add(tok); warn.push({ file: gfile, line: lline, msg: `${n.id}: "${tok}" at ${locusBase(l.at)} looks like a member and is not one` }); } }
        }
      }
    }
  }

  // Drift waivers must name nodes that exist.
  for (const n of nodes) for (const l of n.loci || []) if (l.drift && !ids.has(l.drift)) fail(graphLine(ctx, n.id, l.at), `${n.id}: drift names "${l.drift}", which is not a node`);

  // Edges
  const edgeKey = new Set();
  edges.forEach((e, i) => {
    const line = edgeLine(ctx, e);
    if (!Array.isArray(e) || e.length !== 3) { fail(line, `edge ${i} is not [from, kind, to]`); return; }
    const [from, kind, to] = e;
    if (!EDGES[kind]) { fail(line, `edge ${i}: unknown kind "${kind}"`); return; }
    const key = e.join('|');
    if (edgeKey.has(key)) fail(line, `duplicate edge ${key}`);
    edgeKey.add(key);
    const a = ctx.nodes.get(from), b = ctx.nodes.get(to);
    if (!a) fail(line, `edge ${key}: "${from}" is not a node`);
    if (!b) fail(line, `edge ${key}: "${to}" is not a node`);
    if (a && b) {
      const [fromKinds, toKinds] = EDGES[kind];
      if (!fromKinds.includes(a.kind)) fail(line, `edge ${key}: ${kind} may not start from a ${a.kind}`);
      if (!toKinds.includes(b.kind)) fail(line, `edge ${key}: ${kind} may not end at a ${b.kind}`);
    }
    if (from === to) fail(line, `edge ${key}: a node cannot relate to itself`);
  });

  // Coverage: the record's own enumerations must all have nodes.
  for (const p of Object.keys(ctx.refs.pages)) {
    const m = /^decisions\/(dr-\d{3})-.*\.html$/.exec(p);
    if (m && !ids.has(m[1])) fail(1, `coverage: ${p} has no ${m[1]} node`);
  }
  const t71 = ctx.refs.pages['07-open/index.html']?.tables['7.1'];
  if (t71) {
    const opens = nodes.filter((n) => n.kind === 'open');
    for (const row of t71.rows) {
      const hit = opens.some((n) => (n.loci || []).some((l) => l.role === 'home' && parseLocus(l.at)?.phrase && row[0].includes(normalise(parseLocus(l.at).phrase))));
      if (!hit) fail(1, `coverage: Table 7.1 row "${row[0].slice(0, 60)}" has no open-* node whose home phrase matches it`);
    }
  }
  if (existsSync(P.report)) {
    const report = readFileSync(P.report, 'utf8');
    const findings = (report.match(/^\d+\. \(hunt (?:one|two|three);/gm) || []).length;
    const res = nodes.filter((n) => n.kind === 'res').length;
    if (findings && res !== findings) fail(1, `coverage: SURFACING_REPORT.md lists ${findings} residual findings and the map carries ${res} res-* nodes`);
  }
  for (const n of nodes) if (n.kind === 'dr') {
    const rejected = resolveLocus(ctx, `${parseLocus((n.loci || []).find((l) => l.role === 'canonical')?.at || '')?.page || ''}#rejected`);
    if (!rejected.error) {
      const dts = (rejected.html.match(/<dt>[\s\S]*?<\/dt>/g) || []).length;
      const alts = edges.filter((e) => e[0] === n.id && e[1] === 'rejects').length;
      if (dts && alts !== dts) fail(graphLine(ctx, n.id), `coverage: ${n.id} rejects ${dts} alternatives on its page and ${alts} in the map`);
    }
  }

  return finish();

  function finish() {
    out.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    return warnings ? { failures: out, warnings: warn } : out;
  }
}

function edgeLine(ctx, e) {
  if (!Array.isArray(e)) return 1;
  const i = ctx.raw.indexOf(JSON.stringify(e).replace(/,/g, ', '));
  return i < 0 ? 1 : lineOf(ctx.raw, i);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
function adjacency(graph) {
  const up = new Map(), down = new Map(), lat = new Map();
  const add = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };
  for (const [from, kind, to] of graph.edges || []) {
    if (kind === 'justifies' || kind === 'closes-off') { add(down, from, { id: to, kind, sym: '>' }); add(up, to, { id: from, kind, sym: '^' }); }
    else if (kind === 'depends-on') { add(up, from, { id: to, kind, sym: '^' }); add(down, to, { id: from, kind, sym: '<' }); }
    else if (kind === 'rejects') add(lat, from, { id: to, kind });
    else if (kind === 'conflicts-with') add(lat, to, { id: from, kind });
    else if (kind === 'lands-in') { add(lat, to, { id: from, kind }); add(lat, from, { id: to, kind }); }
  }
  return { up, down, lat };
}

function seedsFrom(ctx, spec) {
  const seeds = [];
  const reasons = [];
  for (const s of spec.split(',').map((x) => x.trim()).filter(Boolean)) {
    const mm = MEMBER_RE.exec(s);
    const id = mm ? mm[1] : s;
    if (!ctx.nodes.has(id)) throw new Error(`"${s}" is not a node${nearest(id, [...ctx.nodes.keys()]) ? ` (nearest: ${nearest(id, [...ctx.nodes.keys()])})` : ''}`);
    seeds.push(id);
    if (mm) reasons.push(`${id}: member ${mm[2]}`);
  }
  return { seeds, reasons };
}

export function impact(ctx, { seeds, depth = 2, stopAt = [], through = [], reasons = [] }) {
  const { up, down, lat } = adjacency(ctx.graph);
  const info = new Map(); // id -> { dist, dir, via: {id, sym}, depth }
  const setInfo = (id, v) => { if (!info.has(id)) info.set(id, v); };
  for (const s of seeds) setInfo(s, { dist: 0, dir: 'seed', via: null });

  // UP: unbounded, upstream relations only.
  let frontier = [...seeds];
  const upSet = new Set();
  while (frontier.length) {
    const next = [];
    for (const id of frontier) {
      const n = ctx.nodes.get(id);
      if (n && stopAt.includes(n.kind) && !seeds.includes(id)) continue;
      for (const nb of up.get(id) || []) {
        if (info.has(nb.id)) continue;
        info.set(nb.id, { dist: info.get(id).dist + 1, dir: 'up', via: { id, sym: nb.sym } });
        upSet.add(nb.id);
        next.push(nb.id);
      }
    }
    frontier = next;
  }

  // DOWN: bounded, downstream relations only, never re-entering UP; hubs held beyond the seed.
  const held = [];
  const perDepth = {};
  frontier = [...seeds];
  for (let d = 0; d < depth && frontier.length; d++) {
    const next = [];
    for (const id of frontier) {
      const out = down.get(id) || [];
      const isSeed = seeds.includes(id);
      if (!isSeed && out.length > HUB && !through.includes(id)) { held.push({ id, below: out.length }); continue; }
      for (const nb of out) {
        if (info.has(nb.id)) continue;
        info.set(nb.id, { dist: d + 1, dir: 'down', via: { id, sym: nb.sym } });
        perDepth[d + 1] = (perDepth[d + 1] || 0) + 1;
        next.push(nb.id);
      }
    }
    frontier = next;
  }

  const cone = [...info.keys()];
  const pathOf = (id) => {
    const parts = [];
    let cur = id;
    while (cur) { const i = info.get(cur); parts.unshift(i.via ? `${i.via.sym} ${cur}` : cur); cur = i.via ? i.via.id : null; }
    return parts.join(' ');
  };

  // LATERAL at distance one from every cone node.
  const alts = new Map(), opens = new Map(), residuals = new Map();
  for (const id of cone) for (const nb of lat.get(id) || []) {
    const n = ctx.nodes.get(nb.id);
    if (!n || info.has(nb.id)) continue;
    const target = n.kind === 'alt' ? alts : n.kind === 'res' ? residuals : opens;
    if (!target.has(nb.id)) target.set(nb.id, id);
  }
  // Residuals that cite a seed's canonical or restated locus without an edge. Only the seeds join this way: a mention
  // is too loose a join, and a downstream hub's loci would pull in every residual that cites a busy section.
  const coneLoci = new Map();
  for (const id of seeds) for (const l of ctx.nodes.get(id).loci || []) {
    if (!['canonical', 'restates', 'partial'].includes(l.role)) continue;
    const b = locusBase(l.at);
    if (!coneLoci.has(b)) coneLoci.set(b, []);
    coneLoci.get(b).push({ id, role: l.role, at: l.at });
  }
  for (const n of ctx.graph.nodes) if (n.kind === 'res' && !info.has(n.id) && !residuals.has(n.id)) {
    const hit = (n.loci || []).find((l) => coneLoci.has(locusBase(l.at)));
    if (hit) residuals.set(n.id, coneLoci.get(locusBase(hit.at))[0].id);
  }

  // Loci of the cone, grouped by page in manifest order then by line.
  const order = Object.keys(ctx.refs.pages);
  const rows = [];
  const seen = new Set();
  const addLocus = (id, l, tag) => {
    const key = `${id}|${l.at}`;
    if (seen.has(key)) return;
    seen.add(key);
    const p = parseLocus(l.at);
    const page = ctx.refs.pages[p.page];
    const line = p.table ? page?.tables[p.table]?.line || 0 : p.anchor ? page?.anchors[p.anchor]?.line || 0 : 0;
    const head = p.table ? `Table ${p.table}` : p.anchor ? page?.anchors[p.anchor]?.text || '' : page?.title || '';
    rows.push({ page: p.page, anchor: p.table ? `#table:${p.table}` : p.anchor ? `#${p.anchor}` : '(page)', phrase: p.phrase, line, head, id, role: l.role, path: tag || pathOf(id) });
  };
  for (const id of cone) for (const l of ctx.nodes.get(id).loci || []) addLocus(id, l);
  for (const [rid, via] of residuals) for (const l of ctx.nodes.get(rid).loci || []) addLocus(rid, l, `${via} ~ ${rid}`);
  rows.sort((a, b) => order.indexOf(a.page) - order.indexOf(b.page) || a.line - b.line || a.id.localeCompare(b.id));

  // Inbound links from other pages to the cone's loci.
  const bases = new Set(rows.map((r) => `${r.page}${r.anchor === '(page)' ? '' : r.anchor}`));
  const inbound = [];
  for (const [p, page] of Object.entries(ctx.refs.pages)) for (const l of page.links) {
    const to = l.to;
    if (bases.has(to) && !to.startsWith(p + '#') && to !== p) inbound.push({ from: p, line: l.line, to });
  }

  // What a change reopens: the records and ledger bullets above or at the seeds; a ledger heading is a grouping, not a decision.
  const reopens = cone.filter((id) => { const n = ctx.nodes.get(id); return n.kind === 'dr' || (n.kind === 'ledger' && /^ledger-\d+\.\d+\.\d+$/.test(id)); })
    .sort((a, b) => (info.get(a).dist - info.get(b).dist) || a.localeCompare(b));
  return { seeds, reasons, depth, info, cone, upSet, perDepth, held, reopens, alts, opens, residuals, rows, inbound, pathOf };
}

function facetsOf(n) { const f = n.facets || {}; return f.fixity ? ` [${f.fixity}]` : ''; }

export function renderImpact(ctx, R, { md = false, links = false } = {}) {
  const L = [];
  const label = (id) => `${id}  ${ctx.nodes.get(id)?.label || ''}`;
  const closes = (id) => (ctx.graph.edges || []).filter((e) => e[0] === id && e[1] === 'closes-off').map((e) => e[2]);
  const b = md ? '**' : '';
  L.push(`${b}impact ${R.seeds.join(', ')}${b} (down ${R.depth})${R.reasons.length ? '  ' + R.reasons.join('; ') : ''}`);
  const head = (k, lines) => { if (!lines.length) { L.push(`${k.padEnd(12)} none`); return; } lines.forEach((x, i) => L.push(`${(i ? '' : k).padEnd(12)} ${x}`)); };
  head('REOPENS', R.reopens.map((id) => {
    const i = R.info.get(id);
    const via = i.via ? `  <- ${i.via.id}` : '';
    const co = closes(id);
    return `${label(id)}${facetsOf(ctx.nodes.get(id))}${co.length ? `; closes off ${co.join(', ')}` : ''}${via}`;
  }));
  head('ALTERNATIVES', [...R.alts.entries()].map(([id, via]) => `${label(id)}  (rejected by ${via})`));
  head('OPEN ITEMS', [...R.opens.entries()].map(([id, via]) => `${label(id)}  (lands in ${via})`));
  head('RESIDUALS', [...R.residuals.entries()].map(([id, via]) => `${label(id)}  (cites ${via})`));
  const downCount = R.cone.filter((id) => R.info.get(id).dir === 'down').length;
  const dd = Object.entries(R.perDepth).map(([d, c]) => `d${d} ${c}`).join(', ');
  L.push(`${'UPSTREAM'.padEnd(12)} ${R.upSet.size} nodes`);
  L.push(`${'DOWNSTREAM'.padEnd(12)} ${downCount} nodes${dd ? ` (${dd})` : ''}${R.held.length ? `; hub held: ${R.held.map((h) => `${h.id} (${h.below} below)`).join(', ')}; add --through <id>` : ''}`);
  const pages = new Set(R.rows.map((r) => r.page));
  const fromPages = new Set(R.inbound.map((x) => x.from));
  L.push(`${'LOCI'.padEnd(12)} ${R.rows.length} on ${pages.size} pages; ${R.inbound.length} inbound links from ${fromPages.size} pages${links ? '' : ' (--links)'}`);
  let cur = null;
  for (const r of R.rows) {
    if (r.page !== cur) { cur = r.page; L.push(md ? `\n${cur}` : cur); }
    const where = r.phrase ? `${r.anchor}!"${r.phrase}"` : r.anchor;
    L.push(`${md ? '- [ ] ' : '  '}${where.padEnd(44)} ${String(r.line).padStart(5)}  ${r.head.slice(0, 40).padEnd(40)}  ${r.id} [${r.role}]  ${r.path}`);
  }
  if (links && R.inbound.length) {
    L.push(md ? '\nInbound links' : 'INBOUND');
    for (const x of R.inbound.sort((a, b) => a.from.localeCompare(b.from) || a.line - b.line)) L.push(`  ${x.from}:${x.line} -> ${x.to}`);
  }
  return L.join('\n');
}

export function batch(ctx, changes, { depth = 2 } = {}) {
  const results = {};
  for (const [name, spec] of Object.entries(changes)) {
    const { seeds, reasons } = seedsFrom(ctx, Array.isArray(spec) ? spec.join(',') : spec);
    results[name] = impact(ctx, { seeds, depth, reasons });
  }
  return results;
}

export function renderBatch(ctx, results, { md = false } = {}) {
  const names = Object.keys(results);
  const L = [];
  const b = md ? '**' : '';
  L.push(`${b}batch${b} of ${names.length} change${names.length === 1 ? '' : 's'}: ${names.join(', ')}`);
  for (const name of names) {
    const R = results[name];
    L.push('');
    L.push(`${b}${name}${b}: seeds ${R.seeds.join(', ')}`);
    if (!R.reopens.length) L.push('  reopens nothing fixed');
    for (const id of R.reopens) L.push(`  reopens ${id}  ${ctx.nodes.get(id).label}${facetsOf(ctx.nodes.get(id))}`);
    for (const [id] of R.alts) L.push(`  alternative ${id}  ${ctx.nodes.get(id).label}`);
    for (const [id] of R.residuals) L.push(`  residual ${id}  ${ctx.nodes.get(id).label}`);
    for (const [id] of R.opens) L.push(`  open ${id}  ${ctx.nodes.get(id).label}`);
  }
  const shared = new Map();
  for (const name of names) for (const id of results[name].reopens) { if (!shared.has(id)) shared.set(id, []); shared.get(id).push(name); }
  L.push('');
  L.push(`${b}shared upstream${b} (reopened by two or more changes)`);
  const sh = [...shared.entries()].filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length);
  if (!sh.length) L.push('  none');
  for (const [id, v] of sh) L.push(`  ${id}  ${ctx.nodes.get(id).label}  (${v.join(', ')})`);
  const union = new Map();
  for (const name of names) for (const r of results[name].rows) {
    const key = `${r.page}${r.anchor}`;
    if (!union.has(key)) union.set(key, { page: r.page, anchor: r.anchor, line: r.line, head: r.head, by: new Set(), nodes: new Set() });
    const u = union.get(key);
    u.by.add(name);
    u.nodes.add(r.id);
  }
  const order = Object.keys(ctx.refs.pages);
  const rows = [...union.values()].sort((a, b) => b.by.size - a.by.size || order.indexOf(a.page) - order.indexOf(b.page) || a.line - b.line);
  L.push('');
  L.push(`${b}loci${b}: ${rows.length} sections on ${new Set(rows.map((r) => r.page)).size} pages; "touched by" counts the changes whose closure reaches the section`);
  for (const r of rows) L.push(`${md ? '- [ ] ' : '  '}${String(r.by.size).padStart(2)} of ${names.length}  ${(r.page + r.anchor).padEnd(58)} ${String(r.line).padStart(5)}  ${r.head.slice(0, 36).padEnd(36)}  ${[...r.nodes].join(', ')}  (${[...r.by].join(', ')})`);
  return L.join('\n');
}

export function at(ctx, locus) {
  const base = locusBase(locus);
  const p = parseLocus(locus);
  const carriers = ctx.byLocus.get(base) || [];
  const inbound = [];
  for (const [pg, page] of Object.entries(ctx.refs.pages)) for (const l of page.links) if (l.to === base.replace(/#$/, '') && pg !== p.page) inbound.push({ from: pg, line: l.line });
  return { base, carriers, inbound };
}

export function renderAt(ctx, A) {
  const L = [`at ${A.base}`];
  if (!A.carriers.length) L.push(`  no node carries this locus; ${A.inbound.length} inbound links from ${new Set(A.inbound.map((x) => x.from)).size} pages`);
  const byRole = {};
  for (const c of A.carriers) { (byRole[c.locus.role] = byRole[c.locus.role] || []).push(c); }
  for (const role of ROLES) for (const c of byRole[role] || []) L.push(`  ${role.padEnd(10)} ${c.node.id}  ${c.node.label}${c.locus.drift ? `  (drift waiver ${c.locus.drift})` : ''}`);
  if (A.carriers.length) L.push(`  inbound    ${A.inbound.length} links from ${new Set(A.inbound.map((x) => x.from)).size} pages`);
  for (const x of A.inbound.sort((a, b) => a.from.localeCompare(b.from) || a.line - b.line)) L.push(`             ${x.from}:${x.line}`);
  return L.join('\n');
}

export function show(ctx, id) {
  const n = ctx.nodes.get(id);
  if (!n) throw new Error(`"${id}" is not a node`);
  const L = [`${n.id}  ${n.label}`, `  kind ${n.kind}${Object.entries(n.facets || {}).map(([k, v]) => `  ${k}=${v}`).join('')}`];
  if (n.source) L.push(`  source ${n.source}`);
  if (n.note) L.push(`  note ${n.note}`);
  if (n.members) L.push(`  members ${n.members.map((m) => m.id).join(', ')}`);
  for (const l of n.loci || []) {
    const p = parseLocus(l.at);
    const page = ctx.refs.pages[p.page];
    const head = p.table ? `Table ${p.table}` : p.anchor ? page?.anchors[p.anchor]?.text || '' : page?.title || '';
    L.push(`  ${l.role.padEnd(10)} ${l.at}  (${head})${l.drift ? `  drift ${l.drift}` : ''}`);
  }
  for (const [from, kind, to] of ctx.graph.edges || []) {
    if (from === id) L.push(`  ${kind.padEnd(14)} -> ${to}  ${ctx.nodes.get(to)?.label || ''}`);
    else if (to === id) L.push(`  ${kind.padEnd(14)} <- ${from}  ${ctx.nodes.get(from)?.label || ''}`);
  }
  return L.join('\n');
}

export function list(ctx, { kind, facet } = {}) {
  let nodes = ctx.graph.nodes;
  if (kind) nodes = nodes.filter((n) => n.kind === kind);
  if (facet) { const [k, v] = facet.split('='); nodes = nodes.filter((n) => String((n.facets || {})[k]) === v); }
  return nodes.map((n) => `${n.id.padEnd(40)} ${n.label}`).join('\n') + `\n${nodes.length} nodes`;
}

// ---------------------------------------------------------------------------
// selftest: the normaliser and the resolver against known inputs
// ---------------------------------------------------------------------------
export function selftest(root = DEFAULT_ROOT) {
  const failures = [];
  const assert = (cond, msg) => { if (!cond) failures.push(msg); };
  assert(normalise('<p>A &amp; B\u2019s  <em>thing</em></p>') === "a & b's thing", 'normalise: entities, quotes and whitespace');
  assert(normalise('a form submit, a click; a sentence and a release: end', { verbatim: true }) === 'a form submit, a click, a sentence, a release, end', 'normalise: verbatim separator collapse');
  assert(hasToken('closed refused-policy and refused-policy-pending', 'refused-policy'), 'hasToken: finds a hyphenated code');
  assert(!hasToken('closed refused-policy-pending', 'refused-policy'), 'hasToken: does not match inside a longer code');
  assert(!hasToken('the book is closed', 'ok'), 'hasToken: does not match inside a word');
  const l = parseLocus('03-trust-and-data/index.html#table:3.5!"Sign or e-sign"');
  assert(l && l.page === '03-trust-and-data/index.html' && l.table === '3.5' && l.phrase === 'Sign or e-sign', 'parseLocus: table and phrase');
  assert(locusBase('a.html#x!"phrase here"') === 'a.html#x', 'locusBase strips the phrase');
  const ctx = loadContext(root, { needGraph: false });
  const a = resolveLocus(ctx, '02-architecture/index.html#state-machine-invariant');
  const b = resolveLocus(ctx, '02-architecture/worker-console.html#state-machine-invariant');
  assert(!a.error && !b.error, 'resolve: the state-machine invariant block resolves on both pages');
  if (!a.error && !b.error) assert(normalise(a.html) === normalise(b.html), 'resolve: the two invariant copies normalise identically');
  const bad = resolveLocus(ctx, '02-architecture/index.html#state-machine-invariantt');
  assert(bad.error && /nearest/.test(bad.error), 'resolve: a misspelt id fails with a nearest-id suggestion');
  const sec = resolveLocus(ctx, '02-architecture/index.html#state-machine');
  assert(!sec.error && normalise(sec.html).includes('a task never leaves the system by omission'), 'resolve: an h2 slice contains its blockquote');
  assert(!normalise(sec.html).includes(normalise('definitely not a phrase on this page 4471')), 'resolve: a missing phrase is not found');
  // Every internal link the harness accepts resolves to a page, and to an anchor where it carries one.
  let broken = 0;
  for (const [p, page] of Object.entries(ctx.refs.pages)) for (const lk of page.links) {
    const [pg, frag] = lk.to.split('#');
    if (!ctx.refs.pages[pg]) { broken++; continue; }
    if (frag && !ctx.refs.pages[pg].anchors[frag] && !EXCLUDED_ID(frag) && !ctx.texts.get(pg).includes(`id="${frag}"`)) broken++;
  }
  assert(broken === 0, `refs: ${broken} internal links do not resolve in refs.json`);
  return failures;
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------
function args(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (['md', 'json', 'links', 'warnings', 'fragment', 'site'].includes(k)) opt[k] = true;
      else if (k === 'change') { (opt.change = opt.change || []).push(argv[++i]); }
      else opt[k] = argv[++i];
    } else pos.push(a);
  }
  return { pos, opt };
}

function usage() {
  return `usage: node tools/depmap.mjs <command>
  extract                              regenerate tools/depmap/refs.json
  check [--warnings]                   validate graph.json against docs/ (exit 1 on failure)
  selftest                             the normaliser and resolver against known inputs
  impact <seeds> [--depth n] [--stop-at kinds] [--through ids] [--links] [--md]
  impact --at <locus> [...]            seeded by every node carrying the locus
  reopens <seeds>                      only the header of impact
  batch --change name=seeds [...]      or: batch plan.json
  at <locus>                           every node carrying the locus, plus inbound links
  show <id>                            a node, its loci and its edges
  list [--kind k] [--facet name=value]
  view [--out file] [--fragment|--site] [--scope record|architecture]
                                       bake graph.json into a viewer: the record's 3D view (tools/depmap/view.html; --site writes docs/depmap/index.html)
                                       or the architecture blueprint (tools/depmap/view-architecture.html; --site writes docs/depmap/architecture.html)
Seeds: node ids separated by commas; a member path vocab-x/m seeds vocab-x.`;
}

function main() {
  const { pos, opt } = args(process.argv.slice(2));
  const cmd = pos[0];
  const root = opt.root ? resolve(opt.root) : DEFAULT_ROOT;
  const P = paths(root);
  try {
    if (cmd === 'extract') {
      mkdirSync(P.dir, { recursive: true });
      const refs = buildRefs(root);
      writeFileSync(P.refs, serialise(refs));
      const pages = Object.keys(refs.pages).length;
      const anchors = Object.values(refs.pages).reduce((s, p) => s + Object.keys(p.anchors).length, 0);
      const tables = Object.values(refs.pages).reduce((s, p) => s + Object.keys(p.tables).length, 0);
      const links = Object.values(refs.pages).reduce((s, p) => s + p.links.length, 0);
      console.log(`extract: ${pages} pages, ${anchors} anchors, ${tables} tables, ${links} internal links written to ${rel(root, P.refs)}`);
      return;
    }
    if (cmd === 'check') {
      const r = check({ root, warnings: true });
      for (const f of r.failures) console.log(`${f.file}:${f.line}: ${f.msg}`);
      if (opt.warnings) for (const w of r.warnings) console.log(`${w.file}:${w.line}: warning: ${w.msg}`);
      const ctx = existsSync(P.graph) ? loadContext(root) : null;
      if (r.failures.length) { console.log(`\n${r.failures.length} failure(s).`); process.exit(1); }
      console.log(`check: clean. ${ctx ? ctx.graph.nodes.length : 0} nodes, ${ctx ? (ctx.graph.edges || []).length : 0} edges${r.warnings.length ? `, ${r.warnings.length} warning(s)${opt.warnings ? '' : ' (--warnings)'}` : ''}.`);
      return;
    }
    if (cmd === 'view') {
      // Bake graph.json into the viewer template. Three renderings: the local page (tools/depmap/view.html, ignored by
      // git), the fragment a hosting wrapper supplies the skeleton for, and the served view at docs/depmap/ (--site),
      // committed and checked fresh by the harness (DR-017, revised 2026-09-10).
      const mode = opt.site ? 'site' : opt.fragment ? 'fragment' : 'local';
      const scope = opt.scope || 'record';
      if (!SCOPES.includes(scope)) throw new Error(`--scope is one of ${SCOPES.join(', ')}`);
      const { page, nodes, edges } = renderView({ root, mode, scope });
      const stem = scope === 'record' ? 'view' : `view-${scope}`;
      const outPath = opt.out ? resolve(opt.out) : mode === 'site' ? join(root, 'docs', 'depmap', scope === 'record' ? 'index.html' : `${scope}.html`) : join(P.dir, mode === 'fragment' ? `${stem}.fragment.html` : `${stem}.html`);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, page);
      console.log(`view: ${nodes} nodes, ${edges} edges written to ${rel(root, outPath)}${mode === 'local' ? '' : ` (${mode})`}${scope === 'record' ? '' : ` (${scope})`}`);
      return;
    }
    if (cmd === 'selftest') {
      const f = selftest(root);
      for (const x of f) console.log(`selftest: ${x}`);
      if (f.length) process.exit(1);
      console.log('selftest: clean.');
      return;
    }
    const ctx = loadContext(root);
    if (!ctx.graph) throw new Error('graph.json is missing');
    if (cmd === 'impact' || cmd === 'reopens') {
      let seeds = [], reasons = [];
      if (opt.at) {
        const A = at(ctx, opt.at);
        if (!A.carriers.length) { console.log(renderAt(ctx, A)); return; }
        seeds = [...new Set(A.carriers.map((c) => c.node.id))];
      }
      if (pos[1]) { const s = seedsFrom(ctx, pos[1]); seeds.push(...s.seeds); reasons.push(...s.reasons); }
      if (!seeds.length) throw new Error('impact needs seeds or --at <locus>');
      const R = impact(ctx, { seeds: [...new Set(seeds)], depth: Number(opt.depth || 2), stopAt: (opt['stop-at'] || '').split(',').filter(Boolean), through: (opt.through || '').split(',').filter(Boolean), reasons });
      if (opt.json) { console.log(JSON.stringify({ seeds: R.seeds, reopens: R.reopens, alternatives: [...R.alts.keys()], open: [...R.opens.keys()], residuals: [...R.residuals.keys()], held: R.held, rows: R.rows, inbound: R.inbound }, null, 2)); return; }
      const text = renderImpact(ctx, R, { md: opt.md, links: opt.links });
      console.log(cmd === 'reopens' ? text.split('\n').filter((l) => /^(impact|REOPENS|ALTERNATIVES|\s{12} )/.test(l) && !/^UPSTREAM|^DOWNSTREAM|^LOCI/.test(l)).join('\n') : text);
      return;
    }
    if (cmd === 'batch') {
      let changes = {};
      if (pos[1]) changes = readJson(resolve(pos[1])).changes || {};
      for (const c of opt.change || []) { const i = c.indexOf('='); if (i < 0) throw new Error(`--change wants name=seeds, got "${c}"`); changes[c.slice(0, i)] = c.slice(i + 1); }
      if (!Object.keys(changes).length) throw new Error('batch needs --change name=seeds or a plan file');
      const results = batch(ctx, changes, { depth: Number(opt.depth || 2) });
      if (opt.json) { console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([k, R]) => [k, { seeds: R.seeds, reopens: R.reopens, alternatives: [...R.alts.keys()], residuals: [...R.residuals.keys()], open: [...R.opens.keys()], rows: R.rows }])), null, 2)); return; }
      console.log(renderBatch(ctx, results, { md: opt.md }));
      return;
    }
    if (cmd === 'at') { if (!pos[1]) throw new Error('at needs a locus'); console.log(renderAt(ctx, at(ctx, pos[1]))); return; }
    if (cmd === 'show') { if (!pos[1]) throw new Error('show needs a node id'); console.log(show(ctx, pos[1])); return; }
    if (cmd === 'list') { console.log(list(ctx, { kind: opt.kind, facet: opt.facet })); return; }
    console.log(usage());
    process.exit(cmd ? 1 : 0);
  } catch (e) {
    console.error(`depmap: ${e.message}`);
    process.exit(2);
  }
}


// The two views, rendered from their templates with graph.json baked in. Scopes: record (view.src.html, the whole
// graph in three dimensions) and architecture (view-architecture.src.html, the harness alone as a blueprint). Modes:
// local (tools/depmap/view*.html, fonts from docs/assets), fragment (body only, fonts from Google, for a hosting
// wrapper), site (docs/depmap/index.html and docs/depmap/architecture.html, the served views: self-hosted fonts, a
// no-index directive, links back to the publication and to each other). Deterministic, so the harness can compare
// each committed site view against a fresh rendering and fail when it is stale.
const SCOPES = ['record', 'architecture'];
const TECH_LAYERS = new Set(['architecture', 'trust', 'operations', 'product']);

// The architecture scope is a query of the one graph, never a second map: the components, the invariants, lists
// and flag rows of the harness's own layers, whatever a kept node depends on, the records that justify or close
// off a kept node, the stages, and the open items and residual findings that land in any of those. The fatal
// failures, the premises, the ledger, the rejected alternatives and every node of the business, publishing, open
// and index layers stay in the record's view.
export function architectureSubgraph(g) {
  const byId = new Map(g.nodes.map((n) => [n.id, n]));
  const keep = new Set();
  for (const n of g.nodes) if (n.kind === 'stage' || (['comp', 'inv', 'vocab', 'flag'].includes(n.kind) && TECH_LAYERS.has((n.facets || {}).layer))) keep.add(n.id);
  for (const [a, k, b] of g.edges) if (k === 'depends-on' && keep.has(a) && ['inv', 'vocab', 'flag'].includes(byId.get(b)?.kind)) keep.add(b);
  for (const [a, k, b] of g.edges) if ((k === 'justifies' || k === 'closes-off') && keep.has(b) && byId.get(a)?.kind === 'dr') keep.add(a);
  for (const [a, k, b] of g.edges) if ((k === 'lands-in' || k === 'conflicts-with') && keep.has(b) && ['open', 'res'].includes(byId.get(a)?.kind)) keep.add(a);
  return {
    nodes: g.nodes.filter((n) => keep.has(n.id)),
    edges: g.edges.filter(([a, k, b]) => keep.has(a) && keep.has(b) && k !== 'rejects'),
  };
}

export function renderView({ root = DEFAULT_ROOT, mode = 'local', scope = 'record' } = {}) {
  const P = paths(root);
  if (!SCOPES.includes(scope)) throw new Error(`scope is one of ${SCOPES.join(', ')}`);
  const arch = scope === 'architecture';
  const tpl = readFileSync(join(P.dir, arch ? 'view-architecture.src.html' : 'view.src.html'), 'utf8');
  const g = readJson(P.graph);
  const refs = buildRefs(root);
  const sub = arch ? architectureSubgraph(g) : { nodes: g.nodes, edges: g.edges };
  const titleOf = (p) => (refs.pages[p]?.title || p).replace(/, AI\.fred$/, '');
  // The architecture view links every locus to the section that states it, so an engineer reads the page, not the map.
  const locusLink = (at) => {
    const l = parseLocus(at);
    if (!l || !refs.pages[l.page]) return {};
    const pg = refs.pages[l.page];
    if (l.table) { const tb = pg.tables[l.table]; return { href: `../${l.page}${tb?.id ? '#' + tb.id : ''}`, text: `${titleOf(l.page)}: Table ${l.table}` }; }
    if (l.anchor) { const a = pg.anchors[l.anchor]; return { href: `../${l.page}#${l.anchor}`, text: `${titleOf(l.page)}: ${a ? [a.no, a.text].filter(Boolean).join(' ') : l.anchor}` }; }
    return { href: `../${l.page}`, text: titleOf(l.page) };
  };
  const data = {
    edition: g.edition,
    scope,
    nodes: sub.nodes.map((n) => ({ id: n.id, kind: n.kind, label: n.label, facets: n.facets || {}, loci: (n.loci || []).map((l) => ({ at: l.at, role: l.role, ...(arch ? locusLink(l.at) : {}) })), note: n.note, source: n.source })),
    edges: sub.edges,
    pages: Object.fromEntries(Object.entries(refs.pages).filter(([p]) => !p.startsWith('depmap/')).map(([p, pg]) => [p, pg.title.replace(/, AI\.fred$/, '')])),
  };
  const json = JSON.stringify(data).replace(/<\//g, '<\\/');
  const faces = [['Inter', '100 900', 'inter-latin-wght-normal', 'woff2-variations'], ['IBM Plex Mono', 400, 'IBMPlexMono-Regular', 'woff2'], ['IBM Plex Mono', 500, 'IBMPlexMono-Medium', 'woff2']];
  const fontBase = mode === 'site' ? '../assets/fonts' : '../../docs/assets/fonts';
  const fonts = mode === 'fragment'
    ? '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">'
    : `<style>\n${faces.map(([f, w, file, fmt]) => `@font-face { font-family: "${f}"; font-weight: ${w}; font-style: normal; font-display: swap; src: url("${fontBase}/${file}.woff2") format("${fmt}"); }`).join('\n')}\n</style>`;
  const other = arch ? '<a class="back" href="./">The record\'s map</a>' : '<a class="back" href="architecture.html">The architecture map</a>';
  const back = mode === 'site' ? `<a class="back" href="../">Back to the publication</a>${other}` : '';
  const body = tpl.replace('<!--__FONTS__-->', fonts).replace('<!--__BACK__-->', back).replace('/*__GRAPH__*/', json);
  let page = body;
  if (mode !== 'fragment') {
    const description = arch
      ? 'The architecture map of the AI.fred harness (DR-017): every component placed in the zones of the component map, the invariants it must keep, the closed lists and policy flags it reads, the records that justify it and the stage that builds it, with the cone of change for any node and a link to the section that states it. Generated from tools/depmap/graph.json and never edited by hand.'
      : 'The dependency map of the AI.fred record (DR-017) as a three-dimensional view: every decision, mechanism, invariant and closed list, with the cone of change for any node. Generated from tools/depmap/graph.json and never edited by hand.';
    const head = mode === 'site'
      ? `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex, nofollow">\n<meta name="description" content="${description}">`
      : '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">';
    page = `<!doctype html>\n<html lang="en-GB"${mode === 'site' ? ' data-theme="dark"' : ''}>\n<head>\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
  }
  return { page, nodes: data.nodes.length, edges: data.edges.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
