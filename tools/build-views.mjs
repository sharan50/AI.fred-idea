// AI.fred generated views (DR-029). Node 18 or later, no dependencies. Imported by tools/build.mjs; never run alone.
// Renders the front door, the doors index, one page per role and the record door from src/templates/ and the model
// that build.mjs computes from roles.json, manifest.json, tools/depmap/graph.json and the canonical pages; writes the
// sections list of every manifest entry and .github/CODEOWNERS. Every list here is generated; every fact is a
// key block transcluded verbatim, with its links rebased to the view's directory and its ids dropped.

import { readFileSync, existsSync } from 'node:fs';
import { join, posix, basename } from 'node:path';

const read = (f) => readFileSync(f, 'utf8');
const REPO_OWNER = 'sharan50';
const CAPS = { 'index.html': 150 };
const FRAME_CAP = 200;
const FRONT_DOOR_CAP = 1500;
const STATUS_ORDER = ['amber', 'to-verify', 'assumption', 'decision'];

// ---------------------------------------------------------------------------
// The rail: the Doors group, then the publication list without 08-review
// ---------------------------------------------------------------------------
const PUBLICATION = [
  ['', 'i', 'Index'], ['00-thesis/', '00', 'Thesis'], ['01-product/', '01', 'Product'], ['02-architecture/', '02', 'Architecture'],
  ['03-trust-and-data/', '03', 'Trust and data'], ['04-operations/', '04', 'Operations'], ['05-business/', '05', 'Business'],
  ['06-roadmap/', '06', 'Roadmap'], ['07-open/', '07', 'Open items'], ['decisions/', 'DR', 'Decisions'],
  ['depmap/', 'map', 'Dependency map'], ['depmap/architecture.html', 'map', 'Architecture map'],
];
export function doors(roles) {
  return [
    { href: '', n: 's', text: 'Summary' },
    ...roles.roles.map((r) => ({ href: `roles/${r.id}/`, n: r.id, text: r.title })),
    { href: 'contents/', n: 'c', text: 'Contents' },
    { href: 'record/', n: 'r', text: 'Record' },
  ];
}
export function renderDoorsGroup(base, roles) {
  const li = (href, n, text) => `          <li><a href="${base}${href}"><span class="n">${n}</span>${text}</a></li>`;
  return ['        <p class="rail-title">Doors</p>', '        <ol>', ...doors(roles).map((d) => li(d.href, d.n, d.text)), '        </ol>'].join('\n');
}
export function renderRail(base, roles) {
  const li = (href, n, text) => `          <li><a href="${base}${href}"><span class="n">${n}</span>${text}</a></li>`;
  return [
    '      <nav class="site-nav" id="publication" aria-label="In this publication">',
    renderDoorsGroup(base, roles),
    '        <p class="rail-title">In this publication</p>',
    '        <ol>',
    ...PUBLICATION.map(([h, n, t]) => li(h, n, t)),
    '        </ol>',
    '      </nav>',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Text helpers shared with build.mjs (passed in through the model)
// ---------------------------------------------------------------------------
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n) => n.toLocaleString('en-GB');
const firstSentence = (s) => (s.match(/^[\s\S]*?[.!?](?=\s|$)/) || [s])[0].trim();
const dirOf = (path) => { const d = posix.dirname(path); return d === '.' ? '' : d; };
export const baseOf = (path) => { const depth = path.split('/').length - 1; return depth ? '../'.repeat(depth) : './'; };

// A link from one page to another, in the directory form the harness's reachability rule reads.
function linkTo(fromPath, toPath, anchor) {
  const target = toPath.endsWith('/index.html') ? toPath.replace(/index\.html$/, '') : toPath;
  let r = posix.relative(dirOf(fromPath), target);
  if (target.endsWith('/') && !r.endsWith('/')) r += '/';
  if (r === '' ) r = './';
  return r + (anchor ? `#${anchor}` : '');
}

// The transclusion of a key block into a view: links rebased to the view's directory, ids dropped, nothing else.
export function rebase(html, fromPath, toPath) {
  return html.replace(/\b(href|src|xlink:href)="([^"]*)"/g, (m, attr, url) => {
    if (/^(https?:|mailto:|tel:|data:|\/)/i.test(url)) return m;
    let abs;
    if (url.startsWith('#')) abs = fromPath + url;
    else abs = posix.normalize(posix.join(dirOf(fromPath), url));
    const [p, frag] = abs.split('#');
    let r = posix.relative(dirOf(toPath), p);
    if (p.endsWith('/') && !r.endsWith('/')) r += '/';
    if (r === '') r = './';
    return `${attr}="${r}${frag ? '#' + frag : ''}"`;
  }).replace(/\s+id="[^"]*"/g, '');
}
export function transclude(M, key, toPath) {
  const k = M.keys.get(key);
  if (!k) return null;
  const page = M.pages.find((p) => p.path === k.page);
  const section = page.sections.find((s) => s.id === k.section);
  const label = `${page.manifest ? page.manifest.title : page.path}, ${section.no ? section.no + ' ' : ''}${section.title}`;
  const block = rebase(k.html, k.page, toPath);
  const html = `        <div class="callout" data-key-of="${key}">\n          <p class="label"><a href="${linkTo(toPath, k.page, k.section)}">${escape(label)}</a></p>\n          ${block}\n        </div>`;
  return { html, block, label };
}

