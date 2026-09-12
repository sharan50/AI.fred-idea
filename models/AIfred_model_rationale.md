# AI.fred: probabilistic trajectory, rationale and funding plan

Companion to `AIfred_probabilistic_model.xlsx` and `aifred_model.py`. Twenty thousand Monte Carlo paths, sixty months, every driver sampled rather than assumed.

---

## 1. How the bands are drawn, and why it matters

A three-column scenario sheet takes the pessimistic value of every driver and calls the result the downside. Nothing that coherent ever happens: the world where churn is terrible is usually also the world where you are growing slowly, so the cash burn is smaller, not larger.

This model therefore ranks the twenty thousand paths by outcome, takes the fifth to twentieth percentile as the **conservative family** and the eightieth to ninety-fifth as the **optimistic family**, and averages within each. Every line on a band, revenue, cost, headcount and cash alike, comes from the same family of worlds. The **planning line** weights those two families 65 / 35 as you specified.

One consequence is worth naming early. In the as-specified scenario, the conservative family has **more** users than the optimistic one. That is not a bug. When contribution per user is negative, the paths that end with the best cash position are the ones that grew slowly. A model in which growth is the thing that hurts you is the formal statement of negative unit economics.

---

## 2. The two scenarios

**As specified** is the venture as written up: two tasks a day, $20 to $40 tiers, India first, UK and US later.

**Viable** moves four parameters, and only four, to where the earlier analysis said they would have to be:

| Lever | As specified | Viable | Why this one |
|---|---|---|---|
| Tasks per user per month | 46 | 26 | Delivery cost scales with usage, not with users. Metered allowances rather than an unlimited promise. |
| Blended ARPU, India | $30 | $52 | The complex tail is what people pay for; pricing it by user status rather than by access to that tail is the wrong axis. |
| Automation ceiling | 72% | 80%, reached faster | Workflow library plus routing, not model capability alone. |
| Assisted handling floor | 2.8 min | 1.7 min | Achieved by automating hold and IVR and by structured task cards, not by human practice. |

Nothing else differs. The gap between the two scenarios is the plan.

---

## 3. What the model says

| | As specified | Viable |
|---|---|---|
| Paths profitable by month 36 | 0.9% | 53.6% |
| Paths profitable by month 60 | 12.9% | 89.0% |
| Human minutes per user per month, m36 | 158 | 59 |
| ARPU at m36 | $37 | $64 |
| Labour as share of revenue, m36 | 85% | 18% |
| Engineering as share of revenue, m36 | 58% | 25% |
| Cash trough | never, still falling at m60 | month 28 |
| First sustained profit, planning line | not within 60 months | month 29 |
| Peak cash, planning line | $23.5m | $1.95m |
| Peak cash, conservative line | $31.8m | $5.6m |

The single ratio that separates them is minutes of human time per user per month against ARPU. At 158 minutes and $37 there is no scale at which the arithmetic recovers. At 59 minutes and $64 the business is a normal, fundable, capital-light services-plus-software company.

---

## 4. Driver rationale

Full ranges are on the Drivers sheet. The reasoning behind the ones that move the answer:

**Churn and its volatility.** Consumer assistant products churn hard once novelty fades, and the context profile that is supposed to create switching cost has not compounded yet in the first year. The conservative end assumes later cohorts churn at a multiple of the founding users, which is what normally happens when a product moves beyond the people who were already motivated. The optimistic end assumes the twin genuinely binds, so leaving means re-teaching a new assistant from scratch. Volatility is modelled as rising with penetration rather than staying constant, because heterogeneity is what scale actually buys you.

**Automation share.** The conservative end has institutional surfaces staying hostile: app-only flows, captchas, OTP at every step, processes that change without notice. The optimistic end has a workflow library that generalises across counterparties. Capability jumps are modelled as Poisson arrivals lifting the ceiling, because frontier releases are lumpy rather than smooth.

**Token economics.** Prices per token fall 3 to 8 per cent a month. Tokens consumed per task **rise** 0.5 to 4 per cent a month, because capability tends to be spent rather than banked: longer agent loops, richer context, more verification. The conservative case is that these roughly cancel for two years. This is why tokens never become the largest line in either scenario, and why the cost argument you started from pointed at the wrong variable.

**Human learning, eroded by attrition.** Handling time decays towards a floor, but an experience index is degraded every month by attrition of 22 to 55 per cent a year. Practice is real and it leaks. This is the formal version of the earlier disagreement: the learning curve helps, but it cannot be the structural advantage, because it walks out of the door.

**Business inflation.** Seat cost per head rises with headcount, by 1.15 to 1.9 times by the time the floor passes three hundred. Management wage inflation runs 10 to 20 per cent and widens further with scale, because people who have run a floor of that size are scarce and get bid up, while generalists do not. A room in your house is free at twenty heads and impossible at two hundred and fifty.

