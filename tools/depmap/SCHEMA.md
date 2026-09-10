# The dependency map: schema and change protocol

This directory holds the dependency map of the publication under `docs/`. The
map is a tool, never a page (DR-017). It answers one question before an
editor touches a page: if this decision, mechanism, invariant or closed list
changes, what else must change with it, upstream, downstream and sideways.

Three rules govern everything below.

1. One graph. Typed edges and faceted nodes in one file; never several maps.
2. The HTML stays the single canonical source. A node carries a name and the
   places where the pages state the thing. It never paraphrases the design.
3. Nothing in the map is trusted by eye. `node tools/depmap.mjs check` runs
   inside `tools/verify.mjs`; a locus that no longer resolves, a restated list
   that has drifted, or a stale reference layer fails the build in the same
   `file:line message` form as every other failure.

## Files

| File | What it is | Who writes it |
|------|------------|---------------|
| `graph.json` | The curated layer: nodes, edges, facets, loci | A person, by hand |
| `refs.json` | The reference layer: every page, anchor, table and internal link under `docs/` | `node tools/depmap.mjs extract`; committed so diffs show drift |
| `SCHEMA.md` | This file | A person |
| `batches/` | One record per batch of proposed changes: the seeds, the closure the tool returned, the findings | The tool, then a person |

## Node kinds and ids

Ids are stable, lower-case, and match `^(fatal|premise|ledger|dr|alt|inv|comp|vocab|flag|stage|open|obj|res)-[a-z0-9.-]+$`. A vocabulary member is addressed by path, `vocab-<slug>/<member>`.

| Kind | Id form | What it is | Canonical locus |
|------|---------|------------|-----------------|
| `fatal` | `fatal-1`, `fatal-2` | The two fatal failures | `00-thesis/index.html#what-consequence-means` |
| `premise` | `premise-<slug>` | A thesis claim the argument rests on | The section of 00 that states it |
| `ledger` | `ledger-1.3`, `ledger-1.3.2` | A heading or bullet of BUILD_BRIEF.md section 1, in document order | None: the brief is outside `docs/`; the node carries `source` with the line |
| `dr` | `dr-008` | A decision record; must match a `decisions/dr-008-*.html` | `decisions/dr-nnn-*.html#decision` |
| `alt` | `alt-dr-008-<slug>` | A rejected alternative, one per `<dt>` in the record's rejected section | `decisions/dr-nnn-*.html#rejected!"<dt text>"` |
| `inv` | `inv-<slug>` | A named invariant or a load-bearing closes-off | The section that states it |
| `comp` | `comp-<slug>` | A component, surface or artefact of the harness | The section that specifies it |
| `vocab` | `vocab-<slug>` | A closed list, with inline `members` | The section the pages name as canonical |
| `flag` | `flag-<act-slug>` | One row of the policy flag table, with its cells | `03-trust-and-data/index.html#table:3.5!"<row label>"` |
| `stage` | `stage-1` to `stage-8` | A roadmap stage and its gate | `06-roadmap/index.html#sequence!"Stage n: ..."` |
| `open` | `open-07-01` to `open-07-19` | A row of Table 7.1, in row order at assignment | `home`: `07-open/index.html#items!"<label>"` |
| `obj` | `obj-07-a` to `obj-07-d` | An objection recorded in 07 | `home`: `07-open/index.html#objections!"..."` |
| `res` | `res-07-01` to `res-07-16` | A residual finding of the seventh adversarial pass | `evidence` loci; `source` names the finding in SURFACING_REPORT.md |

## Node fields

```
id        as above
kind      as above
label     a name, not a sentence: at most 80 characters, no terminal full stop,
          no em-dash, none of verify.mjs's banned phrases
facets    see the closed lists below; omit a facet that does not apply
loci      a list of { at, role, ... }; see the locus grammar
members   vocabularies only: [{ id, word, code?, alt? }]
check     vocabularies only: "members" (default), "verbatim" or "none"
pattern   vocabularies only, optional: a regular expression for the closedness scan
text      an invariant stated as one sentence that must appear verbatim (with check "verbatim")
count     an integer the canonical locus must state (used for the open-items count)
source    free text pointing outside docs/ (the brief, the surfacing report); never checked
note      free text for the reader; never checked
```

Facets and their closed lists:

