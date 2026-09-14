# Batch 0013: the second adversarial round

Recorded 2026-09-14, after batch 0012. The adversarial pass on batch 0012 found
that three of its eight corrections had landed in 05, 8 and in the model files
and had not been carried to the decision record, the open items, or the
non-geography model that sections 5 to 7 actually run on; that one correction
had been written so that the sentence contradicted the arithmetic printed inside
it; and six things the first round missed. Every figure below was re-derived
before it was written.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `the-plan-of-record` | `dr-023`, `open-07-44` |
| `the-uncapped-budget` | `dr-025`, `open-07-45` |
| `routed-spend` | `dr-024`, `open-07-46` |
| `the-gate-sentence` | `dr-023`, `open-07-42` |
| `carry-the-corrections` | `dr-023`, `open-07-25`, `open-07-40` |

## The one outright error

**The gate paragraph stated the opposite of the arithmetic inside it.** Batch
0012 wrote that at both gates met the standing cost is about $122,000 a month
against about $97,000 of foreign subscription revenue, "so a gate covers the
standing cost". It does not: $97,000 against $122,000 covers four fifths of it
and nothing beyond. The medians reproduce exactly, Rs 1,697,056 and Rs 3,420,526
scaled by twenty to the power of a quarter, and the unscaled sum is $57,501,
which is covered. So the gates look as though they were struck against the
unscaled figure, and with the scaling in they are about a quarter too low. That
is what the paragraph now says, and it is what Table 7.1 said all along.

## The finding that matters most, and it is not in the geography at all

**The published line contains a geography it does not pay for.** This was in the
model before any batch in this session and nothing had noticed it.
`aifred_model.py` opens the United Kingdom around month 20 and the United States
around month 36, which is precisely the late sequence 05, 8 finds worse than not
expanding. It charges each market's entry cost and its monthly counsel. It does
not charge a foreign entity's standing cost, it has no night premium, and it has
no foreign churn multiplier; and the growth model buys foreign paid arrivals at
the Indian channel price and pays the Indian referral incentive on foreign word
of mouth.

The same run with both launches suppressed is now
`models/sim_growth_india_only.csv`, and the gap is the size of the finding:
revenue per user at month 36 falls from $69.77 to $58.61, users at month 60 from
95,171 to 59,914, and the cash need from 14.05 crore to 12.78. So about a third
of the base and eleven dollars of the revenue per user are foreign, and the
geography model charges Rs 0.95 crore a month by month 36 and Rs 2.60 by month
60 of standing cost, Rs 7.6 crore cumulatively to month 36 and Rs 55.5 to month
60, that the published line never pays.

Section 7 is the part that bites. Its round sizes are the run's window burn times
a 1.3 buffer, and they reproduce: 15.97 crore through month 18 and 2.29 after it
on the planning line, 17.62 and 9.02 on the conservative one. On the sequence
DR-023 actually adopts, the same arithmetic gives 22.30 and 22.26 crore, so the
post-month-18 requirement is about Rs 22 crore rather than 9. Which run is the
plan of record is a decision and not a modelling question, so it is
`open-07-44`, amber, with the three ways out named: make the published line
India-only, give it the geography model's costs, or make the geography run the
plan and re-size section 7 against it. Until then 05, 6.5 and the instrument's
limits both say that sections 5 and 7 understate the cost of the geography they
contain.

## Two assumptions larger than the parameters beside them

**A budget held at a share of revenue meets a channel that saturates, and
nothing caps it.** The cost of a bought arrival at home rises from $122 in month
1 to $490 by month 36 and $1,515 by month 60. A user is worth $1,291 on the same
page, so at month 60 the marginal bought user does not pay back at all: at $56 a
month of margin it needs twenty-seven months and the mean life is twenty-three.
Batch 0012 wrote that payback as "a year and a half", which was wrong. Abroad it
is worse, and the figures batch 0012 quoted were the rejected sequence's: on the
sequence of record the run pays about $2,938 a paid arrival in the United Kingdom
and $1,839 in the United States by month 36, and $8,423 and $5,352 by month 60,
so it runs clean through the review's benchmark rather than under it. The
break-even in 05, 6.2 is struck on the input anchor and therefore does not test
this. `open-07-45`.

