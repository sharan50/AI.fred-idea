# AI.fred: design and planning vault

This repository is the central design-and-planning vault for AI.fred, a
high-trust, human-in-the-gap, AI-first personal assistant. Today it holds the
venture's design publication; application code will live here later.

AI.fred is a working title. It is used consistently so a later rename is one
find-and-replace pass.

## What is here

| Path | What it is |
|------|------------|
| `BUILD_BRIEF.md` | The instruction set that produced this repository. Everything binding is in it. |
| `docs/` | The publication: plain static HTML, inline SVG diagrams, self-hosted fonts. No build step. |
| `docs/assets/tokens.css` | Every colour, type and spacing token. The only file that defines a colour. |
| `docs/assets/base.css` | Reset, typography, layout and the component set. |
| `docs/assets/print.css` | Print and PDF stylesheet; every page exports cleanly. |
| `docs/assets/nav.js` | Vanilla JavaScript for navigation only. |
| `manifest.json` | Machine-readable site map: path, title, section, status, summary, updated. |
| `tools/verify.mjs` | The verification harness. Never published. |
| `tools/depmap.mjs` | The dependency map's tool: `extract`, `check`, `impact`, `batch`, `at`, `show`, `list`, `selftest`. Never published (DR-017). |
| `tools/depmap/` | The map itself: `graph.json` (curated), `refs.json` (regenerated), `SCHEMA.md` (the vocabularies and the change protocol), `batches/` (one record per batch of proposed changes). |
| `netlify.toml` | Publish directory pinned to `docs`; no build command. |
| `SURFACING_REPORT.md` | The loop's closing report against the founder's bar (written at the end of the build). |

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

## Verifying

```
node tools/verify.mjs
```

Node 18 or later, no dependencies. Non-zero exit on any failure; each failure
prints as `file:line message`. The harness checks links and assets, the
per-page floor, token-only colours, AA contrast, mandated figure ids, banned
characters and phrases, the manifest against the filesystem, the 05 stub, the
decision-record structure and the print stylesheet. Its eighth section runs the
dependency map's own check, so a map pointer that no longer resolves or a
restated list that has drifted fails the build too.

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
from `view.src.html`, ignored by git and never published.
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
- HTML is the single canonical source. There is no Markdown mirror.
- Every external claim carries a status chip: `verified` (source and date) or
  `to-verify`.
- Every page is listed in `manifest.json` and reachable from its section index.