**Engineering.** Headcount scales as users to the power of 0.22 to 0.48. The conservative end is the version where every institution, geography and edge case needs bespoke work forever, so engineering never decouples. That exponent is the difference between a software company and an agency, and it is the least examined number in the whole model.

**Expansion.** UK entry between months 13 and 30, US between 26 and 50, each with an entry cost, a standing legal cost and an automation penalty at entry that decays as workflows are built for local institutions. The friction term is the honest version of the bounce problem: you do not arrive in a new country with your automation share intact.

**Compliance and incidents.** SOC 2 between months 10 and 24, recurring audit, insurance scaling with users, plus a 1 to 5.5 per cent monthly chance of a costly incident. Not catastrophic individually; material in aggregate and lumpy in timing.

---

## 5. Month by month, in phases

The workbook carries a per-month note. The shape of it:

**Months 1 to 6, pilot.** Nothing is proven and the spread is almost entirely retention. Conservative: the cohort is friends and family who leave when asked to pay. Optimistic: the first fifty are the archetype and stay because a dread task landed properly.

**Months 7 to 12, first workflows.** Conservative: automation stalls near its starting point and every task still needs a person. Optimistic: the top workflows encode and the AI-only share climbs through the fifties.

**Months 13 to 18, seed milestone.** Conservative: handling times have not fallen, attrition has eaten the curve, UK slips past month 24. Optimistic: minutes per user per month fall faster than users grow, and the UK opens early.

**Months 19 to 24, Series A window.** The unit economics either read or they do not. Conservative: labour is still over half of revenue and each new user adds burn. Optimistic: contribution per user turns positive and growth starts paying for itself.

**Months 25 to 30, scale strain.** Management cost, seat cost and churn volatility all bite together. This is where the viable scenario reaches its cash trough, at month 28.

**Months 31 to 36, expansion cost.** A re-platform and SOC 2 land in most paths. Conservative: the rebuild overruns and the US is pulled forward before the economics are ready.

**Months 37 to 48, Series B window.** Conservative: engineering headcount keeps scaling with institutions covered. Optimistic: headcount decouples from users and gross margin widens each quarter.

**Months 49 to 60.** Either cash generative with a real switching cost, or still burning with a cost base that grew alongside the user base.

---

## 6. Funding plan

Sized as window burn times a 1.3 buffer. **Raise against the conservative line, plan against the planning line, and never against the optimistic one.**

### If the viable configuration is what you are building

| Round | Timing | Raise (conservative) | What it must buy |
|---|---|---|---|
| **Seed** | now, 18 to 24 months of runway | **$2.5m to $3m** | Measured unit economics: automation share, minutes per user per month, twelve-month churn, a first cohort that renews |
| **Series A** | month 18 to 22 | **$6m to $10m** | Contribution positive per user in India, a workflow library that generalises, second geography open |
| **Series B** | month 34 to 40, optional | **$15m to $25m** | Bought to accelerate, not to survive |

The model's arithmetic asks for less than that: $1.7m through month 18 and $3m more through month 36 on the conservative line. Raise more than the arithmetic for three reasons. Rounds are priced against milestones rather than burn, an eighteen-month seed leaves no room for one bad quarter, and a Series A sized for survival signals a company that has stopped trying to grow. The notable finding is that in the viable configuration Series B is genuinely optional: the planning line needs nothing after month 36, so a B round buys speed and geography rather than oxygen.

### If you build what is currently specified

Seed $3.4m, Series A $10.3m, Series B $27.6m on the conservative line, and the cumulative cash requirement still has not troughed at month 60. Peak need is $23m to $32m with a one in eight chance of profitability inside five years. That is not a fundable plan and it is not a survivable one.

---

## 7. What would falsify this

The model is a set of informed priors, and priors are what you replace. In order of how much they move the answer:

1. **Minutes per user per month.** The thirty-task measurement gives you handling times; a pilot cohort gives you usage. This one number carries more of the outcome than everything else combined.
2. **Twelve-month churn on a paying cohort.** Every growth path in the model is conditional on it.
3. **Willingness to pay above $50.** The viable scenario needs Indian ARPU near $52. A priced waiting list settles it in weeks and costs nothing.
4. **The engineering exponent.** Watch whether new institutions get cheaper to add. If the tenth costs what the second cost, you have an agency.

---

## 8. Honest limits

Growth is modelled as a decaying rate against the installed base with a market ceiling, not as a function of marketing spend, so in this model you cannot buy growth. Competitive response is absent: no price war, no incumbent bundling this into an existing app. Funding is not modelled as a constraint on the path, so a path that needs cash at month 30 is assumed to have it. Dilution and valuation are outside the model entirely. And the distributions are priors informed by comparable businesses and by the analysis in the workspace, not by evidence from your own customers, which does not exist yet.

That last sentence is the most important one in this document. Everything above is a structured way of being wrong until the measurement replaces it.
