#!/usr/bin/env node
// AI.fred page build. Node 18 or later, no dependencies (DR-028, DR-029).
// Assembles docs/ from src/pages/ by verbatim copy or verbatim concatenation: a page under 3,000 words of
// prose is one file at src/pages/<path>; a longer page is a directory src/pages/<path minus .html>/ of
// fragments, 000-head.html, one NNN-<h2 id>.html per top-level section, 999-foot.html, concatenated in
// filename order. No templating, no transformation, no whitespace rewriting. Deterministic.
// After the canonical pages, the build reads roles.json, manifest.json and tools/depmap/graph.json and
// writes the generated views (the front door, the roles index, one page per role, the record door), the
// sections list of every manifest entry and .github/CODEOWNERS. A view carries one hand-written frame and
// otherwise only what is generated or transcluded verbatim from a marked key block (data-key).
// `check()` and `checkViews()` are exported for tools/verify.mjs sections 9 and 10; every failure is
// { file, line, msg } with a repo-relative file. Importing this module has no side effects; the command
// line runs only when the file is executed directly.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, resolve, basename, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..');

// Pages under docs/ that another tool writes and holds fresh: never a source here, never checked here.
const FOREIGN = ['depmap/index.html', 'depmap/architecture.html']; // node tools/depmap.mjs view --site (DR-017)
const FRAGMENT_RE = /^\d{3}-[a-z0-9-]+\.html$/;
const REPO_OWNER = 'sharan50';

// ---------------------------------------------------------------------------
// Text: the prose word count the split threshold and the manifest use
// ---------------------------------------------------------------------------
export function decode(t) {
  return t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'").replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n)));
}
export function prose(html) {
  return decode(html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]*>/g, ' '));
}
export function words(html) {
  const t = prose(html).trim();
  return t ? t.split(/\s+/).length : 0;
}
// Tags stripped, entities decoded, whitespace collapsed: the text of an element.
export const textOf = (html) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lineOf = (text, index) => text.slice(0, Math.max(0, index)).split('\n').length;

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
const rel = (root, f) => relative(root, f).split('\\').join('/');
const read = (f) => readFileSync(f, 'utf8');
const readJson = (f) => JSON.parse(read(f));

function paths(root) {
  return {
    root,
    docs: join(root, 'docs'),
    src: join(root, 'src', 'pages'),
    templates: join(root, 'src', 'templates'),
    manifest: join(root, 'manifest.json'),
    roles: join(root, 'roles.json'),
    graph: join(root, 'tools', 'depmap', 'graph.json'),
    codeowners: join(root, '.github', 'CODEOWNERS'),
  };
}

// ---------------------------------------------------------------------------
// Sources: one entry per page, { path, kind, files } where kind is "file" or "fragments"
// ---------------------------------------------------------------------------
export function sources(root = DEFAULT_ROOT) {
  const P = paths(root);
  const pages = new Map();
  const problems = [];
  if (!existsSync(P.src)) { problems.push({ file: 'src/pages', line: 1, msg: 'src/pages/ does not exist' }); return { pages, problems }; }
  const dirs = new Map(); // fragment directory -> files
  for (const f of walk(P.src)) {
    const r = rel(P.src, f);
    const name = basename(f);
    if (FRAGMENT_RE.test(name)) {
      const d = dirname(f);
      if (!dirs.has(d)) dirs.set(d, []);
      dirs.get(d).push(f);
      continue;
    }
    if (!name.endsWith('.html')) { problems.push({ file: `src/pages/${r}`, line: 1, msg: 'not a page or a fragment; only .html files live under src/pages/' }); continue; }
    pages.set(r, { path: r, kind: 'file', files: [f] });
  }
  for (const [d, files] of dirs) {
    const r = rel(P.src, d) + '.html';
    for (const other of readdirSync(d)) {
      if (!FRAGMENT_RE.test(other)) problems.push({ file: `src/pages/${rel(P.src, join(d, other))}`, line: 1, msg: `a fragment directory holds fragments only (NNN-name.html); ${other} is not one` });
    }
    if (pages.has(r)) problems.push({ file: `src/pages/${rel(P.src, d)}`, line: 1, msg: `both a page file and a fragment directory exist for ${r}` });
    const names = files.map((f) => basename(f));
    if (!names.includes('000-head.html')) problems.push({ file: `src/pages/${rel(P.src, d)}`, line: 1, msg: 'fragment directory lacks 000-head.html' });
    if (!names.includes('999-foot.html')) problems.push({ file: `src/pages/${rel(P.src, d)}`, line: 1, msg: 'fragment directory lacks 999-foot.html' });
    pages.set(r, { path: r, kind: 'fragments', files: files.slice().sort((a, b) => (basename(a) < basename(b) ? -1 : 1)) });
  }
  return { pages: new Map([...pages.entries()].sort()), problems };
}

