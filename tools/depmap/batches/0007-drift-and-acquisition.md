# Batch 0007: closing the drift, and naming the acquisition hole

Recorded 2026-09-13, the same day as batch 0006 and after it. Batch 0006 landed
the founder's revision and the economics it rests on. This batch is what
happened when the model behind those economics was interrogated rather than
quoted: a sensitivity pass, a critique of the model, and then the edits the
critique made unavoidable. No decision is reopened and no decision record is
taken. Everything here is disclosure.

## Why there was anything to close

Three questions were put to `models/aifred_model.py` in this session, each
answered by a tool that reruns the published model rather than restating it
(`models/aifred_harness.py`, which refuses to report unless it can rebuild
`sim_viable.csv` character for character).

**Which drivers own the answer.** First-order Sobol indices over twenty
thousand paths. The rate at which users arrive in month 1 owns 34 per cent of
the variance of the peak cash need, 40 per cent of whether the business ever
turns profitable and 60 per cent of the month it crosses over. The thirty-one
drivers on the delivery side own under 7 per cent of the first between them.
The automation ceiling and the assisted handling floor, two of the four levers
05 names, own 0.2 and 0.1 per cent.

**What the summary statistics do to the numbers.** The planning and
conservative lines are averages taken within an outcome-ranked family, month by
month, so their statistics are not a path's. The published trough of 17.34
crore sits at the 31st percentile of what a path in the model actually needs;
the published crossing at month 29 is eleven months before the median path's.

**What the model cannot say.** Imposing a signed rank correlation on ten
drivers, preserving every marginal exactly, moves nothing: the ninetieth
percentile of the need goes from 57.8 to 58.1 crore. What is missing is not
correlation between draws but causation between decisions and outcomes. Charging
the $52 price a penalty in retention and word of mouth, it stops being worth
taking once it costs about a tenth of both, measured by the odds of ever
turning profitable.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `drift-closed` | `dr-024`, `vocab-open-items` |
| `acquisition-named` | `open-07-29`, `open-07-30`, `premise-wedge` |
| `measurement-reordered` | `vocab-open-items` |

The batch run over those three changes reopened 23 loci, six of them reached by
more than one change, among them `07-open/index.html#table:7.1` and the
decisions ledger.

`reopens` was run before any page was edited. It named `dr-015`, `dr-024`,
`dr-020`, `dr-019`, `dr-016` and three ledger items, which is what the tool is
supposed to do when a decision is seeded: it warns that changing the decision
would reopen them. None of them is changed here. No closes-off list is touched,
no rejected alternative is added, no record moves from fixed. The batch's locus
list was worked page by page and most of its entries needed nothing, which is
the answer the protocol is asking for.

## What was edited

1. **The lever overclaim.** 05 section 3 said "Four parameters move it, and
   only four." The viable run moves ten. The four are the ones the plan commits
   to; the other six are the churn floor, the engineering headcount exponent,
   the tail handling floor, the speed of approach to the automation ceiling and
   the two foreign prices. Putting the churn floor back costs 1.9 crore of peak
   cash and 4.6 points of the chance of ever turning profitable; putting the
   engineering exponent back costs 6.6 crore and 5.6 points, more than either
   automation lever is worth. 05 section 5 now says so, the model page's
   scenario table says so, and `models/AIfred_model_rationale.md`, which
   originally said "nothing else differs", is corrected.
2. **What the planning line is.** 05 section 5 states that it is an average and
   not a path, gives the per-path distribution of what a path needs (median
   24.5 crore, 75th 39.6, 90th 57.8), places the published $1.95m at the 31st
   percentile, and notes that the round sizes in section 7 sit above the 90th,
   so the plan is not under-raised. Figures 5.2 and 5.4 carry the same
   correction in their captions, from the generator rather than by hand.
3. **The model prices a user, not a task.** Revenue is users times price, so
   DR-024's metered tail earns nothing in the published figures and the
   allowance is modelled as a cost cap alone. Stated in 05 section 5, in the
   model page's limits, and in DR-024's own status, which is where a reader of
   the decision would look.
4. **A new section 6, How users arrive.** The largest driver in the model had
   no section in the publication. It states what the model assumes about
   arrival and acquisition cost, the threshold below which half the paths never
   turn profitable, the sign reversal between the two configurations, and the
   fact that no channel is chosen. Sections 6 to 9 became 7 to 10, and the six
   cross-references of the form "05, n" that pointed past the insertion were
   moved with them.
5. **A number that does not reconcile.** The geography model assumes a median
   cost to acquire of Rs 1,150 in India, Rs 8,500 in the United Kingdom and
   Rs 11,200 in the United States. The partner review at `/08-review/` records a
   consumer fintech benchmark of US$1,340 to $2,140, marked to-verify there. The
   ranges do not overlap: the benchmark is eleven to seventeen times the model's
   United States median. Both halves now point at each other rather than sitting
   in the same publication unaware.
6. **The measurement order was wrong.** 05's closing section listed four things
   to measure "in descending order of how much they move the answer" and the
   largest was missing from the list. It now lists five, arrival first, and says
   the first has no instrument. `models/README.md` carried the same list and is
   corrected with it.
7. **Open items.** Two added, the acquisition channel and the three mechanisms
   the model does not have. Table 7.1 holds thirty.
8. **Models.** `aifred_harness.py`, `aifred_sensitivity.py` and
   `aifred_structural_probes.py` with their outputs, and
   `AIfred_model_critique.md`, which is the long form of everything above.

## The map

Two open items, `open-07-29` and `open-07-30`, each landing in the decision it
bears on; `vocab-open-items` at thirty. No new decision, no new invariant, no
new component: nothing in this batch is a position, and a map that grew a node
for a disclosure would be recording the session rather than the record.

## What this batch did not do

It did not change the model. Every improvement the critique proposes is listed
there and none is implemented, because rebuilding the revenue side or making
growth endogenous changes every published number and that is a decision, not a
correction. It did not choose an acquisition channel, which is the founder's
and is now an open item with a trigger. It did not touch the trust
architecture, the envelope, the classifier, the state machine, the vault or the
substitution boundary. And it did not edit batch 0006's own record, which
states the lever claim as the founder gave it that day; a batch record is
evidence of a session, and a session record edited afterwards is evidence of
nothing.
