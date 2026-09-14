# Batch 0012: what the two fresh-context passes found

Recorded 2026-09-14, immediately after batch 0011. No new instruction from the
founder. This batch is the change protocol working: the coherence pass and the
adversarial pass that §9.3 and §9.4 require were run on batch 0011 with only
`docs/` and `models/` in front of them, and between them they returned thirty
findings. Twenty-two were drift, most of it left by batch 0010's promotion of
the growth line. Four were defects in batch 0011 itself. Four were assumptions
the record states as findings.

The useful lesson, and the reason this record is worth reading before the next
batch: batch 0010 changed the run under five figures and two tables and edited
the numbers a reader would look up, while leaving the numbers a reader would
only hear. Alt text, figure captions, a limit on the instrument page and a
lifetime value stated twice all still carried the withdrawn run. A promotion is
not finished when the headline numbers are right.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `figures-on-the-published-run` | `vocab-open-items` |
| `foreign-organic-cost` | `dr-023`, `dr-025`, `open-07-25` |
| `like-for-like-sequencing` | `dr-023` |
| `what-the-input-is` | `dr-025`, `open-07-29` |
| `the-allocation-rule` | `open-07-40` |
| `gates-against-the-cost-model` | `dr-023`, `open-07-42` |
| `night-cover-step-cost` | `open-07-43` |

## The four defects in batch 0011

**A foreign word-of-mouth arrival was priced as an Indian one.** The promoted
mechanism charges a referral incentive rather than an acquisition cost for an
organic arrival, and batch 0011 carried the home figure of Rs 250 into every
market. Instrumenting the loop shows 81.7 per cent of foreign arrivals in the
late sequence and 94.9 per cent in the foreign-led case are organic, so four
fifths to nineteen twentieths of the foreign intake was being bought at an
Indian price while 05, 8 went on saying foreign acquisition costs ten times the
Indian figure. The incentive is now scaled by the same published ratio, Rs 1,844
in the United Kingdom and Rs 2,428 in the United States, and the pessimistic
bound is reported beside it: if a foreign organic arrival costs what the
geography model's own per-market figure says, the late sequence needs 43.2 crore
of conservative cash rather than 35.5 and the foreign-led case 52.0 rather than
34.3, which makes it the dearest of the three. That bound is now
`geo_growth_bounds.csv`.

**Table 5.5 compared a scenario carrying the commerce layer against two without
it.** `foreign_led` has commerce on by the geography model's own definition. The
table's foreign-led column is now the commerce-off run,
`geo_growth_foreign_led_nocommerce.csv`, and on that basis the case reads very
differently: $3.85m of conservative cash against the late sequence's $3.99m,
where the old basis showed $4.86m against $8.78m. The cash argument for opening
early has largely gone; a contribution argument remains, about twice the
contribution at month 36 and fourteen more points of the chance of being
profitable by then. DR-023 now carries that qualification in the alternative it
rejects.

**The per-market media price quoted the cheapest channel at zero volume.** $885
and $1,165 are the reels anchors. Weighted by the modelled mix they are $1,093
and $1,439, and at the budget the run actually spends, about $1,518 and $1,419 an
arrival by month 36 and $3,114 and $2,269 by month 60. So the claim that the
model takes the optimistic side abroad was the wrong way round: it runs through
the review's consumer fintech band rather than under it. The same error was in
the home figure and is now stated on the page: the run pays about $122 an arrival
in month 1 and about $1,515 by month 60, so the $120 is an input and never was a
cost at scale.

**"Ten times the Indian figure" is not the ratio the code applies.** It is 7.4
for the United Kingdom and 9.7 for the United States, which is why two different
dollar figures came out of one "same ratio". Corrected in 05, 8, in DR-023 and in
Table 7.1's item.

## The four assumptions the record was stating as findings

**"Roughly double the conservative cash requirement" is a property of the band.**
The conservative line is an average within the family ranked fifth to twentieth
on terminal cash, so it lands at a different percentile of what a path needs in
each scenario: the seventy-second for India only, the eighty-third for the late
sequence, the seventy-sixth for foreign led. At matched percentiles the late
sequence needs 1.29 times India only at the median, 1.56 at the eightieth and
1.74 at the ninetieth, against 1.95 on the band lines. The direction survives
every percentile; the magnitude the page stated was the widest available.
`geo_growth_percentiles.csv`, and a sentence in the instrument's limits.

**The even split is what produces the mix finding.** Put the whole budget into
the home market and the late sequence's foreign share at month 60 is 7 per cent
rather than 24, and its conservative need falls from 35.5 crore to 29.9. The even
split is conservative on cash and not neutral on the mix, and the page said only
the first half. `geo_growth_allocation.csv`.

**The entity gates do not reconcile with the cost model behind them.** DR-023
sets 400 users in the United Kingdom and 600 in the United States to carry the
local cost base, but the model scales a foreign entity's standing cost with its
user count, and at both gates met that cost is about $122,000 a month against
about $97,000 of foreign subscription revenue. Either the gates were struck
against the unscaled figure and are too low, or the scaling is wrong. This is a
founder's decision and not a model's, so it is recorded rather than resolved:
`open-07-42`, amber, and a paragraph in 05, 8.

