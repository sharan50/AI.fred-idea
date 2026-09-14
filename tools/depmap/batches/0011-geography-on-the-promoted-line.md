# Batch 0011: the geography scenarios on the promoted line

Recorded 2026-09-14, after batch 0010. One instruction from the founder, and it
closes the gap batch 0010 left open in its own closing paragraph: the four
geography scenarios were still drawn from a model with no marketing in it, so
Table 5.5 and the commerce threshold sat on a different basis from the rest of
05.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `geography-on-the-promoted-line` | `dr-023`, `dr-025`, `open-07-25`, `open-07-40`, `vocab-open-items` |

The closure reaches ten sections on seven pages. It reopens DR-023 and DR-025,
neither of which changes as a decision: DR-023's sequence and gates and DR-025's
two mechanisms are both untouched, and what moves is the arithmetic each cites.

## What was built

`models/aifred_geo_growth.py` does to `aifred_geo_model.py` exactly what
`aifred_growth_model.py` does to `aifred_model.py`. It splits the published file
at its own boundaries, replaces only the acquisition and acquisition-cost
blocks, and quotes both the old text and the new so a reader can see what
differs. Everything else, the delivery side, the foreign entity costs, the night
premium, the commerce layer and the outcome bands, is the published code running
unmodified.

It adds no number the record did not already hold, which was the constraint
worth respecting here. The cost of a paid arrival abroad is the promoted line's
own $120 times the ratio between the geography model's own per-market
acquisition-cost medians, $12.93, $95.40 and $125.57 a user, so about $885 in
the United Kingdom and $1,165 in the United States. A channel's saturation is a
share of each market's own ceiling rather than of the home market's, and earned
press is capped in proportion to the ceiling for the same reason. Both foreign
figures sit below the consumer fintech figure of $1,340 to $2,140 that the review
carries, so on the only outside benchmark in the record the model is taking the
optimistic side abroad, and the record now says so.

Every new quantity is pure arithmetic on arrays the published file had already
drawn, so the random stream is untouched. With media switched off each of the
four published geography runs comes back character for character, which the file
checks before it will write anything.

## The result

| | India only | Expand late | Expand late + commerce | Foreign led |
|---|---|---|---|---|
| Profitable by m36 | 62 to 93% | 44 to 78% | 51 to 86% | 82 to 97% |
| Peak cash, conservative | $3.66m to $2.04m | $8.78m to $3.95m | $7.40m to $2.88m | $4.86m to $3.09m |
| ARPU at m36 | $59 to $59 | $63 to $62 | $72 to $70 | $107 to $92 |
| Contribution at m36, Rs cr a month | 1.67 to 5.69 | 0.51 to 4.24 | 1.18 to 5.93 | 8.0 to 16.07 |
| Users at m60 | 32,168 to 60,190 | 37,176 to 72,672 | 36,546 to 73,955 | 84,830 to 123,779 |

Three things to take from it.

**The ranking does not move.** Late secondary expansion is still the worst of
the four and foreign led is still the best, so nothing in the sequence DR-023
fixes depends on which acquisition mechanism is in the model. That is the useful
finding, because it is the one that could have gone the other way.

**The margin narrows.** The late sequence now roughly doubles the conservative
cash requirement over India only rather than nearly tripling it, 1.93 times
against 2.40, because media grows the Indian base that carries the foreign cost.
Every scenario is cheaper and earlier than it was, for the same reason the
unit-economics run was: media buys the base that word of mouth compounds on, and
at $120 a paid arrival the compounding is worth more than the media costs.

**The mix moves, and against the thesis.** This is the one finding that cuts
against the sequence rather than for it. An even split of the media budget
across live markets buys about seven times as many Indian arrivals per rupee, so
media lifts the foreign share where expansion was late and starved, from twelve
to twenty-four per cent of users at m60, and thins it where growth had already
been moved abroad, from sixty-three to fifty-two per cent, which takes
foreign-led revenue per user at m36 from $107 to $92. Part of the
purchasing-power arbitrage a foreign-led sequence exists for is bought back by a
media rule that is cheapest at home.

