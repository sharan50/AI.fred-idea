# A critical reading of the trajectory model

Companion to `aifred_model.py` and `AIfred_model_rationale.md`. Every number below comes from
`aifred_sensitivity.py` or `aifred_structural_probes.py`, both of which run the published model through
`aifred_harness.py` and refuse to report anything unless they can first rebuild `sim_viable.csv` character
for character.

---

## 1. What the model gets right, and it is not a small list

Sampling every driver rather than picking three columns is the correct instinct, and the argument in section 1 of
the rationale is better than most of what gets called scenario planning: blending the tenth percentile of revenue
with the tenth percentile of cost describes no world that can happen, and ranking whole paths avoids that. The
observation that falls out of it, that in the as-specified configuration the conservative family has more users
than the optimistic one, is the formal statement of negative unit economics and it is worth more than the rest of
the output.

The model is also reproducible to the bit, states its scenarios explicitly, and its rationale carries an honest
limits section. The critique below is about what that section does not say.

---

## 2. Is the principle statistically correct

The sampling is sound. The summary is not, in four separate ways.

**The published statistics are the optimistic end of what they describe.** The planning line and the conservative
line are averages taken within an outcome-ranked family, month by month. An average of paths is not a path, and
the minimum of an average is not the average of the minimums. Measured on the same twenty thousand paths:

| | published line | per path |
|---|---|---|
| Peak cash need | 17.34 crore | median 24.5, p75 39.6, p90 57.8 crore |
| Month revenue passes cost | 29 | median 40 |

The published trough sits at the 31st percentile of what a path in this model actually needs, and the published
crossover is eleven months earlier than the median path's. Neither number is wrong for what it is. Both are read
as though they were something else.

**The bands are conditioned on the future.** Families are selected by a score at month 60 and then their whole
trajectory from month 1 is drawn. The early months of the conservative line are therefore conditioned on knowing
how the path ends. There is no observation at month 6 that tells a founder which family they are in, so the bands
cannot be read as "what a bad run looks like while it is happening", which is exactly how a funding plan needs to
read them.

**The planning line has no probabilistic meaning.** Sixty-five per cent of one family mean plus thirty-five per
cent of another is neither a quantile nor an expectation, so no probability attaches to beating it. Separately,
the ranking score is `cum_cash + 0.00001 * revenue * 12`, whose second term is about 2.8e4 against a first term of
about 1.5e9. It is inert. The ranking is on final cash alone.

**The shocks cannot persist.** The monthly churn shock and the monthly growth shock are independent draws. Over
sixty months they average out, so the model contains no sustained bad run, which is the failure mode that actually
kills companies. Churn and growth are autocorrelated in every business anyone has measured.

Two further points of construction. The triangular distributions are bounded, so the probability of a driver being
worse than the elicited range is exactly zero: the churn floor cannot exceed 4.0 per cent, the automation ceiling
cannot fall below 68 per cent, the assisted floor cannot exceed 2.6 minutes. Ruin can only arrive by combination,
never by one thing being worse than imagined. And the outputs are quoted to three and four significant figures
from priors elicited to one, which reads as precision the model does not have.

The independence of the drivers is the assumption most people would attack first, and it turns out not to be the
problem. Imposing a signed rank correlation on ten drivers, preserving every marginal exactly, moves the ninetieth
percentile of the cash need from 57.8 to 58.1 crore and the share of paths that never turn profitable from 11.0 to
10.9 per cent. Independence is not what flatters this plan. What is missing is not correlation between draws. It is
causation between decisions and outcomes, which a copula cannot express.

---

## 3. What is left out, in the order it matters

**The levers are free.** This is the deep one. The viable scenario raises the India price by seventy-three per
cent and takes no penalty in churn or in word of mouth; it lifts the automation ceiling and cuts the handling
floor with no matching engineering spend. A model in which the numerator improves without the denominator paying
will always find the plan viable. Charging the price a penalty in both retention and growth and re-running:

| the $52 price costs | peak need, median | ever profitable | crossover |
|---|---|---|---|
| nothing, as published | 24.5 crore | 89.0% | month 40 |
| 10% churn, 10% growth | 33.3 | 75.8% | month 45 |
| 20% churn, 20% growth | 45.1 | 55.5% | month 56 |
| leaving the price at $30 | 48.1 | 74.4% | month 48 |

Read by the cash need, the higher price is worth taking while it costs less than about a fifth of retention and
growth. Read by the odds of ever turning profitable, which is the question a founder is actually asking, it stops
paying at about a tenth. That is the single most decision-relevant number in this document and the model as
written cannot produce it.

**Growth is exogenous, dominant, and reverses sign.** The referral and growth rate at month 1 owns 34 per cent of
the variance of the cash need and 40 per cent of whether the business ever works, more than every delivery-side
driver combined. There is no mechanism behind it: acquisition cost is charged per user acquired, but no spend buys
a user, so the model's most important variable is the one it can neither explain nor influence. Worse, its sign
depends on the regime. In the viable configuration, moving from the bottom decile of growth to the top takes the
cash need from 52 crore to 13. In the as-specified configuration the same move takes it from 96 crore to 199.
Growth is the best thing in the model or the worst, depending on a unit-economics fact that has to be established
first, so "grow faster" is not advice this model can give.