// The page a source assembles to, byte for byte.
export function assemble(entry) {
  return entry.files.map((f) => read(f)).join('');
}

// The source file and line that hold line `line` of the assembled page.
export function sourceLine(root, entry, line) {
  let acc = 0;
  for (const f of entry.files) {
    const n = read(f).split('\n').length - 1;
    if (line <= acc + n) return { file: rel(root, f), line: line - acc };
    acc += n;
  }
  return { file: rel(root, entry.files[entry.files.length - 1]), line: 1 };
}

// ---------------------------------------------------------------------------
// The publication as data: the .doc column, its h2 sections, its key blocks
// ---------------------------------------------------------------------------
export function slugOf(path) {
  const m = /^decisions\/(dr-\d{3})-/.exec(path);
  if (m) return m[1];
  if (path === 'index.html') return 'index';
  return path.replace(/\/index\.html$/, '').replace(/^.*\//, '').replace(/\.html$/, '');
}

// The outer HTML of the element whose opening tag starts at `start`, by balancing its own tag name.
function elementAt(html, start) {
  const m = /^<([a-zA-Z][a-zA-Z0-9]*)\b/.exec(html.slice(start));
  if (!m) return null;
  const tag = m[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  re.lastIndex = start;
  let depth = 0, x;
  while ((x = re.exec(html))) {
    depth += x[1] ? -1 : 1;
    if (depth === 0) return { tag, start, end: re.lastIndex, html: html.slice(start, re.lastIndex) };
  }
  return null;
}

// The .doc column: its inner HTML and its offset in the page.
export function docOf(html) {
  const open = html.indexOf('<div class="doc">');
  if (open < 0) return null;
  const el = elementAt(html, open);
  if (!el) return null;
  const innerStart = open + '<div class="doc">'.length;
  return { start: innerStart, end: el.end - '</div>'.length, html: html.slice(innerStart, el.end - '</div>'.length) };
}

const h2Title = (inner) => textOf(inner.replace(/<span class="no">[\s\S]*?<\/span>/, ''));

// Every h2 section of a page: id, title, words, the anchors inside it, the key blocks inside it.
export function sectionsOf(html) {
  const doc = docOf(html);
  if (!doc) return { doc: null, sections: [], anchors: new Map(), keys: [] };
  const heads = [...doc.html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)].map((m) => ({ index: m.index, attrs: m[1], inner: m[2] }));
  const sections = heads.map((h, i) => {
    const id = (/\sid="([^"]+)"/.exec(h.attrs) || [])[1] || null;
    const start = h.index, end = i + 1 < heads.length ? heads[i + 1].index : doc.html.length;
    const slice = doc.html.slice(start, end);
    return { id, title: h2Title(h.inner), no: (/<span class="no">([^<]*)<\/span>/.exec(h.inner) || [])[1] || null, words: words(slice), start, end, slice, line: lineOf(html, doc.start + start) };
  });
  const anchors = new Map();
  for (const s of sections) for (const m of s.slice.matchAll(/\sid="([^"]+)"/g)) if (!anchors.has(m[1])) anchors.set(m[1], s.id);
  const keys = [];
  for (const m of doc.html.matchAll(/\sdata-key="([^"]+)"/g)) {
    const start = doc.html.lastIndexOf('<', m.index);
    const el = elementAt(doc.html, start);
    const section = sections.filter((s) => s.start <= start).pop() || null;
    keys.push({ key: m[1], section: section ? section.id : null, html: el ? el.html : '', tag: el ? el.tag : '', line: lineOf(html, doc.start + start) });
  }
  return { doc, sections, anchors, keys };
}

// ---------------------------------------------------------------------------
// Roles, the manifest and the graph
// ---------------------------------------------------------------------------
export function loadRoles(root) {
  const P = paths(root);
  return existsSync(P.roles) ? readJson(P.roles) : null;
}
export function generatedPages(roles) {
  if (!roles) return [];
  return ['index.html', 'roles/index.html', ...roles.roles.map((r) => `roles/${r.id}/index.html`), 'record/index.html'];
}