| Facet | Values |
|-------|--------|
| `layer` | `index`, `thesis`, `product`, `architecture`, `trust`, `operations`, `business`, `roadmap`, `open`, `publishing` |
| `fixity` | `fixed`, `amber`, `to-verify`, `assumption`, `illustrative`, `derived` |
| `fatal` | `1`, `2`, `both`, `none` |
| `surface` | `browser`, `telephony`, `mail`, `device`, `console`, `all` |
| `market` | `in`, `uk`, `us`, `all` |

## Locus grammar

A locus names a place in `docs/`. Paths are written exactly as `manifest.json` writes them: relative to `docs/`, never `../`, never the directory form.

```
<page>                       the whole page; allowed only with role "mentions"
<page>#<id>                  an h2, h3, figure, blockquote or table wrapper by id
<page>#table:<S.n>           a table by its caption number, resolved through refs.json
<locus>!"<phrase>"           the element's normalised text must contain the phrase (12 characters or more)
```

The element a locus resolves to is sliced by heading order inside `<main>`: an h2 runs to the next h2; an h3 to the next h2 or h3; a figure, blockquote or table wrapper is the element itself. `<section>` wrappers are never used for slicing.

Locus roles:

| Role | Meaning | Check |
|------|---------|-------|
| `canonical` | Where the thing is specified; exactly one per node (except `open`, `obj`, `res`) | Resolves; for vocabularies the members are checked here too |
| `restates` | A second place that states the same list or sentence | The node's check mode |
| `partial` | A deliberate restatement of some members; carries `omits: [ids]` | The non-omitted members |
| `mentions` | The thing is named here; a phrase is mandatory | The phrase only |
| `home` | Where an open item or objection lives | Resolves; phrase |
| `evidence` | A place a residual finding cites | Resolves; phrase |

A locus may carry:

- `form`: `"word"` (default) or `"code"`, choosing which member form the check looks for at this locus.
- `check`: a per-locus override of the node's check mode.
- `cells`: on a flag's canonical locus, the expected cell values in column order (India, UK, US), compared against the table row with chips removed.
- `drift`: the id of a `res-*` or `open-*` node. A waiver: the check must still fail at this locus, and the waiver itself fails once the drift is fixed, so it cannot linger.

Figures are `mentions` only. Text inside an SVG wraps across `<text>` runs and cannot be matched literally.

## Check modes

One normaliser is used everywhere: strip tags, decode entities, map curly quotes to straight, lower-case, collapse whitespace. In `verbatim` mode every separator run (`, `, `; `, ` and `, `: `) collapses to `, ` before comparison.

| Mode | Passes when |
|------|-------------|
| `members` | Every member's chosen form appears as a whole token somewhere in the element's text, in any order, with prose between allowed |
| `verbatim` | The members (or the `text`) joined by `, ` appear as one run after separator collapse; use only where the publication itself claims identity |
| `none` | Only the phrase is checked |

A vocabulary with a `pattern` also runs the closedness scan: any token in a restating locus that matches the pattern but is not a member is reported as a warning. Warnings print from `node tools/depmap.mjs check --warnings` and never fail the build.

## Edges

Edges are three-element arrays, one per line, so `git diff` and `grep` work on them: `["from", "kind", "to"]`.

| Kind | From | To | Direction |
|------|------|----|-----------|
| `justifies` | `fatal`, `premise`, `ledger`, `dr` | `ledger`, `dr`, `comp`, `inv`, `vocab`, `stage`, `flag` | from is upstream of to |
| `depends-on` | `comp`, `stage`, `vocab`, `flag` | `comp`, `vocab`, `inv`, `dr`, `stage` | to is upstream of from |
| `closes-off` | `dr` | `inv` | from is upstream of to |
| `rejects` | `dr` | `alt` | lateral; the alt's upstream is the record |
| `conflicts-with` | `res` | anything but `res` | lateral |
| `lands-in` | `open`, `obj` | `dr`, `comp`, `vocab`, `flag`, `inv`, `stage` | lateral |

There is no `references` edge. The 1,400 internal links live in `refs.json` and are consulted at query time as inbound links to a locus; they cannot tell a canonical statement from a mention, so they are never the map.

## Commands

