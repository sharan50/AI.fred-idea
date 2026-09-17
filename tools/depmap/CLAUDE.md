# tools/depmap/

The dependency map of `docs/` (DR-017). `graph.json` is curated by hand; `refs.json` is regenerated and committed; `batches/` holds one record per batch of changes. The node kinds, facets, locus grammar, check modes, edge kinds and the change protocol are in `SCHEMA.md`: read it before editing `graph.json`.

Commands, from the repository root:

- `node tools/depmap.mjs impact <seeds>`: the cone of a change; read REOPENS first, then the LOCI list, which is the edit plan.
- `node tools/depmap.mjs batch --change name=seed,seed [--change ...]`: several changes as one plan; save it under `batches/NNNN-<slug>.md` with its seeds.
- `node tools/depmap.mjs at <locus>`, `show <id>`, `list [--kind k] [--facet name=value]`: what a place carries, what a node carries, what exists.
- `node tools/depmap.mjs extract`, then `check`: after any edit to a page or to the graph; `check` also runs as section 8 of the harness.
- `node tools/depmap.mjs view --site && node tools/depmap.mjs view --site --scope architecture`: regenerate the two served views whenever the graph or the page list changes; the harness fails while they are stale.

The change protocol: write the change as seeds, not prose; `impact` per change; `batch` per pass; edit the closure from the locus list; `verify`; then update the map for what moved. A new decision record needs a `dr-*` node, one `alt-*` node per rejected alternative with a `rejects` edge each, or `check` fails coverage.
