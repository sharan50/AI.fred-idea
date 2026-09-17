# AI.fred: design and planning vault

This repository is the central design-and-planning vault for AI.fred, a
high-trust, human-in-the-gap, AI-first personal assistant. Today it holds the
venture's design publication; application code will live here later.

AI.fred is a working title. It is used consistently so a later rename is one
find-and-replace pass.

## What is here

| Path | What it is |
|------|------------|
| `BUILD_BRIEF.md` | The instruction set that produced this repository. Everything binding about the design is in it. |
| `REBUILD_BRIEF.md` | The instruction set for the fragments, the build and the owner views (DR-028). |
| `CLAUDE.md` | What a fresh Claude Code session reads first: the map, the editing rule, the reading rule, the dependency rule. `models/` and `tools/depmap/` carry their own. |
| `.claude/commands/` | `/impact`, `/section` and `/verify`: an edit plan from the map, one fragment by its anchor, the three checks. |
| `docs/` | The publication: plain static HTML, inline SVG diagrams, self-hosted fonts. Assembled from `src/pages/` by `tools/build.mjs` and never edited by hand; Netlify serves it with no build command. |
| `src/pages/` | The source of every page. A page under 3,000 words of prose is one file; a longer page is a directory of fragments, `000-head.html`, one `NNN-<h2 id>.html` per section, `999-foot.html`, concatenated verbatim. |
| `docs/assets/tokens.css` | Every colour, type and spacing token. The only file that defines a colour. |
| `docs/assets/base.css` | Reset, typography, layout and the component set. |
| `docs/assets/print.css` | Print and PDF stylesheet; every page exports cleanly. |
| `docs/assets/nav.js` | Vanilla JavaScript for navigation only. |
| `manifest.json` | Machine-readable site map: path, title, section, status, summary, updated. |
| `tools/build.mjs` | Writes `docs/` from `src/pages/` by verbatim copy or concatenation; `--check` fails when a committed page differs from what a build would write. Never published. |
| `tools/verify.mjs` | The verification harness, nine sections. Never published. |
| `tools/depmap.mjs` | The dependency map's tool: `extract`, `check`, `impact`, `batch`, `at`, `show`, `list`, `selftest`, `view`. The tool is never published; its served view is (DR-017). |
| `tools/depmap/` | The map itself: `graph.json` (curated), `refs.json` (regenerated), `SCHEMA.md` (the vocabularies and the change protocol), `view.src.html` and `view-architecture.src.html` (the two viewer templates), `batches/` (one record per batch of changes, proposed or made). |
| `spec/` | The executable specification: a schema for every record, the closed lists, and reference implementations of the state machine, the envelope, the classifier, the substitutor, the hash service, the evidence pipeline and the ledger, with tests. Never published; `spec/README.md` explains it. |
| `netlify.toml` | Publish directory pinned to `docs`; no build command. |
| `models/` | The economics models behind 05, with every output under `models/out/`. |
| `SURFACING_REPORT.md` | The loop's closing report against the founder's bar (written at the end of the build). |
| `RESTRUCTURE_REPORT.md` | The report of the cut into fragments: what changed, the word counts, the exceptions. |

## Where the site lives

Netlify serves `docs/` straight from GitHub. The publish directory is pinned
in `netlify.toml` and there is no build command. Every page carries a no-index
directive and the Netlify configuration adds an `X-Robots-Tag` header, the
interim mitigation until the access-control item in `docs/07-open/` is
resolved. Do not share a URL before that item is resolved.

## Running the brief

The publication was produced by running `BUILD_BRIEF.md` in Claude Code from
the repository root. To re-run or extend it, follow the "How to run" section
at the top of that file. The loop rules in its section 9 govern.

## Editing

Edit `src/pages/`, never `docs/`: a page edited under `docs/` is overwritten by the
next build, and the harness fails until then. Then assemble and verify:

```
node tools/build.mjs
node tools/verify.mjs
```

The build copies a one-file page verbatim and concatenates a split page's
fragments in filename order; it adds no template and rewrites nothing, so the
fragments are the page and the page is the fragments joined (DR-028).
`node tools/build.mjs --check` reports every page that differs from its source.

## Verifying

```
node tools/verify.mjs
```

The executable specification has its own suite, separate from the harness:

```
node --test 'spec/test/*.test.mjs'
```

Node 18 or later, no dependencies. Non-zero exit on any failure; each failure
prints as `file:line message`. The harness checks links and assets, the
per-page floor, token-only colours, AA contrast, mandated figure ids, banned
characters and phrases, the manifest against the filesystem, the 05 stub, the
decision-record structure and the print stylesheet. Its eighth section runs the
dependency map's own check, so a map pointer that no longer resolves or a
restated list that has drifted fails the build too. Its ninth runs the build's
freshness check, so a page under `docs/` that differs from its source under
`src/pages/` fails as well.

The dependency map (DR-017) answers "what else changes if this changes" before
a page is edited. Before editing a fixed decision, a mechanism stated on more
than one page, or a closed list:

```
node tools/depmap.mjs at 02-architecture/index.html#classifier     what this section carries
node tools/depmap.mjs impact dr-008                                 the closure of a change to one node
node tools/depmap.mjs batch --change custody=dr-008 --change geography=dr-007
```

The batch output is the edit plan; save it under `tools/depmap/batches/`.
`node tools/depmap.mjs view` writes `tools/depmap/view.html`, a self-contained
three-dimensional view of the map to open locally (altitude is causal depth;
select a node to see its cone and follow its connections). It is generated
from `view.src.html` and ignored by git. `view --site` writes the same view to
`docs/depmap/index.html`, which is committed, linked from the rail of every page,
served with the site and failed by the harness when it is stale (DR-017, revised).
`view --site --scope architecture` writes the second served view,
`docs/depmap/architecture.html`: the harness alone as a blueprint, its components
placed in the zones of Figure 2.1, the invariants, lists and records above them,
the build stages below, every locus linking to the section that states it. Both
views are renderings of the one graph and are regenerated together:

```
node tools/depmap.mjs view --site && node tools/depmap.mjs view --site --scope architecture
```
After editing, run `node tools/depmap.mjs extract` to refresh the reference
layer, update `graph.json` for what moved, and run `check`. The vocabularies,
the locus grammar and the change protocol are in `tools/depmap/SCHEMA.md`.

## Previewing locally

Any static file server pointed at `docs/` works, for example:

```
python3 -m http.server 8000 --directory docs
```

## Conventions

- British English; `lang="en-GB"`; no em-dashes.
- HTML is the single canonical source. There is no Markdown mirror; the
  fragments under `src/pages/` are HTML and the pages are their concatenation.
- Every external claim carries a status chip: `verified` (source and date) or
  `to-verify`.
- Every page is listed in `manifest.json` and reachable from its section index.
