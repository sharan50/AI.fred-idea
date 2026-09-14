# Batch 0010: the name rule, the NPS floor, and the published line

Recorded 2026-09-14, after batch 0009. Three instructions from the founder, one
of them a narrowing of capability, one a condition on a mechanism, and one a
promotion that moves every number on 05.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `no-name-absolute` | `dr-027`, `dr-026`, `open-07-31`, `comp-telephony` |
| `nps-floor` | `dr-025` |
| `promote-the-growth-line` | `dr-025`, `vocab-open-items` |

## DR-027: no name ever reaches a worker

The founder's reasoning, which is the part worth recording: the exposure is not
the name and it is not the context, it is the pair. A card has to carry context,
because the context is what makes the difficult work possible; context alone is
close to useless for finding a person. Add a name and the same context becomes
an identification in a search box, in minutes. Since the context cannot be taken
away without taking away the work, the name is what must never be present.

So the given-name exception recorded in batch 0008 is withdrawn, and with it
every place a name reached a worker: the need-to-know filter in 04, 1.1 admits
none, the worked card in 04, 1.4 states none and carries the refusal line
instead, and the two journeys in 01 that had a worker give a first name no
longer do.

The capability narrows with it. A call is eligible only where the account has
already been mapped by the automated identity submission at the start of it,
which DR-026 fixes as a property of the party. If, after that, the party's
process needs the worker to state a name, or would tell the worker something
identifying, the task type is excluded rather than attempted with a careful
script: a channel that can be made safe only by a person remembering a rule is
not fool-proof. The founder's own example decides it, and the record carries it:
a desk asking for a relative's details hands a worker an identification, because
the card already says what the task is about.

`open-07-31` is closed as a decision and kept in place. What remains is
operational rather than a question of principle: which task types the rule
excludes, party by party, as the register is drafted.

## The organic mechanism has a floor

DR-025 said growth is two mechanisms and left the organic one as a rate. The
founder's condition: word of mouth at that rate holds only while the product is
worth recommending, and the floor is a net promoter score of 60 or above on the
paying cohort. Below it the organic half is not assumed to hold and media is not
the remedy, because a score under 60 is a product finding and the verdict system
is where it is answered. It is now a condition in DR-025, a paragraph in 05, 6.1
and a gate in 06 beside the priced waiting list.

## The growth line is promoted

`sim_growth.csv` is now the line the publication quotes: the viable
configuration with both acquisition mechanisms in it, at $120 a paid arrival and
fifteen per cent of revenue in media, twenty thousand paths at seed 20260913.
`sim_viable.csv` is kept as the floor, the case where nothing is spent on being
found, and the growth model rebuilds it character for character when marketing
is switched off, which is what makes the two comparable path by path rather than
two runs that happen to disagree.

What moved, in the order 05 states it:

| | the floor | the published line |
|---|---|---|
| Paths profitable by month 36 | 53.6% | 84.1% |
| Paths profitable by month 60 | 89.0% | 100% |
| Labour as a share of revenue at m36 | 18% | 16% |
| Cash trough | month 28 | month 22 |
| Peak cash, planning line | $1.95m | $1.58m |
| Peak cash, conservative line | $5.57m | $2.30m |
| Revenue passes cost | month 29 | month 23 |
| Users at month 60 | 37,133 | 95,171 |

The conservative line is where the promotion tells most: it troughs at 20.5
crore in month 28 rather than 49.6 crore in month 56, because media stops the
slow-growth paths being slow. Per path the need is 15.0 crore at the median,
21.5 at the seventy-fifth percentile and 30.0 at the ninetieth, and the planning
trough now sits at the forty-fifth percentile of that distribution rather than
the thirty-first, so the headline number is a good deal less optimistic than it
was as well as smaller.

The sensitivity was re-run against the promoted line and it is a different
picture. The arrival rate owns ten per cent of the variance of the cash need
rather than thirty-four; the largest single driver is now G&A at a hundred users
at twenty-eight per cent, then the India price at twelve. Whether the business
ever turns profitable has almost no variance left to explain, because every path
does. What growth still decides is when, owning thirty-five per cent of the
variance of the crossover month. The measurement list in 05, 10 is reordered
accordingly: the cost of a paid arrival first, then G&A, then churn with the net
promoter score beside it.

Figures 5.1 to 5.4 are regenerated from the promoted run, and the generator no
longer carries a single number by hand: the crossing month, both troughs, both
exit months and the closing balances are all read off the CSV, so a regenerated
run moves the labels with the curves. Figure 5.4 needed new geometry, both lines
now leaving the frame rather than one.

## What this batch did not do

It did not draw the list of task types DR-027 excludes, which is the operations
lead's work against real party entries. It did not name a cost per paid arrival
as evidence: $120 is the modelled input the sweep varies around, and the
break-even remains the claim. It did not re-run the geography scenarios on the
promoted line, so Table 5.5 and the commerce threshold are still drawn from the
geography model's own runs, which have no marketing in them.