// Table 7.1: label, owner cell, trigger, status, row id, and the open-* node whose home phrase matches.
export function openItems(html07, graph) {
  const m = /<table class="data">\s*<caption><span class="tab-no">Table 7\.1<\/span>[\s\S]*?<\/table>/.exec(html07 || '');
  if (!m) return [];
  const cellText = (c) => textOf(c.replace(/<span\s+class="chip[^"]*"[^>]*>[\s\S]*?<\/span>/g, ' '));
  const norm = (s) => textOf(s).toLowerCase();
  const opens = (graph ? graph.nodes : []).filter((n) => n.kind === 'open').map((n) => {
    const home = (n.loci || []).find((l) => l.role === 'home');
    const phrase = home ? (/!"([^"]+)"/.exec(home.at) || [])[1] : null;
    return { node: n, phrase: phrase ? phrase.toLowerCase() : null };
  });
  const rows = [];
  for (const r of m[0].matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)) {
    const cells = [...r[2].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
    if (cells.length < 3) continue;
    const label = cellText(cells[0]);
    const id = (/\sid="([^"]+)"/.exec(r[1]) || [])[1] || null;
    const status = (/class="chip chip-([a-z-]+)"/.exec(cells[3] || '') || [])[1] || null;
    const hit = opens.find((o) => o.phrase && norm(cells[0]).includes(o.phrase));
    rows.push({ label, owner: cellText(cells[1]), trigger: cellText(cells[2]), status, id, node: hit ? hit.node : null, line: lineOf(html07, m.index + r.index) });
  }
  return rows;
}

// The Owner column to roles: the first named owns, the others read; null when nothing maps.
export function mapOwnerCell(cell, ownerText) {
  const found = [];
  for (const [text, role] of Object.entries(ownerText || {})) {
    const i = cell.toLowerCase().indexOf(text.toLowerCase());
    if (i >= 0) found.push({ i, role });
  }
  found.sort((a, b) => a.i - b.i);
  const seen = [];
  for (const f of found) if (!seen.includes(f.role)) seen.push(f.role);
  return seen.length ? { owner: seen[0], readers: seen.slice(1) } : null;
}

