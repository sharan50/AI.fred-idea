# Batch 0003: the map's served view

Recorded 2026-09-10, the same day as batch 0002 and after its merge, as its
own session of iteration: the founder could not see the record's changes on
the published workspace and asked that the dependency map be active there
too. The first half is a deployment matter (the workspace was serving a
deploy preview of the first pull request, not the main branch), recorded in
the batch's notes below. The second half changes two fixed decisions and is
therefore run through the map.

## The change, as seeds, with the decision taken

| Change | The founder's decision | Seeds |
|--------|------------------------|-------|
| map-served | The three-dimensional view of the map is served from the published workspace at `docs/depmap/`. DR-017 had rejected "a published, interactive map page" on the ground that DR-010 bans scripts and frameworks in the publication; the founder reverses that in part. The instrument stays the JSON the harness checks; the page is generated from it by `view --site`, committed, linked from the index, and failed by the harness when it is stale, indexed, or loading anything from outside. DR-010's closure gains that one named exception. | `dr-010`, `dr-017` |

## What was edited, by node

- `dr-010`: the closes-off bullets on generated files and on scripts now name
  the exception; the status records the revision. `inv-no-build-step` and
  `inv-no-second-copy` keep their loci and their meaning: no build command, no
  package manifest, no second copy of any page.
- `dr-017`: the closes-off bullet on a served artefact is rewritten; the
  rejected alternative "A published, interactive map page" records its partial
  reversal and the cost accepted; the status records the revision; the meta
  description and the manifest summary no longer say "never as a page". The
  alternative stays in the map as `alt-dr-017-a-published-interactive-map-page`,
  since it was rejected as stated and reversed only in part.
- The tool: `tools/depmap.mjs` gains `renderView` and `view --site`; the
  template `view.src.html` takes its fonts and its back link from the renderer,
  so the served page loads IBM Plex from `docs/assets/fonts` and the artifact
  copy keeps Google Fonts.
- The harness: `docs/depmap/index.html` is outside the page floor and inside
  three checks of its own (fresh, no-index, no external load) plus the
  manifest; the manifest and the index's publication map list it.
- No node was added: the served view is a rendering of the map, not a
  mechanism of the design.

## The deployment, for the record

The workspace `aifred-workspace` on Netlify was serving deploy
`6a9b37f1b7069100091fcd88`, a deploy preview of pull request 1 (branch
`claude/new-session-0phz73`, commit `2763c73`, created 2026-09-04), republished
as the production deploy at 17:20 UTC on 2026-09-10. No production deploy from
`main` existed, so the merge of pull request 2 was not visible. The fix is a
production deploy of `main` and, in the Netlify project's build settings, a
production branch of `main` with auto-publishing on, so that later merges
deploy on their own.

## Checks on the edited record

`check --warnings`: clean, 341 nodes, 574 edges, one warning (the
`refused-policy` near-collision, still open). `verify`: clean, 31 pages plus
the served view. `selftest`: clean. A headless render of
`docs/depmap/index.html` loads the self-hosted fonts, shows the back link and
raises no error.

## The change, as the tool returned it before the edit

