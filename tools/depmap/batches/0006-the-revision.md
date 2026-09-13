# Batch 0006: the revision of 13 September 2026

Recorded 2026-09-13. The founder's revision after the design review at
`/08-review/`: the positioning the record was written on has changed, and the
premise that economics could be deferred is withdrawn. Ten ordered items,
handed to the session as a written brief with replacement prose and a models
bundle. What follows is the record of the session, the seeds it ran on, and
what it did not do.

## The founder's position, in his own words

Two of the review's findings rested on things the record said but the founder
did not intend. **Scope:** the record described a low-frequency,
high-consequence product with everyday tasks deferred; the intent is everyday
tasks from day one, with the consequential ones as the hook. **The context
profile:** the record treated it as a supporting asset; it is the
differentiator against the general assistants. The rest of the review survives,
including the absence of customer evidence, the co-founder condition and the
institutional admission problem.

Two changes are the founder's by decision rather than the review's:
**telephony masking is dropped**, so humans place calls and no vault value is
ever spoken; and **structured task cards replace pixel masking** for modelled
workflows, with pixel streaming deferred.

The substance of the revision is the economics. The governing ratio is human
minutes per user per month against revenue per user: at 158 minutes against
$37 no scale recovers the arithmetic, and at 59 minutes against $64 it is a
normal capital-light business. Four levers move it and only four.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `scope-correction` | `premise-endgame`, `dr-019`, `dr-020` |
| `economics-modelled` | `dr-015`, `dr-024` |
| `telephony-masking-dropped` | `dr-021`, `comp-telephony` |
| `task-cards` | `dr-022`, `comp-workflow-library` |
| `floor-staged` | `dr-006` |
| `geography-sequencing` | `dr-023` |

The batch run over those six changes reopened 114 loci across the publication,
with `decisions/dr-024-metered-pricing.html#closes-off` the only locus reached
by two changes at once.

## What was edited, by item

1. **Scope.** The self-definition on every page; the index's section 1;
   00's section 1, rewritten around the customer as a relationship with the task
   mix as a consequence; 00's new section 2, the context profile, which
   renumbers sections 2 to 6 as 3 to 7; 00's section 7, where the endgame
   becomes the starting scope and the data question is settled; 01's taxonomy.
2. **Economics.** 05 replaced in full, with two new sub-pages,
   `/05-business/measurement-protocol` and `/05-business/model`. DR-015 is
   withdrawn and kept as the position it replaced. The harness's bespoke check
   on 05 no longer demands the deferral and now demands the modelled statement,
   the round plan and the protocol.
3. **Architecture.** The media server, the per-leg mute, the delay line, the
   live transcriber and the re-voicing are out of 02, 03, the worker console,
   04, 06, the index and DR-004; the structured task card is the default for a
   modelled workflow and the streamed page is the deferred fallback; the
   workflow library is named in 02 section 4.5 and 04 section 3.1.
4. **Operations.** DR-006 becomes amber on its staging with the threshold as
   its trigger; 04's shift section opens with the staging and names the floor's
   step cost.
5. **Roadmap.** 06 section 4 opens with the sequence and the gates: the United
   Kingdom between months 8 and 14, India as the delivery base, 400 and 600
   users as gates, amber on a priced waiting list.
6. **Decision records.** DR-019 rewritten; DR-020 to DR-024 added; the ledger
   reads twenty-four in the ledger table, the index's closing line and the
   manifest.
7. **Open items.** Three closed and kept in place, seven added with owners and
   triggers; Table 7.1 holds twenty-eight.
8. **Models.** `models/` at the repository root, with the readme naming each
   file, the command that reproduces a run, and the run the publication quotes:
   twenty thousand paths at seed 20260913, dated 2026-09-13.

## The map

Five decision records, sixteen rejected alternatives, one mechanism
(`comp-workflow-library`), five invariants (`inv-no-value-spoken`,
`inv-card-over-pixels`, `inv-metered-allowance`, `inv-no-paid-placement`,
`inv-market-gates`) and seven open items were added. `inv-data-story-by-record-only`
is replaced by `inv-no-data-sold`, because the question is settled rather than
held open. `inv-everyday-same-harness` keeps its id and loses the legal-pack
gate. The ledger event `read-back-muted` becomes `exposure-recorded`. The
graph now holds 374 nodes and 604 edges.

## What this batch did not do

- **Figure 0.1 in 00** is untouched, on the brief's instruction that the
  positioning figure needs a human hand. Its argument, that only the third
  column above the line is occupied, now understates the scope, and its
  description states the old claim. The brief's item 1d describes a quadrant
  with a "named PA or concierge" point; no such figure exists in 00. The figure
  of that shape is in `/08-review/`, which is not merged.
- **The headcount threshold** DR-006 now needs is not written, because no file
  in `models/` carries one and the brief forbids inventing a number. It is an
  open item with the founder as its owner.
- **Acceptance check 4** is met in substance rather than literally: the media
  server and the telephony masker appear only where the record says they were
  dropped, in DR-021's rejected alternatives, in 02 section 4.2, in 06's stage
  five, in 07's closed vendor item and in DR-004's restated rule.
- **The browser masker** survives as the specification of DR-022's deferred
  fallback, which is what DR-022 intends; it is marked as deferred where it is
  specified.

## The checks

- `node tools/depmap.mjs check --warnings`: clean, 374 nodes, 604 edges, the
  known `refused-policy` warning only.
- `node tools/depmap.mjs selftest`: clean.
- `node tools/verify.mjs`: clean, 38 pages.
- Every new and every renumbered page rendered at 1280px and at 400px, and the
  two new sub-pages checked in print emulation.