// Everything the views are built from, computed once.
export function model(root = DEFAULT_ROOT) {
  const P = paths(root);
  const problems = [];
  const fail = (file, line, msg) => problems.push({ file, line, msg });
  const { pages: srcPages, problems: srcProblems } = sources(root);
  problems.push(...srcProblems);
  const roles = loadRoles(root);
  if (!roles) fail('roles.json', 1, 'roles.json is missing');
  const manifest = existsSync(P.manifest) ? readJson(P.manifest) : { pages: [] };
  const graph = existsSync(P.graph) ? readJson(P.graph) : { nodes: [], edges: [] };
  const generated = generatedPages(roles);
  const order = manifest.pages.map((p) => p.path);
  const byPath = new Map(manifest.pages.map((p) => [p.path, p]));

  // Canonical pages in manifest order, then any source the manifest lacks.
  const pages = [];
  const seen = new Set();
  for (const path of [...order, ...srcPages.keys()]) {
    if (seen.has(path) || !srcPages.has(path)) continue;
    seen.add(path);
    const entry = srcPages.get(path);
    const html = assemble(entry);
    const s = sectionsOf(html);
    pages.push({ path, slug: slugOf(path), entry, html, manifest: byPath.get(path) || null, words: words(html), ...s });
  }

  // Ownership.
  const roleIds = roles ? roles.roles.map((r) => r.id) : [];
  const decisionOwner = new Map();
  for (const n of graph.nodes) if (n.kind === 'dr') {
    const o = roles ? (roles.decisions || {})[n.id] || (roles.layers || {})[(n.facets || {}).layer] : null;
    if (!o) fail('roles.json', 1, `decision ${n.id} has no owner: not in "decisions" and its layer "${(n.facets || {}).layer}" has no default`);
    else if (!roleIds.includes(o)) fail('roles.json', 1, `decision ${n.id} is given to "${o}", which is not a role`);
    decisionOwner.set(n.id, o || null);
  }
  const ownsPage = (path) => (roles ? roles.roles.filter((r) => (r.owns || []).includes(path)).map((r) => r.id) : []);
  const ownsSection = (path, id) => (roles ? roles.roles.filter((r) => (r.owns || []).includes(`${path}#${id}`)).map((r) => r.id) : []);
  const readsLocus = (path, id) => (roles ? roles.roles.filter((r) => (r.reads || []).includes(path) || (r.reads || []).includes(`${path}#${id}`)).map((r) => r.id) : []);
  for (const p of pages) {
    const pageOwners = ownsPage(p.path);
    const drm = /^dr-\d{3}$/.exec(p.slug);
    if (pageOwners.length > 1) fail('roles.json', 1, `${p.path} is owned by ${pageOwners.join(' and ')}; a page has one owner`);
    p.owner = pageOwners[0] || (drm ? decisionOwner.get(p.slug) || null : null);
    for (const s of p.sections) {
      const so = ownsSection(p.path, s.id);
      if (so.length > 1) fail('roles.json', 1, `${p.path}#${s.id} is owned by ${so.join(' and ')}; a section has one owner`);
      s.owner = so[0] || p.owner || null;
      s.readers = readsLocus(p.path, s.id).filter((r) => r !== s.owner);
      if (!s.owner) fail('roles.json', 1, `${p.path}#${s.id} has no owner`);
    }
  }
  for (const r of roles ? roles.roles : []) {
    for (const at of [...(r.owns || []), ...(r.reads || [])]) {
      const [path, anchor] = at.split('#');
      const p = pages.find((x) => x.path === path);
      if (!p) { fail('roles.json', 1, `${r.id}: "${at}" names no page under src/pages/`); continue; }
      if (anchor && !p.sections.some((s) => s.id === anchor)) fail('roles.json', 1, `${r.id}: "${at}" names no h2 section of ${path}`);
    }
  }

  // Open items, from Table 7.1.
  const p07 = pages.find((p) => p.path === '07-open/index.html');
  const opens = openItems(p07 ? p07.html : '', graph);
  for (const row of opens) {
    const mapped = roles ? mapOwnerCell(row.owner, roles.owner_text) : null;
    row.role = mapped ? mapped.owner : null;
    row.readers = mapped ? mapped.readers : [];
    if (!mapped) fail(`docs/07-open/index.html`, row.line, `Table 7.1 owner cell "${row.owner}" maps to no role in roles.json owner_text`);
    if (!row.node) fail(`docs/07-open/index.html`, row.line, `Table 7.1 row "${row.label.slice(0, 50)}" matches no open-* node`);
  }

  // Key blocks.
  const keys = new Map();
  for (const p of pages) for (const k of p.keys) {
    if (keys.has(k.key)) fail(`docs/${p.path}`, k.line, `key block "${k.key}" is marked twice (first at docs/${keys.get(k.key).page}:${keys.get(k.key).line})`);
    keys.set(k.key, { ...k, page: p.path, slug: p.slug });
    if (!k.section) fail(`docs/${p.path}`, k.line, `key block "${k.key}" sits before the first h2`);
    const expectedPrefix = `${p.slug}.${k.section}.`;
    if (k.section && !k.key.startsWith(expectedPrefix)) fail(`docs/${p.path}`, k.line, `key block "${k.key}" should be named ${expectedPrefix}<n>`);
  }

  return { root, P, roles, manifest, graph, generated, pages, decisionOwner, opens, keys, problems, roleIds };
}

// ---------------------------------------------------------------------------
// build and check of the canonical pages
// ---------------------------------------------------------------------------
function firstDifference(a, b) {
  const la = a.split('\n'), lb = b.split('\n');
  const n = Math.max(la.length, lb.length);
  for (let i = 0; i < n; i++) if (la[i] !== lb[i]) return i + 1;
  return 1;
}

export function build({ root = DEFAULT_ROOT } = {}) {
  const P = paths(root);
  const { pages, problems } = sources(root);
  if (problems.length) return { written: [], unchanged: [], problems };
  const written = [], unchanged = [];
  for (const [path, entry] of pages) {
    const target = join(P.docs, path);
    const content = assemble(entry);
    if (existsSync(target) && read(target) === content) { unchanged.push(path); continue; }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
    written.push(path);
  }
  return { written, unchanged, problems };
}