// The page status implied by the inline chips of a document column, by the design plan's precedence.
export function statusOf(html) {
  const found = new Set();
  for (const m of html.matchAll(/<(\w+)\s+class="chip chip-([a-z-]+)"([^>]*)>/g)) if (!/\bdata-example\b/.test(m[3])) found.add(m[2]);
  return STATUS_ORDER.find((s) => found.has(s)) || 'decision';
}

// ---------------------------------------------------------------------------
// Ownership queries
// ---------------------------------------------------------------------------
function ownedSections(M, role) {
  const out = [];
  for (const p of M.pages) for (const s of p.sections) if (s.owner === role) out.push({ page: p, section: s });
  return out;
}
function readSections(M, r) {
  const wanted = new Set();
  for (const at of r.reads || []) {
    const [path, anchor] = at.split('#');
    const p = M.pages.find((x) => x.path === path);
    if (!p) continue;
    for (const s of p.sections) if ((!anchor || s.id === anchor) && s.owner !== r.id) wanted.add(`${path}#${s.id}`);
  }
  const out = [];
  for (const p of M.pages) for (const s of p.sections) if (wanted.has(`${p.path}#${s.id}`)) out.push({ page: p, section: s });
  return out;
}
// The h2 section of a page that holds an anchor (an h2, an h3 inside it, a figure, a table wrapper).
function sectionOfLocus(M, at) {
  const [path, rest] = at.split('#');
  const p = M.pages.find((x) => x.path === path);
  if (!p) return null;
  const anchor = rest ? rest.replace(/!.*$/, '') : null;
  if (!anchor || anchor.startsWith('table:')) return null;
  const h2 = p.anchors.get(anchor) || null;
  return h2 ? { page: p, section: p.sections.find((s) => s.id === h2) } : null;
}
function decisionTitle(M, id) {
  const e = M.manifest.pages.find((p) => new RegExp(`^decisions/${id}-`).test(p.path));
  return e ? { title: e.title, path: e.path } : { title: id.toUpperCase(), path: null };
}
export function readingPath(M, r) {
  const owned = ownedSections(M, r.id);
  const reads = readSections(M, r);
  let cum = 0;
  return [...owned.map((x) => ({ ...x, kind: 'owned' })), ...reads.map((x) => ({ ...x, kind: 'read' }))].map((x) => { cum += x.section.words; return { ...x, cumulative: cum }; });
}