```
node tools/depmap.mjs extract                 regenerate refs.json
node tools/depmap.mjs check [--warnings]      everything above; exit 1 on any failure
node tools/depmap.mjs selftest                the normaliser and the resolver against known loci
node tools/depmap.mjs impact <seeds> [--depth n] [--stop-at kinds] [--through ids] [--links] [--md|--json]
node tools/depmap.mjs impact --at <locus>     the same, seeded by every node carrying the locus
node tools/depmap.mjs reopens <seeds>         only the header: which ledger items and records sit upstream
node tools/depmap.mjs batch --change name=seed,seed [--change ...] [--depth n] [--md]
node tools/depmap.mjs batch <plan.json>       the same from a file: { "changes": { "name": ["seed", ...] } }
node tools/depmap.mjs at <locus>              every node carrying the locus, by role, plus inbound links
node tools/depmap.mjs show <id>               a node with its loci resolved and its edges both ways
node tools/depmap.mjs list [--kind k] [--facet name=value]
node tools/depmap.mjs view [--out file] [--fragment]   bake graph.json into the viewer page
```

`view` writes `view.html`, a single self-contained page that draws the graph in
three dimensions: altitude is causal depth (the fatal failures at the top, the
ledger and the records below them, the harness and the closed lists in the
middle, the open items and residuals at the floor), so up on the screen is
always upstream. Selecting a node draws its cone by the same direction rules as
`impact`, and the inspector lists its connections to follow. The page is
generated from `view.src.html`, is never committed and never published; it
opens from the file system with no server and no dependency.

Seeds are node ids, separated by commas; a member path seeds its vocabulary and records the member as the reason.

`impact` walks a cone, never a ball:

- UP follows upstream relations only and is unbounded; `fatal` and `premise` nodes are natural terminals.
- DOWN follows downstream relations only, to `--depth` (default 2), and never re-enters a node already in UP. A node with more than twelve downstream neighbours is expanded only as a seed or at depth 1; deeper it is held and reported, and `--through <id>` opens it.
- LATERAL collects, at distance one from every node in the cone, its rejected alternatives, the residual findings that cite it and the open items that land in it; it never expands them.
- The result is every locus of every node in the cone plus the evidence loci of the lateral residuals, grouped by page in manifest order, then by line, each with the shortest edge path from a seed.

`batch` runs `impact` per change, then prints the records reopened by two or more changes and the union of loci with a "touched by k of n" column, sorted by k. That column is the edit plan: a section touched by four changes is edited once.

## The change protocol

1. Write the change as seeds, not as prose: which decisions, mechanisms, invariants or lists it touches. If the thing has no node, that is the first finding: add the node (mapping the record as it is), never a node for the proposal.
2. Run `impact` per change and read the header first. A ledger item or a record in REOPENS means the change reopens a fixed decision, which is the founder's call and nobody else's.
3. Run `batch` over the changes chosen for one pass. A batch is the changes of one session of ideation and iteration, whatever their number or kind; it is not a unit of size. Save the output under `batches/NNNN-<slug>.md` with the seeds that produced it.
4. Edit the closure, page by page, from the batch's locus list. A record that is reopened gets a new decision record or an amended one, with its rejected alternatives and closes-off list updated first, because everything downstream is re-derived from them.
5. Run `node tools/verify.mjs`. Then run the fresh-context coherence pass and the adversarial pass of BUILD_BRIEF.md section 9 over the closure's pages only, once per batch.
6. Update the map for what changed: new nodes, moved loci, edges added or removed, waivers removed as their drift is fixed. `check` tells you what no longer resolves.

## Worked example

```json
{
  "id": "vocab-committing-actions", "kind": "vocab",
  "label": "The six committing actions",
  "facets": { "layer": "architecture", "fixity": "fixed", "fatal": "2" },
  "check": "verbatim",
  "members": [
    { "id": "form-submit", "word": "a form submit" },
    { "id": "committing-click", "word": "a committing click" },
    { "id": "committing-sentence", "word": "a committing sentence on a call" },
    { "id": "keypad-press", "word": "a keypad press outside the navigation map" },
    { "id": "relay-release", "word": "a relay release" },
    { "id": "committing-placement", "word": "a committing placement" }
  ],
  "loci": [
    { "at": "02-architecture/index.html#surface-controllers", "role": "canonical" },
    { "at": "03-trust-and-data/index.html#substitutor-interface", "role": "restates" },
    { "at": "04-operations/index.html#dual-control", "role": "restates" }
  ]
}
```

with the edges

```json
["dr-004", "justifies", "vocab-committing-actions"],
["comp-substitutor", "depends-on", "vocab-committing-actions"]
```

`impact vocab-committing-actions` then reports DR-004 and its ledger item upstream (the change reopens a fixed decision), the substitutor and every controller that depends on the list downstream, DR-004's rejected alternatives sideways, and the three loci above as the places to edit.
