# Batch 0014: the coherence pass on batch 0012

Recorded 2026-09-14, after batch 0013. The coherence pass on batch 0012 ran
while batch 0013 was being written, so two of its fifteen findings had already
been fixed by it and are not repeated here. The remaining thirteen are small and
exact, and they are the kind a reader checks: a count in a standfirst, an
ordinal pointing at the wrong item in its own list, a figure quoted as one
statistic beside a figure quoted as another.

## The one that changes a number

**Table 5.3 compared an in-month share against a sustained one.** The row read
"Paths profitable by month 36: 0.9 per cent against 84.1". The 84.1 is the share
of paths profitable from month 36 onward; the 0.9 is the share merely positive in
that month. On the sustained definition the left cell is 0.3 per cent, and on the
in-month definition the right cell is 94.2. Before the promotion the pairing was
in-month on both sides, so the definition moved on one side only. The row is now
"Paths profitable from month 36 onward", at 0.3 against 84.1, and the row below
is "Paths profitable in month 60", where the two definitions coincide.

## Three about the channel mix, and one about a decomposition

**$120 is not the cheapest channel's price.** It prices short video, which
carries three fifths of the budget. The cheapest channel is earned press at $42,
which 05, 6.1 already says cannot be scaled with money, so the page contradicted
itself two sections apart. The instrument carried the same mislabel in a field
called `cheapest_channel_anchor_usd`, now `short_video_anchor_usd`, and the
pages, DR-025 and the readme all say short video.

**$122 is the month-1 figure and not the first year's**, which averages $131.
Corrected in 05, 6.2.

**The routed-spend decomposition did not produce its own total.** 11.6 purchase
tasks at Rs 3,500 is Rs 40,600, not the Rs 48,200 the run shows: the run is
driven by the means of the triangular priors, about 12.1 tasks at Rs 4,000, not
by their modes. The page now gives the means and names the modal figure as a
sixth lower, because a reader who does the arithmetic should land where the model
lands.

## Section 10's list did not match itself

Three separate errors in one paragraph, all of them from batch 0012's
reordering. It said willingness to pay "sits with the second of those, being the
India price the sensitivity now ranks second", when the second item in its own
list is general and administrative cost and the India price is not in the list at
all. It then said "the second is answered by the measurement protocol", which
answers the fourth. And it claimed the order was the model's own, when neither
what a paid arrival costs nor willingness to pay is a sampled driver in the
sensitivity and churn, listed third, is the weakest of the four that are. The
paragraph now says the order is the model's own where the model has an opinion,
which is for three of the five, and each of the five is matched to the instrument
that actually answers it.

## The rest, each a pointer or a count

- The model page's standfirst counted seven limits against ten, and had been
  wrong by one before batch 0013 added two.
- "The last three" limits are the pricing, acquisition and token ones, which
  predate the geography work; the geography-derived three are fourth, fifth and
  sixth. Both sentences corrected.
- Table 5.8's growth row pointed at "the eighth limit below" for the unpriced
  geography, which is the fourth.
- The same row stated the foreign-led window as months 8 to 14, which is DR-023's
  commitment and not the run's draw. The row now gives both.
- The run section's source list named `geo_growth_foreign_led.csv` where the
  sequencing table quotes `geo_growth_foreign_led_nocommerce.csv`, and said every
  figure on 05 comes from `sim_growth.csv` after section 6.5 began quoting
  `sim_growth_india_only.csv`. Both named.
- DR-019 still carried the withdrawn commerce conversion, "meaningful from four
  to seven thousand subscribers". It is about four hundred.
- The review pointed at "06, 4.2" for the legal pack, which became 4.3 when the
  roadmap gained its sequence-and-gates subsection; the review's superseded
  callout grandfathers its section numbers for 00 only, so this one was simply
  stale.
- Two pointers written "06, 4.4" were anchored at section 4. Both now land on
  4.4.
- The geography script's own docstring still said the American figure sits
  inside the benchmark band and called the even split the conservative reading of
  expansion without qualification. Both corrected to what batch 0013 established.

## The figures, checked and clean

The pass regenerated both figure scripts against the current CSVs and diffed all
five figures on 05 against the page: path data, in-figure labels, descriptions
and captions are byte-identical. That is the check batch 0012's largest defect
would have failed, and it now passes.

## What was edited

`docs/05-business/index.html` sections 5, 6.2, 6.3, 8, 9 and 10;
`docs/05-business/model.html`, the standfirst, Table 5.8's two rows, the run
section and the limits preamble; `docs/decisions/dr-019-the-endgame.html`;
`docs/07-open/index.html` and `docs/08-review/index.html`, one pointer each;
`models/aifred_geo_growth.py`, the renamed field and the docstring;
`models/README.md`.

## The checks

`node tools/depmap.mjs check --warnings`: clean, 402 nodes, 633 edges, the one
known `refused-policy` warning. `selftest`: clean. `node tools/verify.mjs`:
clean, 42 pages. The geography self test still rebuilds all four published runs
character for character.

## What this batch did not do

Nothing new was left open: the four decisions batch 0013 recorded are still the
founder's, and no finding in this pass needed one. The measurement-protocol
pointer now names the instrument for each of the five measurements, but the
first of them, what a paid arrival costs, still has no instrument in the record
beyond a budget, which 05, 10 says in its own words.