**The commerce layer's threshold conversion was wrong by about nine times, and
its real assumption was never stated.** The working note converted Rs 25 to 50
crore a year of routed spend to four to seven and a half thousand subscribers.
The model routes Rs 48,204 a month per Indian subscriber, which is Rs 5.8 lakh a
year, so the threshold is about 430 to 870 subscribers and the base passes it at
months 4 and 9. Merchant volume was never the binding constraint; the twelve to
twenty-two months it takes to sign merchants is, and no growth rate shortens it.
So batch 0012's "the leverage now lands inside the window" is withdrawn.

What the correction exposes is the larger assumption: Rs 48,200 a month is
roughly ten times what an Indian subscriber pays for the service, about 11.6
purchase tasks a month at Rs 3,500 each, rising to Rs 88,150 by month 60 as the
base turns partly foreign at four times the Indian basket. The 1.2 per cent take
rate is the small assumption and the routed spend is the large one, and nothing
has measured either. `open-07-46`, and a paragraph in 05, 9. The note that
carried the wrong conversion now carries a dated correction rather than a silent
fix, because it was the source of the page's error.

## Two more limits on the instrument

**Serving a foreign market costs almost nothing more per task.** The only foreign
delivery penalty is a friction term subtracted from the blended automation share,
weighted by the foreign share of users and decaying on a six to twenty-two month
half-life, with no floor and no engineering spend attached. Nothing makes a
foreign task more likely to need the human-led tail, take more worker minutes, or
start from less accumulated experience. A base 41 per cent foreign at month 36
carries 4.8 per cent more handling time per task than an India-only base, and at
month 60, 52 per cent foreign, 2.3 per cent. Labour is a smaller share of revenue
abroad than at home, 15.9 per cent against 18.5 at month 36, because the price is
double and the cost of service is all but identical. The cost of rebuilding the
workflow library against a second country's institutions, which the round plan
asks the Series A to buy, is already granted for free in the run that argues for
going abroad.

**The night-cover finding was stated only in a limits section**, and 05, 8 still
said only that staff carry a night and language premium. Both limits are now on
the instrument page, which is ten limits rather than eight.

## Corrections carried where they had not been

- DR-023 still said "roughly ten times the Indian figure" and quoted $885 and
  $1,165 flat. It now carries 7.4 and 9.7 and the saturating cost the sequence
  actually pays.
- Table 7.1's acquisition-cost item did the same, and named a trigger that
  cannot answer it: a priced waiting list measures conversion and willingness to
  pay, not a cost per arrival, and has no United States instrument in it at all.
  The trigger is now two weeks of actual media, with the American figure marked
  as having no instrument until a market is open there.
- The gate item's trigger was the same waiting list, which cannot price a
  country lead, counsel, accounting, a registered office or insurance. It is now
  quotes and then the founder's decision, and it names the night-cover item as
  the one that must be answered first, because the gate turns on it.
- The allocation rule was filed as an assumption awaiting measurement when the
  item itself says nothing in the record decides it. It is a rule to choose, so
  it is amber, the founder's, and wants a decision record.

## What was edited

`docs/05-business/index.html` sections 6.2, 6.5, 8 and 9;
`docs/05-business/model.html`, Table 5.8's growth row and two new limits, the
count corrected to ten; `docs/07-open/index.html`, three rows retriggered, one
refixed and three added, the caption recounted to forty-six;
`docs/decisions/dr-023-geography-sequencing.html`;
`models/aifred_growth_model.py`, which now writes
`models/sim_growth_india_only.csv`; `models/AIfred_geography_and_data_layer.md`,
with the dated correction; `tools/depmap/graph.json`, three new open nodes and
`open-07-40` refixed to amber.

## The checks

`node tools/depmap.mjs check --warnings`: clean, 402 nodes, 633 edges, the one
known `refused-policy` warning. `selftest`: clean. `node tools/verify.mjs`:
clean, 42 pages. Both model self tests clean: the growth model still rebuilds
`sim_viable.csv` character for character with marketing off, and the geography
model still rebuilds all four `geo_*.csv`. Every figure written in this batch
re-derived from the CSVs first, including the funding windows, the gate medians,
the routed spend per subscriber and the foreign delivery penalty.

## What this batch did not do

It did not choose the plan of record, cap the budget, re-strike the gates, or
price night cover: all four are the founder's, and all four are now open items
with triggers that can actually answer them. It did not add a foreign entity's
standing cost to the unit-economics model, because doing so would change every
number in sections 5 and 7 and that is the same decision as `open-07-44`. And it
did not build a reversion run for the published line, which 05, 5 still says.
