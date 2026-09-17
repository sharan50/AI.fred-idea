# AI.fred: working in this repository

## What this is

The design-and-planning vault for AI.fred, a high-trust, human-in-the-gap AI assistant for tasks that carry real consequence.
`docs/` is the publication: plain static HTML, served by Netlify straight from GitHub, assembled locally from `src/pages/`.
Everything binding about the design is in `BUILD_BRIEF.md`; this file is about editing, not deciding.

## The map

- `BUILD_BRIEF.md`: the brief that produced the publication; its section 1 is the ledger of fixed decisions.
- `REBUILD_BRIEF.md`: the brief for the fragments, the build and the owner views.
- `README.md`: orientation for humans: what is here, how to verify, where the site lives.
- `CLAUDE.md`: this file; `models/CLAUDE.md` and `tools/depmap/CLAUDE.md` cover their directories.
- `docs/`: the published pages, written by the build; never edited by hand.
- `src/pages/`: the source of every page: one file, or a directory of fragments for a long page.
- `manifest.json`: the site map, one entry per page with a one-line summary; the harness checks it.
- `tools/build.mjs`: writes `docs/` from `src/pages/`; `--check` fails on any drift.
- `tools/verify.mjs`: the harness, nine sections; every failure prints as `file:line message`.
- `tools/depmap.mjs` and `tools/depmap/`: the dependency map, its graph, its schema, its batches.
- `tools/figures/`: the scripts that draw the figures of 05 from the model's output.
- `models/`: the economics models behind 05, with their outputs under `models/out/`.
- `spec/`: the executable specification: schemas, closed lists, reference implementations, tests.
- `netlify.toml`: publish directory pinned to `docs`, no build command; never touched.
- `SURFACING_REPORT.md`, `RESTRUCTURE_REPORT.md`: closing reports; opened only when a task names them.
- `.claude/commands/`: `/impact`, `/section`, `/verify`.

## The editing rule

Edit `src/pages/`, never `docs/`. A page edited under `docs/` is overwritten by the next build, and the harness fails until then.
A page under 3,000 words of prose is one file at `src/pages/<path>`.
A longer page is a directory `src/pages/<path minus .html>/` of fragments: `000-head.html`, one `NNN-<h2 id>.html` per section, `999-foot.html`, concatenated verbatim in filename order.
After an edit: `node tools/build.mjs`, then `node tools/verify.mjs`.
No em-dashes, no new colour, no new component, no page moved, no anchor renamed.

## The reading rule

Read the summaries in `manifest.json` first; they say what each page carries.
Open only the fragment the task needs: `ls src/pages/<page minus .html>/` names every section by its `h2` id.
Never open a whole section page. `docs/02-architecture/index.html`, `docs/03-trust-and-data/index.html` and `docs/08-review/index.html` are 22,000 to 26,000 words each; one of them fills a working context.
Get a page's structure with `grep -n '<h2 \|<h3 ' src/pages/<page minus .html>/*.html` before opening anything.

## The dependency rule

Before editing a fixed decision, a mechanism stated on more than one page, or a closed list, run `node tools/depmap.mjs impact <node>` (or `/impact <node>`).
Read the header first: a ledger item or a decision record under REOPENS means the change reopens a fixed decision, which is the founder's call and nobody else's.
Save the closure under `tools/depmap/batches/NNNN-<slug>.md` with the seeds that produced it, and edit from its locus list.
After the edit: `node tools/depmap.mjs extract`, then `check`; update `tools/depmap/graph.json` for what moved. `tools/depmap/SCHEMA.md` has the vocabularies and the change protocol.

## The noise rule

Do not open `models/out/`, `tools/depmap/refs.json`, `tools/depmap/batches/`, `docs/08-review/` or `SURFACING_REPORT.md` unless the task names them.

## Conventions

- British English, `lang="en-GB"`, sentence-case headings, conclusions before reasoning, first person plural for the venture.
- No em-dashes anywhere: prose, headings, captions, code comments, commit messages. Use commas, semicolons or colons.
- No invented numbers; an illustrative number is labelled illustrative; every external claim carries a `verified` (source, date) or `to-verify` chip.
- Banned and enforced by the harness: "In today's", "fast-paced world", "game-changer", "cutting-edge", "seamless", "leverage synergies", "It's important to note", "In conclusion".
- HTML is the single canonical source: no Markdown mirror of any page, tokens and components only, no per-page styling, vanilla JavaScript for navigation only.

## The fixed decisions

They are `BUILD_BRIEF.md` section 1, recorded one per page under `docs/decisions/`. Open section 1 only when a task touches one of them.
A fixed decision is complied with, never reopened; an objection is recorded in `docs/07-open/` and the edit complies.