export function check({ root = DEFAULT_ROOT } = {}) {
  const P = paths(root);
  const out = [];
  const fail = (file, line, msg) => out.push({ file, line, msg });
  const { pages, problems } = sources(root);
  const generated = generatedPages(loadRoles(root));
  for (const p of problems) fail(p.file, p.line, p.msg);
  for (const [path, entry] of pages) {
    const target = join(P.docs, path);
    const src = `src/pages/${entry.kind === 'file' ? path : path.replace(/\.html$/, '/')}`;
    if (!existsSync(target)) { fail(`docs/${path}`, 1, `page is missing; run node tools/build.mjs (source ${src})`); continue; }
    const expected = assemble(entry);
    const actual = read(target);
    if (actual !== expected) fail(`docs/${path}`, firstDifference(actual, expected), `differs from its source ${src}; edit the source and run node tools/build.mjs`);
  }
  if (existsSync(P.docs)) {
    for (const f of walk(P.docs)) {
      if (!f.endsWith('.html')) continue;
      const path = rel(P.docs, f);
      if (FOREIGN.includes(path) || generated.includes(path) || pages.has(path)) continue;
      fail(`docs/${path}`, 1, `page has no source under src/pages/ and is not a generated page; add src/pages/${path} or remove it`);
    }
  }
  if (existsSync(P.manifest)) {
    let man = null;
    try { man = JSON.parse(read(P.manifest)); } catch { /* the harness reports a broken manifest */ }
    for (const e of (man && man.pages) || []) {
      if (!e.path || FOREIGN.includes(e.path) || generated.includes(e.path) || pages.has(e.path)) continue;
      fail('manifest.json', 1, `${e.path} is listed but has no source under src/pages/`);
    }
  }
  out.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return out;
}

// ---------------------------------------------------------------------------
// Reports for the command line
// ---------------------------------------------------------------------------
function ownersReport(M) {
  const L = [];
  L.push('| Page | Section | Words | Owner | Readers |');
  L.push('|------|---------|------:|-------|---------|');
  for (const p of M.pages) for (const s of p.sections) L.push(`| \`${p.path}\` | \`${s.id}\` ${s.title} | ${s.words} | ${s.owner || 'NONE'} | ${s.readers.join(', ')} |`);
  L.push('');
  L.push('| Decision | Owner |');
  L.push('|----------|-------|');
  for (const [id, o] of M.decisionOwner) L.push(`| ${id} | ${o || 'NONE'} |`);
  L.push('');
  L.push('| Open item | Owner cell | Owner | Readers |');
  L.push('|-----------|------------|-------|---------|');
  for (const r of M.opens) L.push(`| ${r.node ? r.node.id : '?'} ${r.label.slice(0, 60)} | ${r.owner} | ${r.role || 'NONE'} | ${r.readers.join(', ')} |`);
  const count = {};
  for (const p of M.pages) for (const s of p.sections) count[s.owner || 'NONE'] = (count[s.owner || 'NONE'] || 0) + 1;
  L.push('');
  L.push(`sections: ${M.pages.reduce((n, p) => n + p.sections.length, 0)} across ${M.pages.length} pages; by owner: ${Object.entries(count).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  return L.join('\n');
}

function keysReport(M) {
  const L = [];
  for (const [key, k] of M.keys) L.push(`- \`${key}\` (docs/${k.page}:${k.line}, <${k.tag}>): ${textOf(k.html)}`);
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------
function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log([
      'node tools/build.mjs            write docs/ from src/pages/, then the generated views, the manifest sections and CODEOWNERS',
      'node tools/build.mjs --check    exit 1 if any page under docs/ or any generated file differs from what a build would write',
      'node tools/build.mjs --owners   print the ownership table from roles.json (every section, decision and open item)',
      'node tools/build.mjs --keys     print every key block with its text',
    ].join('\n'));
    return;
  }
  if (argv.includes('--owners') || argv.includes('--keys')) {
    const M = model();
    for (const p of M.problems) console.log(`${p.file}:${p.line}: ${p.msg}`);
    console.log(argv.includes('--owners') ? ownersReport(M) : keysReport(M));
    if (M.problems.length) { console.log(`\n${M.problems.length} problem(s).`); process.exit(1); }
    return;
  }
  if (argv.includes('--check')) {
    const failures = check({});
    for (const f of failures) console.log(`${f.file}:${f.line}: ${f.msg}`);
    if (failures.length) { console.log(`\n${failures.length} failure(s).`); process.exit(1); }
    console.log(`build --check: clean. ${sources().pages.size} pages.`);
    return;
  }
  const r = build({});
  if (r.problems.length) {
    for (const p of r.problems) console.log(`${p.file}:${p.line}: ${p.msg}`);
    console.log(`\n${r.problems.length} problem(s); nothing written.`);
    process.exit(1);
  }
  console.log(`build: ${r.written.length} page(s) written, ${r.unchanged.length} unchanged.`);
  for (const p of r.written) console.log(`  docs/${p}`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
