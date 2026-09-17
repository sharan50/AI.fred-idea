#!/usr/bin/env node
// One-off splitter (REBUILD_BRIEF.md section 2.1): produces src/pages/ from docs/ and is deleted once the
// Phase A gate passes. A page under 3,000 words of prose is copied verbatim; a page of 3,000 or over is cut
// at line boundaries into 000-head.html, one NNN-<h2 id>.html per top-level <section> carrying an <h2>, and
// 999-foot.html, so that the fragments concatenate back to the page byte for byte.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { words } from './build.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const SRC = join(ROOT, 'src', 'pages');
const THRESHOLD = 3000;

const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));
const pages = manifest.pages.map((p) => p.path).filter((p) => !p.startsWith('depmap/'));

if (existsSync(SRC)) rmSync(SRC, { recursive: true });
mkdirSync(SRC, { recursive: true });

const report = [];
for (const path of pages) {
  const file = join(DOCS, path);
  const html = readFileSync(file, 'utf8');
  const total = words(html);
  if (total < THRESHOLD) {
    const target = join(SRC, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
    report.push({ path, words: total, fragments: null });
    continue;
  }
  const lines = html.split('\n');
  const starts = [], ends = [];
  let depth = 0;
  lines.forEach((line, i) => {
    const opens = (line.match(/<section\b/g) || []).length;
    const closes = (line.match(/<\/section>/g) || []).length;
    if (!opens && !closes) return;
    if (opens + closes > 1 || (opens && !/^\s*<section\b[^>]*>\s*$/.test(line)) || (closes && !/^\s*<\/section>\s*$/.test(line))) {
      throw new Error(`${path}:${i + 1} section tag does not sit alone on its line`);
    }
    if (opens) { if (depth === 0) starts.push(i); depth++; }
    if (closes) { depth--; if (depth === 0) ends.push(i); if (depth < 0) throw new Error(`${path}:${i + 1} stray </section>`); }
  });
  if (depth !== 0 || starts.length !== ends.length) throw new Error(`${path}: unbalanced sections`);
  const sections = starts.map((s, k) => ({ start: s, end: ends[k] }));
  for (const s of sections) {
    const m = lines.slice(s.start, s.end + 1).join('\n').match(/<h2\b[^>]*\bid="([^"]+)"/);
    if (!m) throw new Error(`${path}:${s.start + 1} top-level section carries no <h2 id>`);
    s.id = m[1];
  }
  const dir = join(SRC, path.replace(/\.html$/, ''));
  mkdirSync(dir, { recursive: true });
  const frags = [];
  frags.push(['000-head.html', lines.slice(0, sections[0].start).join('\n') + '\n']);
  sections.forEach((s, k) => {
    const last = k === sections.length - 1;
    const stop = last ? s.end + 1 : sections[k + 1].start;
    frags.push([`${String(k + 1).padStart(3, '0')}-${s.id}.html`, lines.slice(s.start, stop).join('\n') + '\n']);
  });
  frags.push(['999-foot.html', lines.slice(sections[sections.length - 1].end + 1).join('\n')]);
  const names = new Set();
  for (const [name, content] of frags) {
    if (names.has(name)) throw new Error(`${path}: duplicate fragment name ${name}`);
    names.add(name);
    writeFileSync(join(dir, name), content);
  }
  const back = frags.map(([, c]) => c).join('');
  if (back !== html) throw new Error(`${path}: fragments do not reassemble byte for byte`);
  report.push({ path, words: total, fragments: frags.map(([name, content]) => ({ name, words: words(content) })) });
}

console.log('| Page | Words before | Fragments (words) |');
console.log('|------|-------------:|-------------------|');
for (const r of report) {
  if (!r.fragments) { console.log(`| \`${r.path}\` | ${r.words} | copied verbatim |`); continue; }
  const over = r.fragments.filter((f) => f.words >= THRESHOLD);
  console.log(`| \`${r.path}\` | ${r.words} | ${r.fragments.map((f) => `${f.name} ${f.words}${f.words >= THRESHOLD ? ' (over)' : ''}`).join('; ')} |`);
  if (over.length) console.error(`over ${THRESHOLD}: ${r.path}: ${over.map((f) => `${f.name} (${f.words})`).join(', ')}`);
}