**Usage is a single number, so the allowance cannot be modelled.** `tasks_day` is one scalar for the entire user
base. Real usage is heavily skewed and an allowance binds only on its tail, which is the whole design intent.
Revenue is users times price, with no usage term at all, so the metered allowance the publication now specifies
earns nothing in the model. The central commercial decision of the revision is invisible to the instrument that is
supposed to test it.

**Staffing is frictionless.** Headcount is recomputed every month as minutes divided by capacity, up and down,
instantly, with no hiring lead time, no notice period, no severance and no minimum. Understaffing has no
consequence: no breached promise, no lost user. Capacity is deterministic when it is really a queueing problem, in
which the staffing needed for a service level rises faster than the mean workload.

**The two overhead scaling laws are guesses, and they are the second and third largest drivers.** G&A at 100 users
owns 16 per cent of the cash need; engineering headcount, its cost and its exponent own about 15 per cent between
them. On the planning line at month 60, engineering is 30 per cent of the cost base against delivery labour's 34
per cent. The publication argues about labour throughout. The model says engineering is nearly the same size and
is governed by an exponent the rationale itself calls the least examined number in it, while G&A, which owns more
variance than that exponent, appears in no falsification list at all.

**The financial statement is incomplete.** No tax of any kind: if the $52 is gross of India's eighteen per cent
GST, roughly a seventh of modelled revenue does not exist. No ESOP charge, no working capital, no collection
timing, so contribution is not cash. The exchange rate is drawn once and frozen for five years, when a business
earning dollars and paying rupees has a five-year currency path that is both a risk and a hedge. Loss and fraud on
delegated payments are not scaled to the value flowing through the delegation, only to a generic monthly incident.

**No cohorts.** Users are one blended pool, so "a first cohort that renews", which is what the seed round is
explicitly meant to buy, cannot be represented inside the model that sizes the seed round.

Competition, regulatory stop, platform policy shock, funding as a constraint and dilution are all absent, and the
rationale says so.

---

## 4. One thing to correct in the documentation

The rationale states that the viable scenario "moves four parameters, and only four" and that "nothing else
differs". The code moves ten. Besides the four levers it also improves the churn floor from a 3.2 per cent mode to
2.4, the engineering exponent from 0.34 to 0.27, the tail handling floor from 26 minutes to 20, the automation
half-life from 15 months to 11, and both foreign prices. Two of those are consequential. Putting the churn floor
back costs 1.9 crore of peak need and 4.7 points of the odds of ever turning profitable; putting the engineering
exponent back costs 6.6 crore and 5.7 points, which is more than either automation lever is worth. So part of the
gap between the two scenarios is assumed away rather than planned for, and the sentence "the gap between the two
scenarios is the plan" is not true of the code as written. Either the plan acquires two more commitments, retention
and the engineering exponent, or the viable scenario stops moving them.

---

## 5. How to improve it, in the order that buys the most

1. **Change what is reported before changing the model.** Quote per-path statistics, not statistics of an averaged
   line: the median and the eightieth percentile of what a path needs, and the distribution of the crossover month.
   Draw quantile fans rather than family means, and label them as bands rather than as paths. This costs nothing
   and removes a systematic optimism from the two most quoted numbers.
2. **Give price, volume and quality a demand response.** One elasticity on churn and one on acquisition, both
   stated and both testable by a priced waiting list, turn the price lever from an assertion into a trade.
3. **Make growth endogenous.** Acquisition as a function of spend, referral and saturation, so the model can trade
   cash for growth and so its dominant variable has a mechanism.
4. **Give usage a distribution across users and add the metered revenue term**, so the allowance the record now
   specifies can be tested as designed rather than as a cost cap.
5. **Let bad runs persist.** An AR(1) on the churn and growth shocks, or a two-state normal and stressed regime,
   restores the sustained bad quarter the model currently cannot have.
6. **Make the levers cost something.** The automation ceiling and the handling floor should be functions of
   cumulative engineering and tooling investment, so the viable configuration has to be paid for inside the model
   rather than asserted at the top of it.
7. **Add staffing friction and a service level.** Hiring lead time, notice periods, a floor that cannot shrink
   instantly, and a link from understaffing to handling time and churn.
8. **Put tails back.** Unbounded distributions for the ruin-relevant drivers, and explicit jump events for a
   regulatory stop, a platform policy change and a severe incident scaled to delegated value.
9. **Complete the financials.** Tax, ESOP, working capital, a collection calendar and an exchange-rate path.
10. **Calibrate and then check the calibration.** The measurement protocol already names what to measure. Add the
    update step, and then hold out the first six to twelve months of actuals and ask whether the model's own
    intervals covered them. A prior that is never scored is an opinion with arithmetic attached.
11. **Re-rank what to falsify.** The rationale's list leads with minutes per user per month. That is right as a
    regime test: it decides whether the unit economics can work at all. It is wrong as a sensitivity: inside the
    viable configuration, usage owns 1.5 per cent of the cash need while growth and retention own forty-three,
    and own four fifths of everything the model can explain about whether the business ever works at all.
    Measure minutes to find out which world you are in, then measure growth and retention, because they decide the
    outcome within it.

---

## 6. What this does not disturb

None of the above changes the direction of the finding. The as-specified configuration remains unfundable on this
model's own arithmetic, at 12.9 per cent of paths profitable within five years and a cash need that has not
troughed by month 60. The viable configuration remains a business. What the critique changes is the confidence
interval around the second claim, the size of the raise it implies, and which four numbers are worth measuring
first.
