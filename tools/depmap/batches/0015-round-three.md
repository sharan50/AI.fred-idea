# Batch 0015: round three, both passes

Recorded 2026-09-14, after batch 0014. The third round of the change protocol's
two passes returned twenty findings between them, and unlike the first two rounds
almost none was drift from a recent edit. They are defects in the economics the
record has carried since it was written, and the largest of them is not in the
geography at all.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `no-tax-in-either-model` | `dr-024`, `open-07-47` |
| `the-floor-is-a-step` | `dr-006`, `open-07-48` |
| `the-allowance-is-in-no-code` | `dr-024`, `open-07-49` |
| `what-a-user-is-worth` | `dr-025` |
| `the-seed-window` | `dr-023` |
| `the-fallback-on-its-own-rule` | `dr-025` |
| `the-split-was-a-path-mean` | `dr-025` |

## No tax, anywhere, in either model

The largest single omission in the economics, and the record found it itself and
then left it in a working file. `models/AIfred_model_critique.md` says plainly
that there is no tax of any kind and that a seventh of modelled revenue may not
exist; no page carried it. Neither model has a consumption tax term on either
side.

Dividing the Indian price by 1.18 and the British by 1.20, which is
`models/sim_growth_net_of_tax.csv`, moves the cash trough from 14.1 crore to
18.7, the conservative line from 20.5 to 28.5, revenue per user at month 36 from
$70 to $59, the crossing from month 23 to month 26, and the share of paths
profitable from month 36 onward from 84 per cent to 71. That is a larger swing
than the unpriced geography batch 0013 disclosed. Whether the quoted prices are
gross or net is a question about the price rather than about the model, and it
also decides whether the priced waiting list tests $52 or $61. `open-07-47`,
amber, with counsel named on the treatment of a cross-border service, and a
limit on the instrument page. Until it is answered the page says the safe reading
of every figure on it is the net-of-tax one.

## The floor is a step cost and the two pages that price it pointed at each other

04, 2 says the floor is a step cost, each shift and each market a jump, and ends
"05 prices both". 05, 4 said the floor is "priced as a step in 04". Neither model
has a step term: both carry a per-head seat cost rising from about Rs 3,200 a
month to at most 1.9 times that, and nothing keyed to a shift, a room or a
market. At the published line's cash trough the whole attested site of DR-006,
three shifts, badge-controlled substitution zones, camera coverage, a
glass-walled two-person zone and locked-down workstations, is carried at about
Rs 5.2 lakh a month, 1.3 per cent of cost. That is a co-working desk. DR-006
triggers the site on the first foreign market going live, which in the published
line is month 20 and under DR-023 is months 8 to 14, so the step lands in the
months around the trough the seed is sized against. `open-07-48`, and a limit.

## The metered allowance is in no line of code, and the record asserted its sign twice, oppositely

05, 5 and DR-024 both said the allowance is "modelled as a cost cap alone, which
understates it". There is no cap. Tasks a user a month is a demand prior drawn
between 15 and 40 whose mode is the 26 the plan sells, and 56 per cent of the
published paths average above that figure, by 2.6 tasks a month. So the model
neither bills the overage the allowance exists to bill nor declines to serve it:
it is missing on both sides and the net sign is unknown. Table 7.1 meanwhile said
all three missing mechanisms "flatter the plan in a known direction", which is
the opposite assertion about the same item, dated the same day. All three places
now say the same thing.

The related gap is that nothing measures the volume half of the governing ratio.
The measurement protocol measures minutes a task; how many tasks a household
brings is a demand question thirty tasks chosen by the operator cannot answer,
and it owns two fifths of the variance of minutes per user per month.
`open-07-49`, and the protocol now states the limit itself, along with a second:
its sample is ten per tier against an intended mix of 45, 50 and 5 per cent,
which over-samples the human-led tail more than sixfold, and its instruction to
run against the operator's own accounts removes the delegation boundary, so the
bounce threshold cannot trip and the assisted-minutes floor is measured under a
looser operating model than the one it has to hold in.

## What a user is worth was a gross margin presented as a net one

"A user is worth about $1,291 after the cost of serving them" used an eighty per
cent delivery margin, which is revenue less labour and tokens. It excludes
engineering, compliance, overhead, one-time costs and payment fees, which the
page's own Figure 5.1 shows are the larger half of the cost base. All in, month
36 contributes $27 a user, or $37 before any acquisition spend, so the same
arithmetic gives $637 to $865. Both figures are now on the page, with the
distinction named: the higher is what an investor compares against a cost per
arrival and the lower is what pays for the company.

## The acquisition cost series was a path mean labelled as the planning line

