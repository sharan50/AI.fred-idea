# Batch 0016: the map reachable from the site, and a second view for the architecture

Recorded 2026-09-15 as one session of iteration. The founder asked for two
things: that the dependency map be reachable from the main site, and that a
separate map be dedicated to the technical architecture, with creative
freedom over both. The first is a matter of navigation and of what the
published workspace serves; the second widens a fixed decision, DR-017, and
the exception DR-010 names for it, so both are run through the map.

## What the site served before this batch

The workspace `aifred-workspace` on Netlify was serving `main` at `0a82983`
(batch 0015, production deploy of 2026-09-14, auto-published), so the
record's map at `docs/depmap/` was live. It was reachable from one place only:
the last row of Table i.2 at the foot of the index, labelled `map`. No rail,
masthead or footer linked it, and no page but the index did. That is the gap
the founder saw.

## The change, as seeds, with the decision taken

| Change | The founder's decision | Seeds |
|--------|------------------------|-------|
| second-view | Both views of the map join the publication list in the rail of every page, under the numeral `map`, and the index's table carries a row for each. A second served view, the architecture map at `docs/depmap/architecture.html`, is rendered by the same tool from the same graph: the harness alone, its components placed in the zones of Figure 2.1 in 02, the invariants they keep, the closed lists and policy flag rows they read, the records that justify them and the stages that build them, with open items and residual findings riding as badges on the node they land in and every locus linking to the section that states it. It is a query of the one graph and adds no node and no edge; the only schema change is a `zone` facet on component nodes, which is where the layout comes from. DR-017's closes-off names two served views instead of one; DR-010's exception widens to cover the second page under the same directory and the same three checks. | `dr-017`, `dr-010` |

## What was edited, by node

- `dr-017`: the closes-off bullet on the served artefact now names two views,
  the record's map and the architecture map, and says a third would be the
  same exception again, never a second map; the rejected alternative "A
  published, interactive map page" records the widening; the status records
  the revision and points at this batch. The rejection of "Several maps, one
  per dimension" stands and is cited: the architecture view is the one graph
  queried along its harness layers, not a map of its own. The manifest summary
  no longer says "one served view".
- `dr-010`: the two closes-off bullets on generated files and on scripts say
  "views" and "each"; the status records the second revision. The canonical
  loci of `inv-no-build-step` ("A build command in netlify.toml") and
  `inv-no-second-copy` ("second copy of any page") are untouched and still
  resolve.
- The index: Table i.2 gains the architecture row and the note under the table
  says what the two `map` rows are and that the rail of every page reaches
  them. The rail's publication list on all 42 pages gains the two entries
  after `DR Decisions`.
- The tool: `tools/depmap.mjs` gains the `zone` facet (closed list: device,
  entry, alias, real-value, market, floor; components only, and `check` fails
  a zone on any other kind), `architectureSubgraph`, and `renderView` takes a
  `scope`; `view --scope architecture` renders `view-architecture.src.html`,
  and `--site` writes it to `docs/depmap/architecture.html`. The record's
  served view now links to the architecture map and back, and both link back
  to the publication.
- The map: 43 component nodes carry a `zone`; the threat model carries none
  and the view draws it as cross-cutting. No node and no edge was added or
  removed. `SCHEMA.md` documents the facet and the second view.
- The harness: section 8 holds both served views to freshness, the no-index
  directive and no external load, checks that every page-relative link inside
  a view resolves, and the manifest check expects both. The manifest lists
  `depmap/architecture.html` and the `depmap` section counts two pages.

## The architecture view, as designed

Two dimensions, not three, because an engineer reads a blueprint. The
components sit in the zones of Figure 2.1: the user's device on the left; the
entry boundary, the vault's edge proxy, as a strip across the top; the alias
zone and the real-value zone side by side beneath it; the per-market tables
and adapters to the right; the floor and the cross-cutting threat model below.
Inside a zone the boxes are ordered column-major by the mean position of their
wired neighbours, so the wiring between zones runs as straight as a grid
allows; each box carries the tag of the stage that builds it. Above the field
run three bands, the records, the invariants and the lists, each ordered by
the mean position of the components it touches and spread across the field;
below it the eight stages in build order, each arrow a gate. At rest only the
wiring between components is drawn, with arrowheads pointing at what depends;
a hover or a selection lights every edge that touches the node, the selection
in the record's colours (upstream in the accent, downstream in ink, sideways
in magenta). The inspector names the groups as an engineer would ask for them:
must keep, reads, depends on, justified by, depended on by, built in, the open
items that land here; and every locus is a link into the page. Two buttons
under the legend light the nodes that guard fatal one or fatal two. The
address carries the selected node, so `architecture.html#comp-substitutor`
opens on the substitutor.

## Checks on the edited record

`check --warnings`: clean, 405 nodes, 636 edges, one warning (the
`refused-policy` near-collision, still open). `verify`: clean, 43 pages plus
the two served views. `selftest`: clean. A headless render of both served
views loads the self-hosted fonts, raises no console error, and the
architecture view opens on the node its address names.

## The change, as the tool returned it

The graph gained no node and no edge in this batch, so the closure is the same
before and after the edit: it is the closure of the two records themselves.

```
batch of 1 change: second-view

second-view: seeds dr-017, dr-010
  reopens dr-010  Plain HTML with no build step [fixed]
  reopens dr-017  A dependency map of the record, kept as a tool [fixed]
  reopens ledger-1.11.1  Repo as vault: design docs now, application code later [fixed]
  reopens ledger-1.11.2  Plain static HTML, no build step, no frameworks, no CDNs; Netlify from GitHub [fixed]
  reopens ledger-1.11.3  HTML is the single canonical source; no generator, no Markdown mirror [fixed]
  reopens ledger-1.11.4  Inline SVG diagrams, clean PDF export, manifest.json as the site map [fixed]
  reopens ledger-1.11.5  A Netlify URL is public by default; access control is a to-verify in 07 [fixed]
  alternative alt-dr-017-a-page-level-map  A page-level map
  alternative alt-dr-017-several-maps-one-per-dimension  Several maps, one per dimension
  alternative alt-dr-017-a-wiki-a-graph-database  A wiki, a graph database or a diagram tool
  alternative alt-dr-017-a-published-interactive-map-page  A published, interactive map page
  alternative alt-dr-017-the-internal-links-as-the  The internal links as the map
  alternative alt-dr-010-a-static-site-generator  A static site generator
  alternative alt-dr-010-markdown-as-the-canonical-source  Markdown as the canonical source, with HTML generated from it
  alternative alt-dr-010-a-framework-or-a-hosted  A framework or a hosted documentation platform
  alternative alt-dr-010-fonts-or-stylesheets-from-a  Fonts or stylesheets from a CDN
  open open-07-07  Netlify access control
  open open-07-14  manifest.json outside the published directory
  open obj-07-d  Objection D: an unguessable URL is not access control

shared upstream (reopened by two or more changes)
  none

loci: 4 sections on 3 pages; "touched by" counts the changes whose closure reaches the section
   1 of 1  decisions/dr-010-html-no-build-step.html#decision             64  Decision                              dr-010  (second-view)
   1 of 1  decisions/dr-010-html-no-build-step.html#closes-off           87  What this closes off                  inv-no-build-step, inv-no-second-copy  (second-view)
   1 of 1  decisions/dr-017-dependency-map.html#decision                 64  Decision                              dr-017  (second-view)
   1 of 1  decisions/index.html#ledger                                   63  The ledger                            dr-010, dr-017  (second-view)
```