```
batch of 1 change: map-served

map-served: seeds dr-010, dr-017
  reopens dr-010  Plain HTML with no build step [fixed]
  reopens dr-017  A dependency map of the record, kept as a tool [fixed]
  reopens ledger-1.11.1  Repo as vault: design docs now, application code later [fixed]
  reopens ledger-1.11.2  Plain static HTML, no build step, no frameworks, no CDNs; Netlify from GitHub [fixed]
  reopens ledger-1.11.3  HTML is the single canonical source; no generator, no Markdown mirror [fixed]
  reopens ledger-1.11.4  Inline SVG diagrams, clean PDF export, manifest.json as the site map [fixed]
  reopens ledger-1.11.5  A Netlify URL is public by default; access control is a to-verify in 07 [fixed]
  alternative alt-dr-010-a-static-site-generator  A static site generator
  alternative alt-dr-010-markdown-as-the-canonical-source  Markdown as the canonical source, with HTML generated from it
  alternative alt-dr-010-a-framework-or-a-hosted  A framework or a hosted documentation platform
  alternative alt-dr-010-fonts-or-stylesheets-from-a  Fonts or stylesheets from a CDN
  alternative alt-dr-017-a-page-level-map  A page-level map
  alternative alt-dr-017-several-maps-one-per-dimension  Several maps, one per dimension
  alternative alt-dr-017-a-wiki-a-graph-database  A wiki, a graph database or a diagram tool
  alternative alt-dr-017-a-published-interactive-map-page  A published, interactive map page
  alternative alt-dr-017-the-internal-links-as-the  The internal links as the map
  open open-07-07  Netlify access control
  open open-07-14  manifest.json outside the published directory
  open obj-07-d  Objection D: an unguessable URL is not access control

shared upstream (reopened by two or more changes)
  none

loci: 4 sections on 3 pages; "touched by" counts the changes whose closure reaches the section
   1 of 1  decisions/dr-010-html-no-build-step.html#decision             61  Decision                              dr-010  (map-served)
   1 of 1  decisions/dr-010-html-no-build-step.html#closes-off           84  What this closes off                  inv-no-build-step, inv-no-second-copy  (map-served)
   1 of 1  decisions/dr-017-dependency-map.html#decision                 61  Decision                              dr-017  (map-served)
   1 of 1  decisions/index.html#ledger                                   60  The ledger                            dr-010, dr-017  (map-served)
```

## The change, as the tool returned it after the edit

```
batch of 1 change: map-served

map-served: seeds dr-010, dr-017
  reopens dr-010  Plain HTML with no build step [fixed]
  reopens dr-017  A dependency map of the record, kept as a tool [fixed]
  reopens ledger-1.11.1  Repo as vault: design docs now, application code later [fixed]
  reopens ledger-1.11.2  Plain static HTML, no build step, no frameworks, no CDNs; Netlify from GitHub [fixed]
  reopens ledger-1.11.3  HTML is the single canonical source; no generator, no Markdown mirror [fixed]
  reopens ledger-1.11.4  Inline SVG diagrams, clean PDF export, manifest.json as the site map [fixed]
  reopens ledger-1.11.5  A Netlify URL is public by default; access control is a to-verify in 07 [fixed]
  alternative alt-dr-010-a-static-site-generator  A static site generator
  alternative alt-dr-010-markdown-as-the-canonical-source  Markdown as the canonical source, with HTML generated from it
  alternative alt-dr-010-a-framework-or-a-hosted  A framework or a hosted documentation platform
  alternative alt-dr-010-fonts-or-stylesheets-from-a  Fonts or stylesheets from a CDN
  alternative alt-dr-017-a-page-level-map  A page-level map
  alternative alt-dr-017-several-maps-one-per-dimension  Several maps, one per dimension
  alternative alt-dr-017-a-wiki-a-graph-database  A wiki, a graph database or a diagram tool
  alternative alt-dr-017-a-published-interactive-map-page  A published, interactive map page
  alternative alt-dr-017-the-internal-links-as-the  The internal links as the map
  open open-07-07  Netlify access control
  open open-07-14  manifest.json outside the published directory
  open obj-07-d  Objection D: an unguessable URL is not access control

shared upstream (reopened by two or more changes)
  none

loci: 4 sections on 3 pages; "touched by" counts the changes whose closure reaches the section
   1 of 1  decisions/dr-010-html-no-build-step.html#decision             61  Decision                              dr-010  (map-served)
   1 of 1  decisions/dr-010-html-no-build-step.html#closes-off           84  What this closes off                  inv-no-build-step, inv-no-second-copy  (map-served)
   1 of 1  decisions/dr-017-dependency-map.html#decision                 61  Decision                              dr-017  (map-served)
   1 of 1  decisions/index.html#ledger                                   60  The ledger                            dr-010, dr-017  (map-served)
```