`growth_split_viable.csv` wrote `o["adds_paid"].mean(1)` under a `_plan` suffix,
so the cost series quoted on three pages was a mean across all twenty thousand
paths while everything around it was the planning line, and section 6.2 divided
one by the other. Its month-60 user count is 108,599 against the planning line's
95,171. The columns now carry a `_mean` suffix, `sim_growth.csv` already held the
planning-line series, and Figure 5.5 is regenerated from it, which also moves the
figure onto the same basis as the other four. The series becomes $122, $140, $471
and $1,368 rather than $122, $141, $490 and $1,515; the first-year average $130;
the bought share at month 60 a sixth rather than a seventh; and the month-60
payback about twenty-five months rather than twenty-seven, still longer than the
twenty-three-month mean life.

## The seed window was never re-sized, only the window after it

Batch 0013 put the post-month-18 correction in Table 7.1 and left the seed
figure, which is the round actually being raised. On the foreign-led sequence
DR-023 commits to, compared without its commerce layer, the same window burn
times the same 1.3 buffer gives 22.3 crore through month 18 and 22.3 again after
it, which is $2.51m and $2.50m against the $1.98m section 7 states: a seed 27 per
cent larger and a Series A two and a half times it. So the seed band is not
"deliberately well above" the arithmetic on the sequence of record; its floor is
exactly equal to it. The staging was inconsistent with the same decision as well:
Table 5.4 had the Series A, at month 18 to 22, buying "a second geography open",
while DR-023 opens the United Kingdom between months 8 and 14, inside the seed
window, so the entry cost and the standing cost are the seed's to carry. Both
corrected.

## The fallback was published only on the lines that flatter it

The organic-only floor is quoted on its planning line, 17.3 crore, and on its
median path, 24.5. On its conservative line, which is the line section 7's own
rule says to raise against, it needs 49.6 crore, about $5.57m, troughs at month
56, shows its first positive month at month 57, ends month 60 still 48.7 crore
behind and reaches nine thousand users. So the downside of the media bet is
$2.30m against $5.57m and not the three crore the planning lines show. The reason
is the band construction: in a world with no media the worst-terminal-cash family
is the company nobody found. And "Series B is genuinely optional" is a statement
about an averaged line with no negative month after month 36; beneath it 13.1 per
cent of paths have one and 11.3 per cent need more than half a crore.

## Nine smaller corrections

- Section 10 said the sensitivity ranks only three of the five measurements when
  four of them are sampled drivers, and listed churn third when the sensitivity
  puts it last of the four, at a fiftieth of the variance G&A owns. The list is
  reordered to the sensitivity's order and says why churn is last.
- Section 6.3 closed by saying the break-even figures test the saturating cost
  "because they are stated against the same saturation". They are stated against
  the input anchor, as Table 7.1 already said. Testing a cap needs a sweep over
  the budget rule, which the model does not carry.
- The commerce figures are the late-expansion scenario's, which is the sequence
  DR-023 rejects, because there is no India-only commerce run. Marked, with the
  sequence-of-record figures given beside them.
- "About twice the contribution" in section 8 against a table two rows above
  showing 2.58 times.
- DR-023 introduced three assumptions under the count "one" and 05's table
  caption counted the same set as two. Both say three.
- DR-025 still called $120 the cheapest channel's price, two lines from its own
  sentence naming press as the cheapest arrival in the mix.
- DR-025 had $122 as the first-year figure, gave a $250 payback of five months
  that belongs to the floor's margin rather than the published line's, and
  attributed $2,100 to the review, which carries $1,340 to $2,140.
- DR-019 converted a $10-to-$40 panel range into a "one to three per cent" of
  revenue range, which does not keep its own four-to-one ratio. It is one to five
  per cent.
- Table 7.1's last row pointed at "the measurement work below" from the bottom of
  the table, and two cross-references whose section numbers were right landed on
  the parent section.

Table 5.3's 84.1 per cent was in no file, so `summary_growth_viable.json` now
carries the sustained-profitability figures and the planning-line cost series.

## The checks

`node tools/depmap.mjs check --warnings`: clean, 405 nodes, 636 edges, the one
known `refused-policy` warning. `selftest`: clean. `node tools/verify.mjs`:
clean, 42 pages. Both model self tests rebuild their published CSVs character
for character. Twenty-four figures written in this batch re-derived from the
CSVs, which caught two of my own roundings: the month-60 payback is twenty-five
months and not twenty-four, and the commerce layer on the sequence of record is
5.54 crore a month at month 36 and not 4.81.

## What this batch did not do

It did not answer any of the seven decisions now open for the founder: the plan
of record, the budget cap, the gate arithmetic, the allocation rule, the tax
treatment, the floor's step cost, and whether the revenue side is rebuilt to
price the tail. It did not add a tax term, a floor step or an allowance to the
models, because each of those changes every number on 05 and each is one of those
decisions. And it did not build an India-only commerce run, which is what would
let section 9 quote the layer on a sequence this record has not rejected.