Nothing in the record decides that rule, and the model should not decide it by
default, so it is `open-07-40` rather than a position: how a media budget is
allocated across live markets, with the even split named as the conservative
reading of it and an allocation to marginal cost or to whichever market is short
of its gate named as the alternatives. DR-023 carries the finding in its status
section, because it bears on an amber decision, and 05, 8 carries it in the
page.

## The commerce layer

Two figures move and one does not. The take rate on routed spend is unchanged at
roughly 1.2 per cent, because nothing in this batch touches the take rate, the
monetisable share or the average transaction value. The share of revenue at m60
goes from twelve to fourteen per cent. The claim that commerce more than doubles
contribution at month 36 is withdrawn and replaced by the absolute figure: it
adds Rs 1.69 crore a month, which is more than twice what it added on the older
basis, but about two fifths rather than a doubling, because the subscription
base it is added to is no longer near break-even at that month. A ratio against
a number close to zero was flattering the layer, and the absolute addition is
the honest statement of it.

The merchant-leverage threshold is unchanged, because it is a GMV threshold and
not a growth one: meaningful terms at Rs 25 to 50 crore a year of routed spend,
which at the model's central spend per user is four to seven and a half thousand
subscribers. What changes is when the base gets there. On the published line it
passes four thousand at month 18 and seven and a half thousand at month 23,
against months 27 and 33, so the leverage now lands inside the twelve to
twenty-two month window the model allows for merchant agreements rather than
well after it.

## What was edited

- `docs/05-business/index.html`, section 8: the basis stated, Table 5.5's four
  rows rebuilt, the media cost abroad and its benchmark comparison added, the
  narrowed margin stated, and the mix finding written as a paragraph of its own.
  Section 9: the revenue share, the contribution claim and the timing of the
  merchant threshold.
- `docs/05-business/model.html`: the scenarios paragraph and the geography rows
  of Table 5.8, the four geography files named in section 3, the foreign-led
  limit extended with the two assumptions that now ride on the same unmeasured
  ratio, and the limit that read "nothing in it buys a user" corrected, because
  the published line does buy users and what is now a limit is that every number
  in the mechanism is a prior.
- `docs/06-roadmap/index.html`, section 4.2: nearly triples becomes roughly
  doubles.
- `docs/07-open/index.html`: `open-07-25` extended, because one wrong ratio is
  now wrong in the referral cost and the media cost at once; `open-07-40` added;
  the caption recounted to forty.
- `docs/decisions/dr-023-geography-sequencing.html`: the rejected alternative's
  figures, the closes-off bullet, and a status paragraph carrying the mix
  finding.
- `docs/decisions/dr-025-growth-two-mechanisms.html`: the geography model named
  in where-this-is-specified.
- `models/aifred_geo_growth.py`, `models/geo_growth_*.csv`,
  `models/geogrowthsum_*.json`, `models/geogrowthsum_all.json` new;
  `models/README.md` and `models/AIfred_geography_and_data_layer.md` updated,
  the note with a section 1a carrying the promoted basis beside the basis it is
  a companion to.
- `tools/depmap/graph.json`: `open-07-40` with two `lands-in` edges,
  `vocab-open-items` recounted to forty with its member, a `mentions` locus on
  `dr-025` at 05, 8, and `open-07-30`'s locus repointed at the renamed limit.

## The checks

`node tools/depmap.mjs check --warnings`: clean, 396 nodes, 627 edges, the one
known `refused-policy` warning. `node tools/depmap.mjs selftest`: clean.
`node tools/verify.mjs`: clean, 42 pages, 6 of 6 mandated figures.
`python3 aifred_geo_growth.py --selftest`: all four scenarios rebuild their
published CSV character for character. No figure is drawn from the geography
runs, so no figure is regenerated.

## What this batch did not do

It did not decide the media allocation rule, which is `open-07-40` and the
founder's to take. It did not name a measured cost per paid arrival in any
market: the home figure is still the modelled input and the foreign ones are
still that input times a ratio nobody has measured. It did not touch the
unit-economics trajectory, the funding line or any figure, all of which are
drawn from `sim_growth.csv` and unaffected. And it did not draw the list of task
types DR-027 excludes, which is still the operations lead's work against real
party entries.