**The cost of serving a foreign market at night is a wage uplift and nothing
else.** The premium is scaled by the foreign share of users and applied to
general agents only, with no night term on supervisors or quality assurance, so
a market with five per cent of the users buys five per cent of a night shift and
the whole priced cost of night cover in the late sequence at month 36 is Rs 0.04
crore a month. 06, 4.4 requires a rostered crew per market with quality
assurance and escalation on the same shift. The step cost of the first foreign
user is what a 400-user gate turns on and the model does not contain it:
`open-07-43`, and an eighth limit on the instrument page.

## The drift batch 0010 left

Five figure descriptions and captions on 05 carried `sim_viable` numbers while
the curves beside them plotted `sim_growth`. Figure 5.1's description had labour
ending at 3.6 crore where the line ends at 9.7; its caption had engineering the
larger line for four years where the plotted lines cross at month 24. Figure
5.2's description said revenue was below cost for twenty-eight months and
crossed at twenty-three, which cannot both be true of one line. Figure 5.3's
description put labour at 18 per cent of revenue at month 36 where Table 5.3
says 16. Figure 5.2's caption put the median crossing at month 40, the floor's
figure, two paragraphs from the page's own 25.

The cause was that `tools/figures/forecast-05.py` derived the paths from the CSV
and left the prose typed by hand. Every number in every description and caption
is now read off the run, including the month the two cost lines cross, the
payment fees at month 60, the labour share at four months, the median path's
crossing and the as-specified comparison, so a regenerated run moves the words
with the curves as it already moved the labels.

Nine further pieces of drift, each one a place where the promotion had not been
followed through:

- The lifetime value of a user, $1,172, was the floor's. On the published line it
  is $1,291, at $70 a month against 4.3 per cent churn and an 80 per cent
  delivery margin. Corrected in 05, 6.2 and in DR-025.
- The instrument's limit on summary statistics still said the thirty-first
  percentile and eleven months; on the published line it is the forty-fifth and
  two, which 05, 5 already said.
- The reversion deltas in 05, 5 are measured on the floor, because no reversion
  run exists for the published line. Labelled.
- 05, 6.2 and 6.5 gave the floor two different peak-cash figures, 24.5 crore on
  its median path and 17.3 on its planning line, and pointed one at the other.
  Both are now labelled.
- Table 7.1 still listed "no spend buys a user" as a mechanism the model does not
  have, which DR-025 closed. The row is now two mechanisms, with the third
  recorded as closed and what replaces it named.
- The instrument said all seven scenarios carry the same acquisition mechanism.
  Five do; two are organic only by construction.
- The instrument's five measurements were the pre-DR-025 list in the pre-DR-025
  order, omitting the driver 05, 10 calls the largest. Reconciled, and G&A at a
  hundred users now has the open item 05, 10 promised it had: `open-07-41`.
- DR-023 pointed at section 4 for its own trigger, which is section 5; and 06
  attributed to it a net-promoter condition the record did not carry. DR-023 now
  carries both halves of the trigger.
- The decisions page said to keep five headings when copying the newest record,
  which is not amber and has four; and its provenance paragraph stopped at
  DR-024. Both corrected, with the ledger dated to the day its newest records
  were taken.
- The review's superseded callout said 05, 6 records that no channel is chosen.
  Three are chosen. Corrected to what is actually still open, which is the cost.

## What was edited

`docs/05-business/index.html` sections 5, 6.2, 6.3, 6.5, 8 and 9, with section 8
substantially rewritten; `docs/05-business/model.html` sections 2, 3 and 4;
`docs/07-open/index.html`, four rows changed or added and the caption recounted
to forty-three; `docs/decisions/dr-023-geography-sequencing.html`,
`docs/decisions/dr-025-growth-two-mechanisms.html`,
`docs/decisions/index.html`, `docs/08-review/index.html`; the three figures of
05 regenerated from `tools/figures/forecast-05.py`;
`models/aifred_geo_growth.py`, with the per-market referral incentive, per-market
media instrumentation, a commerce switch and the three new output files;
`models/README.md` and `models/AIfred_geography_and_data_layer.md`;
`tools/depmap.mjs`, whose number words stopped at forty; `tools/depmap/graph.json`,
three new open nodes and a repointed locus; `manifest.json`.

## The checks

`node tools/depmap.mjs check --warnings`: clean, 399 nodes, 630 edges, the one
known `refused-policy` warning. `selftest`: clean. `node tools/verify.mjs`:
clean, 42 pages, 6 of 6 mandated figures. `python3 aifred_geo_growth.py
--selftest`: all four scenarios rebuild their published CSV character for
character. Every figure quoted on 05, 8 and 05, 9 re-derived from the CSVs by a
script that knows nothing of the pages.

## What this batch did not do

It did not resolve the gate arithmetic or the night-cover step cost, both of
which are the founder's. It did not decide the media allocation rule. It did not
build a reversion run for the published line, so 05, 5 still quotes the floor's
two deltas and says so. And it did not re-price the commerce layer abroad, where
a 4.6 times foreign basket sits against an identical take rate and an identical
merchant-agreement window in all three markets, which the adversarial pass
raised and which belongs with the commerce arithmetic rather than here.