// ---------------------------------------------------------------------------
// The generated pages
// ---------------------------------------------------------------------------
export function generatedEntries(M) {
  const R = M.roles;
  return [
    { path: 'index.html', title: 'AI.fred', section: 'index', template: 'summary.html', summary: 'The front door: what is decided, where the record stands, the numbers that matter, what is not known, five owner doors and the full contents. Generated from roles.json, the manifest and the map; edit those, never this page.' },
    { path: 'roles/index.html', title: 'Doors', section: 'roles', template: 'roles.html', summary: 'Five owner doors, one per role, each a page generated from roles.json: what the owner holds, what binds them, their reading path and their key blocks.' },
    ...R.roles.map((r) => ({ path: `roles/${r.id}/index.html`, title: r.title, section: 'roles', template: 'role.html', role: r, summary: `The owner view for the ${r.title.toLowerCase()}: the sections, decisions, open items, components and invariants they own, the decisions of others that bind them, their reading path with its running word count, and the key blocks of their sections. Generated from roles.json; edit that file or the fragments, never this page.` })),
    { path: 'record/index.html', title: 'Record', section: 'record', template: 'record.html', summary: 'The build record door: the independent review, the decision ledger, the two maps, and where the surfacing report and the batches live in the repository.' },
  ];
}

function ledgerCounts(M) {
  const p = M.pages.find((x) => x.path === 'decisions/index.html');
  if (!p) return { records: 0, amber: 0 };
  const t = /<table class="data">\s*<caption><span class="tab-no">Table D\.2<\/span>[\s\S]*?<\/table>/.exec(p.html);
  const rows = t ? [...t[0].matchAll(/<tr><td class="mono"><a href="dr-[\s\S]*?<\/tr>/g)] : [];
  return { records: rows.length, amber: rows.filter((r) => /chip-amber/.test(r[0])).length };
}

export function renderAll(M) {
  const files = new Map();
  const problems = [];
  const fail = (file, line, msg) => problems.push({ file, line, msg });
  const R = M.roles;
  if (!R) { fail('roles.json', 1, 'roles.json is missing; the views cannot be generated'); return { files, problems, entries: [] }; }
  const gen = generatedEntries(M);
  const genPaths = new Set(gen.map((g) => g.path));
  const date = M.pages.map((p) => (p.manifest || {}).updated).filter(Boolean).sort().pop() || R.updated;
  const tpl = (name) => { const f = join(M.P.templates, name); if (!existsSync(f)) { fail(`src/templates/${name}`, 1, 'template is missing'); return ''; } return read(f); };
  const fill = (t, vars) => t.replace(/\{\{([a-z-]+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
  const roleTitle = (id) => (R.roles.find((r) => r.id === id) || { title: id }).title;
  const handle = (r) => `@${r.github || REPO_OWNER}`;

  // The manifest's page list: the front door, the canonical pages in their order, the other views.
  const canonicalEntries = M.manifest.pages.filter((e) => !genPaths.has(e.path));
  const ordered = [gen[0], ...canonicalEntries, ...gen.slice(1)];
  const titleOf = (path) => (ordered.find((e) => e.path === path) || {}).title || path;

  // Shared pieces.
  const openLink = (from, row) => `<a href="${linkTo(from, '07-open/index.html', row.id || 'items')}">${escape(row.node ? row.node.label : row.label)}</a>`;
  const drLink = (from, id) => { const d = decisionTitle(M, id); return d.path ? `<a href="${linkTo(from, d.path)}">${escape(d.title)}</a>` : escape(d.title); };
  const sectionLink = (from, page, s) => `<a href="${linkTo(from, page.path, s.id)}">${escape((page.manifest || {}).title || page.path)}, ${s.no ? escape(s.no) + ' ' : ''}${escape(s.title)}</a>`;

  // --- the front door ---
  {
    const path = 'index.html', base = './';
    const decided = ['        <ol data-generated="decisions">', ...(R.summary.decisions || []).map((id) => `          <li>${drLink(path, id)}</li>`), '        </ol>'].join('\n');
    for (const id of R.summary.decisions || []) if (!M.decisionOwner.has(id)) fail('roles.json', 1, `summary.decisions names ${id}, which is not a decision in the map`);
    const lc = ledgerCounts(M);
    const counts = [
      ['Pages', canonicalEntries.length], ['Sections', M.pages.reduce((n, p) => n + p.sections.length, 0)], ['Words of prose', M.pages.reduce((n, p) => n + p.words, 0)],
      ['Decision records', lc.records], ['Of which amber', lc.amber],
      ['Open items', M.opens.length], ['Of which amber', M.opens.filter((r) => r.status === 'amber').length], ['Of which to verify', M.opens.filter((r) => r.status === 'to-verify').length], ['Of which assumptions', M.opens.filter((r) => r.status === 'assumption').length],
    ];
    const standing = ['        <dl class="def" data-generated="counts">', ...counts.map(([k, v]) => `          <dt>${k}</dt>\n          <dd data-count="${k.toLowerCase().replace(/[^a-z]+/g, '-')}">${fmt(v)}</dd>`), '        </dl>'].join('\n');
    const numbers = (R.summary.keys || []).map((key) => { const t = transclude(M, key, path); if (!t) fail('roles.json', 1, `summary.keys names "${key}", which no fragment marks with data-key`); return t ? t.html : ''; }).filter(Boolean).join('\n') || '        <p>None chosen.</p>';
    const unknownRows = (R.summary.unknowns || []).map((label) => { const row = M.opens.find((r) => r.node && r.node.label === label); if (!row) fail('roles.json', 1, `summary.unknowns names "${label}", which is no open item's label in the map`); return row; }).filter(Boolean);
    const unknowns = ['        <ul data-generated="unknowns">', ...unknownRows.map((row) => `          <li>${openLink(path, row)}. Trigger: ${escape(row.trigger)}</li>`), '        </ul>'].join('\n');
    const doorsList = ['        <ul data-generated="doors">', ...R.roles.map((r) => { const rp = readingPath(M, r); const total = rp.length ? rp[rp.length - 1].cumulative : 0; return `          <li><a href="${linkTo(path, `roles/${r.id}/index.html`)}">${escape(r.title)}</a>. ${escape(firstSentence(r.frame))} Reading path: ${fmt(total)} words.</li>`; }), '        </ul>'].join('\n');
    const contents = ['        <ol data-generated="contents">', ...ordered.map((e) => { const m = /^decisions\/(dr-\d{3})-/.exec(e.path); const text = m ? m[1].toUpperCase() : e.title; return `          <li><a href="${linkTo(path, e.path)}">${escape(text)}</a></li>`; }), '        </ol>'].join('\n');
    let page = fill(tpl('summary.html'), { base, date, rail: renderRail(base, R), decided, standing, numbers, unknowns, doors: doorsList, contents });
    const status = statusOf(page.slice(page.indexOf('<div class="doc">')));
    page = fill(page, { status });
    files.set(path, page);
    gen[0].status = status;
  }

  // --- the doors index ---
  {
    const path = 'roles/index.html', base = '../';
    const list = ['        <ul data-generated="doors">', ...R.roles.map((r) => { const rp = readingPath(M, r); const total = rp.length ? rp[rp.length - 1].cumulative : 0; return `          <li><a href="${linkTo(path, `roles/${r.id}/index.html`)}">${escape(r.title)}</a>. ${escape(firstSentence(r.frame))} Reading path: ${fmt(total)} words.</li>`; }), '        </ul>'].join('\n');
    let page = fill(tpl('roles.html'), { base, date, rail: renderRail(base, R), doors: list });
    const status = statusOf(page.slice(page.indexOf('<div class="doc">')));
    page = fill(page, { status });
    files.set(path, page);
    gen[1].status = status;
  }

  // --- one page per role ---
  for (const r of R.roles) {
    const entry = gen.find((g) => g.role === r);
    const path = entry.path, base = '../../';
    const owned = ownedSections(M, r.id);
    const frame = r.frame.split(/\n\s*\n/).map((para) => `        <p data-frame>${escape(para.trim())}</p>`).join('\n');
    const table = (no, caption, head, rows) => ['        <div class="table-wrap">', `          <table class="data">`, `            <caption><span class="tab-no">Table ${r.id}.${no}</span> ${caption}</caption>`, `            <thead><tr>${head.map((h) => `<th${/Words|Running/.test(h) ? ' class="num"' : ''}>${h}</th>`).join('')}</tr></thead>`, '            <tbody>', ...rows.map((cells) => `            <tr>${cells.map((c) => `<td${/^[\d,]+$/.test(String(c)) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`), '            </tbody>', '          </table>', '        </div>'].join('\n');
    const ownSections = owned.length ? table(1, 'The sections this role owns, in publication order, with their prose word counts.', ['Page', 'Section', 'Words'], owned.map((x) => [escape((x.page.manifest || {}).title || x.page.path), `<a href="${linkTo(path, x.page.path, x.section.id)}">${x.section.no ? escape(x.section.no) + ' ' : ''}${escape(x.section.title)}</a>`, fmt(x.section.words)])) : '        <p>None.</p>';
    const decisions = [...M.decisionOwner.entries()].filter(([, o]) => o === r.id).map(([id]) => id);
    const ownDecisions = decisions.length ? ['        <ul>', ...decisions.map((id) => `          <li>${drLink(path, id)}</li>`), '        </ul>'].join('\n') : '        <p>None.</p>';
    const openRows = M.opens.filter((row) => row.role === r.id);
    const readRows = M.opens.filter((row) => row.readers.includes(r.id));
    const ownOpen = (openRows.length ? ['        <ul>', ...openRows.map((row) => `          <li>${openLink(path, row)}. Trigger: ${escape(row.trigger)}</li>`), '        </ul>'].join('\n') : '        <p>None.</p>') + (readRows.length ? `\n        <p>Read, with another role as owner: ${readRows.map((row) => openLink(path, row)).join('; ')}.</p>` : '');
    const layerRoles = R.layers || {};
    const comps = M.graph.nodes.filter((n) => (n.kind === 'comp' || n.kind === 'inv')).map((n) => {
      const canon = (n.loci || []).find((l) => l.role === 'canonical');
      const at = canon ? canon.at : null;
      const where = at ? sectionOfLocus(M, at) : null;
      const byLayer = layerRoles[(n.facets || {}).layer] === r.id;
      const byLocus = where && where.section && where.section.owner === r.id;
      return byLayer || byLocus ? { n, at, where } : null;
    }).filter(Boolean);
    const ownComponents = comps.length ? ['        <ul>', ...comps.map(({ n, at, where }) => { const [lp, la] = (at || '').split('#'); const anchor = la ? la.replace(/!.*$/, '') : null; const link = at && M.pages.some((p) => p.path === lp) && anchor && !anchor.startsWith('table:') ? `<a href="${linkTo(path, lp, anchor)}">${where && where.section ? escape(((where.page.manifest || {}).title || lp) + ', ' + (where.section.no ? where.section.no + ' ' : '') + where.section.title) : escape(at)}</a>` : escape(at || 'no locus'); return `          <li><code>${n.id}</code> ${escape(n.label)}: ${link}</li>`; }), '        </ul>'].join('\n') : '        <p>None.</p>';
    // Decisions owned by others that reach an owned section within one hop.
    const ownedKeys = new Set(owned.map((x) => `${x.page.path}#${x.section.id}`));
    const touches = (node) => (node.loci || []).some((l) => { const w = sectionOfLocus(M, l.at); return w && w.section && ownedKeys.has(`${w.page.path}#${w.section.id}`); });
    const nodesById = new Map(M.graph.nodes.map((n) => [n.id, n]));
    const binds = M.graph.nodes.filter((n) => n.kind === 'dr' && M.decisionOwner.get(n.id) !== r.id).filter((d) => {
      if (touches(d)) return true;
      return M.graph.edges.some(([a, , c]) => { const other = a === d.id ? nodesById.get(c) : c === d.id ? nodesById.get(a) : null; return other && other.kind !== 'alt' && touches(other); });
    });
    const bindsHtml = binds.length ? ['        <ul>', ...binds.map((d) => `          <li>${drLink(path, d.id)}, held by the ${escape(roleTitle(M.decisionOwner.get(d.id)).toLowerCase())}</li>`), '        </ul>'].join('\n') : '        <p>None.</p>';
    const rp = readingPath(M, r);
    const pathHtml = rp.length ? table(2, 'Owned sections in publication order, then the sections this role reads, with the running word count.', ['Order', 'Section', 'Words', 'Running total'], rp.map((x, i) => [String(i + 1), `${sectionLink(path, x.page, x.section)}${x.kind === 'read' ? ' (read)' : ''}`, fmt(x.section.words), fmt(x.cumulative)])) : '        <p>None.</p>';
    const keysHtml = owned.flatMap((x) => [...M.keys.values()].filter((k) => k.page === x.page.path && k.section === x.section.id).map((k) => transclude(M, k.key, path).html)).join('\n') || '        <p>None marked yet.</p>';
    let page = fill(tpl('role.html'), { base, date, rail: renderRail(base, R), title: escape(r.title), docid: r.id, description: escape(entry.summary), standfirst: escape(firstSentence(r.frame)), reader: escape(r.title.toLowerCase()), frame, 'own-sections': ownSections, 'own-decisions': ownDecisions, 'own-open': ownOpen, 'own-components': ownComponents, binds: bindsHtml, path: pathHtml, keys: keysHtml });
    const status = statusOf(page.slice(page.indexOf('<div class="doc">')));
    page = fill(page, { status });
    files.set(path, page);
    entry.status = status;
  }

  // --- the record door ---
  {
    const path = 'record/index.html', base = '../';
    let page = fill(tpl('record.html'), { base, date, rail: renderRail(base, R) });
    const status = statusOf(page.slice(page.indexOf('<div class="doc">')));
    page = fill(page, { status });
    files.set(path, page);
    gen[gen.length - 1].status = status;
  }

  // --- the manifest ---
  const man = JSON.parse(JSON.stringify(M.manifest));
  man.updated = date;
  const sectionsOfGenerated = (html) => M.sectionsOf(html).sections.map((s) => ({ id: s.id, title: s.title, words: s.words, owner: null, readers: [] }));
  const pagesOut = ordered.map((e) => {
    if (genPaths.has(e.path)) {
      const html = files.get(e.path);
      return { path: e.path, title: e.title, section: e.section, status: e.status, summary: e.summary, updated: date, words: M.words(html), sections: sectionsOfGenerated(html) };
    }
    const p = M.pages.find((x) => x.path === e.path);
    const out = { ...e };
    delete out.words; delete out.sections;
    if (p) { out.words = p.words; out.sections = p.sections.map((s) => ({ id: s.id, title: s.title, words: s.words, owner: s.owner, readers: s.readers })); }
    return out;
  });
  const keys = [];
  for (const e of pagesOut) if (!keys.includes(e.section)) keys.push(e.section);
  man.sections = keys.map((key) => ({ key, pages: pagesOut.filter((e) => e.section === key).length }));
  man.pages = pagesOut;
  files.set('manifest.json', JSON.stringify(man, null, 2) + '\n');

  // --- CODEOWNERS ---
  const lines = ['# Generated by node tools/build.mjs from roles.json (DR-029). Edit roles.json, never this file.', '# Page-level lines first, then section-level lines, so the more specific line wins.'];
  const srcPath = (p) => (p.entry.kind === 'fragments' ? `/src/pages/${p.path.replace(/\.html$/, '/')}` : `/src/pages/${p.path}`);
  const pageLines = [], sectionLines = [];
  for (const p of M.pages) {
    const owner = R.roles.find((x) => x.id === p.owner);
    if (owner) pageLines.push(`${srcPath(p)} ${handle(owner)}`);
    for (const s of p.sections) {
      if (!s.owner || s.owner === p.owner) continue;
      const so = R.roles.find((x) => x.id === s.owner);
      if (!so) continue;
      if (p.entry.kind === 'fragments') {
        const frag = p.entry.files.find((f) => basename(f).endsWith(`-${s.id}.html`));
        if (frag) sectionLines.push(`${srcPath(p)}${basename(frag)} ${handle(so)}`);
        else sectionLines.push(`# ${p.path}#${s.id} is owned by ${s.owner} inside ${srcPath(p)} and has no fragment of its own`);
      } else sectionLines.push(`# ${p.path}#${s.id} is owned by ${s.owner} inside the single file ${srcPath(p)}`);
    }
  }
  files.set('.github/CODEOWNERS', [...lines, ...pageLines, ...sectionLines].join('\n') + '\n');

  return { files, problems, entries: gen, date };
}

// ---------------------------------------------------------------------------
// The checks of section 10
// ---------------------------------------------------------------------------
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
const lineOf = (text, index) => text.slice(0, Math.max(0, index)).split('\n').length;

// Text with a digit inside the document column that no key block, generated list or numbering span covers.
function strayDigits(html) {
  const doc = html.indexOf('<div class="doc">');
  if (doc < 0) return [];
  const el = elementAt(html, doc);
  const body = el ? el.html : html.slice(doc);
  const out = [];
  const stack = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)/g;
  let m;
  const VOID = new Set(['br', 'img', 'hr', 'meta', 'link', 'input']);
  while ((m = re.exec(body))) {
    if (m[3] !== undefined) {
      if (/\d/.test(m[3]) && !stack.some((f) => f.safe)) out.push({ line: lineOf(html, doc + m.index), text: m[3].trim().slice(0, 80) });
      continue;
    }
    const closing = m[0].startsWith('</');
    if (closing) { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === m[1]) { stack.length = i; break; } continue; }
    if (VOID.has(m[1]) || m[0].endsWith('/>')) continue;
    const attrs = m[2] || '';
    const safe = /\bdata-(generated|count|key-of)\b/.test(attrs) || /class="(no|tab-no|fig-no)"/.test(attrs);
    stack.push({ tag: m[1], safe });
  }
  return out;
}

export function checkViews(M) {
  const out = [];
  const fail = (file, line, msg) => out.push({ file, line, msg });
  for (const p of M.problems) fail(p.file, p.line, p.msg);
  if (!M.roles) return out;
  const R = M.roles;
  const { files, problems } = renderAll(M);
  for (const p of problems) fail(p.file, p.line, p.msg);
  for (const r of R.roles) {
    const n = M.words(r.frame);
    if (n > FRAME_CAP) fail('roles.json', 1, `the frame of ${r.id} is ${n} words; the cap is ${FRAME_CAP}`);
  }
  for (const [path, expected] of files) {
    if (!path.endsWith('.html')) continue;
    const file = join(M.P.docs, path);
    if (!existsSync(file)) { fail(`docs/${path}`, 1, 'generated page is missing; run node tools/build.mjs'); continue; }
    const html = read(file);
    // Transclusions are verbatim.
    for (const m of html.matchAll(/<div class="callout" data-key-of="([^"]+)">/g)) {
      const key = m[1];
      const k = M.keys.get(key);
      const line = lineOf(html, m.index);
      if (!k) { fail(`docs/${path}`, line, `transcludes key block "${key}", which no fragment marks with data-key`); continue; }
      const el = elementAt(html, m.index);
      const inner = el ? el.html.slice(m[0].length, el.html.length - '</div>'.length).replace(/^\s*<p class="label">[\s\S]*?<\/p>\s*/, '').trim() : '';
      const t = transclude(M, key, path);
      if (inner !== t.block) fail(`docs/${path}`, line, `transclusion of "${key}" is not verbatim; run node tools/build.mjs`);
    }
    // Frames hold their caps.
    let frameWords = 0;
    for (const m of html.matchAll(/<(\w+)\b[^>]*\sdata-frame\b[^>]*>/g)) { const el = elementAt(html, m.index); if (el) frameWords += M.words(el.html); }
    const cap = CAPS[path] || FRAME_CAP;
    if (frameWords > cap) fail(`docs/${path}`, 1, `the frame is ${frameWords} words; the cap is ${cap}`);
    if (path === 'index.html') {
      const n = M.words(html);
      if (n > FRONT_DOOR_CAP) fail(`docs/${path}`, 1, `the front door is ${n} words all in; the cap is ${FRONT_DOOR_CAP}`);
      for (const d of strayDigits(html)) fail(`docs/${path}`, d.line, `a digit-bearing sentence sits outside a key block or a generated count: "${d.text}"`);
    }
  }
  const co = files.get('.github/CODEOWNERS');
  if (!existsSync(M.P.codeowners)) fail('.github/CODEOWNERS', 1, 'missing; run node tools/build.mjs');
  else if (read(M.P.codeowners) !== co) fail('.github/CODEOWNERS', 1, 'stale against roles.json; run node tools/build.mjs');
  out.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return out;
}
