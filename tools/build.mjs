#!/usr/bin/env node
// AI.fred page build. Node 18 or later, no dependencies (DR-028).
// Assembles docs/ from src/pages/ by verbatim copy or verbatim concatenation: a page under 3,000 words of
// prose is one file at src/pages/<path>; a longer page is a directory src/pages/<path minus .html>/ of
// fragments, 000-head.html, one NNN-<h2 id>.html per top-level section, 999-foot.html, concatenated in
// filename order. No templating, no transformation, no whitespace rewriting. Deterministic.
// `check()` is exported for tools/verify.mjs section 9; every failure is { file, line, msg } with a
// repo-relative file. Importing this module has no side effects; the command line runs only when the
// file is executed directly.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..');

// Pages under docs/ that another tool writes and holds fresh: never a source here, never checked here.
const FOREIGN = ['depmap/index.html', 'depmap/architecture.html']; // node tools/depmap.mjs view --site (DR-017)
// Pages this build generates itself, with no source under src/pages/. Empty in this edition.
export const GENERATED = [];

const FRAGMENT_RE = /^\d{3}-[a-z0-9-]+\.html$/;

// ---------------------------------------------------------------------------
// Text: the prose word count the split threshold and the manifest use
// ---------------------------------------------------------------------------
export function prose(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'").replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ').replace(/&[a-z]+;/gi, ' ');
}
export function words(html) {
  const t = prose(html).trim();
  return t ? t.split(/\s+/).length : 0;
}

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

function paths(root) {
  return { root, docs: join(root, 'docs'), src: join(root, 'src', 'pages'), manifest: join(root, 'manifest.json') };
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

// ---------------------------------------------------------------------------
// build and check
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
      if (FOREIGN.includes(path) || GENERATED.includes(path) || pages.has(path)) continue;
      fail(`docs/${path}`, 1, `page has no source under src/pages/ and is not a generated page; add src/pages/${path} or remove it`);
    }
  }
  if (existsSync(P.manifest)) {
    let man = null;
    try { man = JSON.parse(read(P.manifest)); } catch { /* the harness reports a broken manifest */ }
    for (const e of (man && man.pages) || []) {
      if (!e.path || FOREIGN.includes(e.path) || GENERATED.includes(e.path) || pages.has(e.path)) continue;
      fail('manifest.json', 1, `${e.path} is listed but has no source under src/pages/`);
    }
  }
  out.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return out;
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------
function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log('node tools/build.mjs           write docs/ from src/pages/\nnode tools/build.mjs --check   exit 1 if any page under docs/ differs from what a build would write');
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
