# Batch 0009: growth becomes a mechanism, and a call gets a test

Recorded 2026-09-14. Two decisions from the founder, and one framing correction,
after the sensitivity had shown that the plan's largest variable had nothing
behind it and the review passes had shown that DR-021 left a category where a
test was needed.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `growth-two-mechanisms` | `dr-025`, `premise-wedge`, `open-07-29` |
| `telephony-eligibility` | `dr-026`, `dr-021`, `comp-telephony` |
| `raise-is-guidance` | `dr-015` |

## DR-025: growth is organic and marketing

The founder's position: growth is the sum of word of mouth compounding on the
installed base and a monthly media budget across Instagram reels, AI-influencer
placements, and the technology and business papers. The model now implements it.
`models/aifred_growth_model.py` reaches the published model the way the
sensitivity does, by executing `aifred_model.py` in pieces, and replaces only
the acquisition and acquisition-cost blocks; both are quoted in the file so a
reader can see exactly what differs. Every new parameter is drawn outside the
published random stream, so with marketing switched off it rebuilds
`sim_viable.csv` character for character and the two runs are comparable path by
path rather than only in aggregate.

What the model now says, and none of it is evidence:

- A user is worth about $1,172 after the cost of serving them, being $64 a month
  at month 36 against a 4.2 per cent monthly churn, a mean life of twenty-four
  months, at a seventy-eight per cent delivery margin.
- At $120 a paid arrival the payback is under three months; at $250, five.
- Fifteen per cent of revenue at $120 an arrival takes the peak cash need from
  24.5 crore to 15.0, the crossover from month 40 to month 25, and month-60
  users from thirty thousand to ninety thousand.
- The paid cost at which that advantage disappears is about $1,124 an arrival at
  fifteen per cent of revenue and about $671 at twenty-five. At five per cent of
  revenue the cash need is never worse than organic alone, even at $2,100.
- The bought share of arrivals is 38 per cent in month 1, settles near a quarter
  through the first year and falls to 14 per cent by month 60, while the
  absolute spend rises throughout. Media buys the base that word of mouth then
  compounds on, which is why its share falls as its spend rises. Figure 5.5.

The reading the record now carries: spend, spend early, and spend modestly until
the cost is measured, because a small budget is robust to being wrong about the
cost of an arrival and a large one is not.

The published trajectory in `sim_viable.csv` is left organic-only, so 05's
sections 5 and 7 remain the case where nothing is spent on being found, and 05,
6.5 says so. Promoting the marketing line to the published one changes every
figure on the page and is a decision rather than a correction.

## DR-026: a call is for account mapping, never for authentication

DR-021 scoped phone work to non-authenticating calls and left "non-authenticating"
as a category a reader had to interpret. The founder's test: a party is eligible
for phone work only where the desk asks for identity at the start of a call in
order to find the account, not in order to open it. A mapping key overheard by a
worker cannot be used to become anyone; a credential can. The test is the
institution's own workflow, recorded as a field in the party register beside the
desk numbers and the menu map, set when the entry is drafted rather than judged
by a worker on a live call.

It narrows DR-021 rather than reopening it: nothing from the vault is placed on
a call by the substitution component and the media path stays closed off. One
question is left open in 07: whether a mapping key may be spoken by a worker at
all, or whether the mapping step bounces to the user's own device as DR-021 has
it. This batch settles which parties may be called and not who says the key.

## The round sizes are guidance

05, 7 now says so in its own words, and Table 5.4's caption with it: the figures
are what the arithmetic of a modelled line asks for, and the round that gets
raised will be sized against what a lead investor will price and what the next
eighteen months actually need. Read the shape, not the figures.

## The map and the counts

Two decision records, eight rejected alternatives, one premise edge and one
mechanism edge. DR-025 is stamped assumption rather than decision, following
DR-019's precedent, because its mechanism is fixed and every number behind its
marketing half is a prior; the harness would otherwise fail the page on its own
chips. The ledger reads twenty-six records, twenty-one fixed, three amber and two
fixed on their shape with modelled numbers under them. `open-07-29` is rewritten:
the channel is no longer open, the cost of an arrival through it is.

## What this batch did not do

It did not promote the marketing line to the published trajectory, which is the
founder's call and would rewrite every figure in 05. It did not name a cost per
paid arrival, because there is no evidence for one and the break-even is the
honest form of the same claim. It did not answer who says a mapping key on a
call. And it did not touch the four levers, the ratio or the funding table's
shape.
