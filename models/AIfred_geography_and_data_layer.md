# Geography, purchasing power, and the data layer

Companion to `aifred_geo_model.py`. Four scenarios, 20,000 paths each, 60 months. Three things the earlier run treated too crudely are now priced: acquisition cost by geography, the standing cost of a foreign entity, and a commerce take rate.

Section 1 is that file. Section 1a is the same four scenarios on the basis the publication now quotes, which is `aifred_geo_growth.py`: the same code with the two acquisition mechanisms of DR-025 in it. Read 1a for a number that appears on a page and 1 for what the promotion changed.

---

## 1. The result

| | India only | Expand late | Expand late + commerce | Foreign led |
|---|---|---|---|---|
| UK launch | never | m13-30 | m13-30 | m8-18 |
| US launch | never | m26-50 | m26-50 | m16-34 |
| Profitable by m36 | 62% | 44% | 51% | **82%** |
| Profitable by m60 | 90% | 79% | 84% | **99%** |
| Peak cash, planning | $1.61m | $2.19m | $2.02m | $2.77m |
| Peak cash, conservative | $3.66m | $8.78m | $7.40m | **$4.86m** |
| ARPU at m36 | $59 | $63 | $72 | **$107** |
| Foreign share of users, m36 | 0% | 5% | 5% | 58% |
| Contribution at m36 | Rs 1.67 cr/mo | Rs 0.51 cr/mo | Rs 1.18 cr/mo | **Rs 8.0 cr/mo** |
| Contribution at m60 | Rs 10.7 cr/mo | Rs 10.3 cr/mo | Rs 13.1 cr/mo | **Rs 55.9 cr/mo** |

**Your thesis is right, and the version of it currently written into the roadmap is worse than not expanding at all.**

Expanding late and treating the UK and US as secondary markets is the worst of the four. It carries every fixed cost of foreign operation against a user base that never exceeds five per cent of the total, and it nearly triples the conservative cash requirement, from $3.66m to $8.78m, while lowering the probability of profitability. Expanding early, with the growth focus genuinely abroad, produces a company earning sixteen times the monthly contribution at month 36 for one additional million dollars of planning-line cash.

The difference is not whether you expand. It is whether the foreign base gets large enough, fast enough, to carry the step cost of being there.

---

## 1a. The same four on the published line

`aifred_geo_growth.py`, same paths and same seed, with word of mouth and a media budget in place of a single exogenous arrival rate. A paid arrival costs $120 at low volume in India's cheapest channel and the same figure times this model's own per-market cost ratio abroad, 7.4 and 9.7, so $885 and $1,165 in that channel, $1,093 and $1,439 weighted by the mix, and $1,518 and $1,419 an arrival by m36 once the budget has grown. A referral incentive is scaled by the same ratio, Rs 250 at home against Rs 1,844 and Rs 2,428. The budget is fifteen per cent of last month's revenue, on a floor of Rs 3 lakh a month, split evenly across live markets. With media switched off every one of the four rebuilds section 1 character for character, which is the self test the file runs before it writes.

The last column is the run with the commerce layer switched off, because `foreign_led` carries that layer by its own definition and a sequencing comparison against two scenarios without it is not a comparison. The with-commerce figures are in brackets.

| | India only | Expand late | Expand late + commerce | Foreign led, commerce off |
|---|---|---|---|---|
| Profitable by m36 | 93% | 78% | 85% | **92%** (96%) |
| Profitable by m60 | 99% | 97% | 99% | **100%** (100%) |
| Peak cash, planning | $1.42m | $1.68m | $1.61m | $2.16m ($2.03m) |
| Peak cash, conservative | $2.04m | $3.98m | $2.90m | **$3.85m** ($3.19m) |
| ARPU at m36 | $59 | $62 | $70 | **$77** ($92) |
| Foreign share of users, m36 | 0% | 8% | 8% | 41% |
| Contribution at m36 | Rs 5.69 cr/mo | Rs 4.20 cr/mo | Rs 5.89 cr/mo | **Rs 10.83 cr/mo** (15.65) |
| Contribution at m60 | Rs 17.2 cr/mo | Rs 22.8 cr/mo | Rs 30.3 cr/mo | **Rs 55.0 cr/mo** (72.9) |

Four things to take from it.

**The ranking does not move.** Late secondary expansion is still the worst of the four and foreign led is still the best, so nothing in the sequence DR-023 fixes depends on the acquisition mechanism.

**The cash argument for going early has largely gone.** Compared like for like, foreign led costs $3.85m of conservative cash against the late sequence's $3.98m, where on the old basis it was $4.86m against $8.78m. Media grows the Indian base that carries the foreign cost, which helps the late sequence most because that is the sequence starved of a base. What is left for foreign led is a contribution argument: about twice the contribution at m36 and fourteen more points of the chance of being profitable by then.

**The mix moves, and against the thesis.** An even split of the budget buys about seven times as many Indian arrivals per rupee, so media lifts the foreign share where expansion was late and starved, from 12 to 24 per cent of users at m60, and thins it where growth had already been moved abroad, from 63 to 52 per cent, which takes foreign-led ARPU at m36 from $107 to $92 on the same commerce-carrying basis and to $77 without it. Against the alternative rules, though, the finding reverses: put the whole budget into India and the late sequence's foreign share is 7 per cent rather than 24, and its conservative need falls to 29.9 crore. So the foreign share is a property of the rule. `geo_growth_allocation.csv` has both.

**Two artefacts bound what the table means.** The conservative line is an average within a ranked family, and it lands at the 72nd percentile of the India-only need distribution, the 83rd of the late sequence's and the 76th of the foreign-led: at matched percentiles the late sequence needs 1.29 to 1.74 times India only rather than the 1.95 the band lines show (`geo_growth_percentiles.csv`). And if a word-of-mouth arrival abroad in fact costs this model's own per-market figure rather than a scaled referral incentive, the foreign-led case needs 52.0 crore against the late sequence's 43.2 and becomes the most expensive of the three (`geo_growth_bounds.csv`). The sequence is most exposed there.

---

## 2. Why the PPP argument holds, and where it leaks

You are right about the core arithmetic. A US user paying $105 costs the same to serve as an Indian user paying $52, because the delivery floor is in Bengaluru either way. The gross margin on a foreign user is roughly double.

Three leaks in the argument that the model now prices.

**Acquisition cost does not follow purchasing power, it follows competition for attention.** Blended CAC in India runs Rs 600 to 2,200. In the UK and US the same model uses Rs 4,000 to 25,000, which is $45 to $280. That is a ten-fold difference against a two-fold price difference, and on the published line the same ratio prices the media as well as the referral, so a wrong ratio is wrong twice. It still works, because a foreign user at $105 with a thirty-month life is worth around $3,100 gross, so even $280 of CAC is comfortable. But it means foreign expansion is capital-hungry in a way Indian growth is not, and it is the reason the conservative band widens so much.

**Delivery is not free of the geography.** Staff serving UK and US hours work nights and need a higher English bar, which the model prices at a 20 to 48 per cent wage premium on the share of the base that is foreign. Automation share is also worse abroad at entry, because the workflow library is built against Indian institutions and has to be rebuilt for HMRC, the DVLA, US banks and US insurers. That friction decays, but it is real for the first year in each market.

**The entity is a step cost, not a variable one.** A country lead, local counsel, local accounting, a registered office, local insurance and the entity itself run Rs 0.9m to 3.2m a month for the UK and Rs 1.8m to 6.5m for the US, before a single user. On the model's central values that means:

- **The UK entity breaks even at roughly 400 users.**
- **The US entity breaks even at roughly 600 users.**

Below those numbers each geography is a standing drag on the company. Above them, every additional user is the arbitrage you described, at roughly Rs 6,000 to 8,000 a month of contribution each. The planning rule that falls out of this is simple: do not open a market you cannot get to five hundred users in within about twelve months, and do not open two at once until the first has cleared its threshold.

**One outside data point worth weighing.** Panasonic funded Yohana, a US family concierge with human specialists, from 2021. It reached roughly 4,500 families and the service closed on 30 September 2025, with the closure attributed to an assessment of the business environment. The US willingness to pay is real. Reaching enough of it to carry a US cost base is the part that has defeated better-funded attempts, and the foreign-led scenario above assumes you do it faster than they did.

---

## 3. The data layer: what it is worth and when

Decision 19 imagines a threshold beyond which the company becomes a data business with other monetisation routes. The model says there are three distinct things inside that idea, with very different values and very different user counts.

### 3.1 Data as product improvement, from roughly 2,000 users

Preference prediction through archetype clustering needs perhaps 300 to 500 users per cluster with six or more months of history to produce stable segments. With a handful of meaningful archetypes that is 2,000 to 3,000 users. This is available before Series A, and it is the highest-value use of the data by a wide margin, because it feeds automation share, which is the variable the whole business rests on.

### 3.2 Data as commerce, from roughly 5,000 users

This is the honest version of the second revenue line. You are already executing purchases the user asked for. Routing them through channels that pay a take rate is not a new business, it is a margin on the existing one.

The model's commerce layer runs at roughly 1.2 per cent of routed GMV after allowing that only 20 to 65 per cent of transactions have a payable channel. At month 60 that is 12 per cent of revenue on this basis and 14 per cent on the published line. **The important part is not the revenue share, it is the margin share:** commerce is roughly 95 per cent gross margin, so adding it more than doubles contribution at month 36 on this basis, from Rs 0.51 cr to Rs 1.18 cr a month in the late-expansion case. On the published line the absolute addition is larger, Rs 1.69 cr a month, but it is about two fifths rather than a doubling, because the subscription base it is added to is no longer near break-even at that month.

What it needs is not users but GMV, because merchants negotiate on volume. Meaningful terms start somewhere around Rs 25 to 50 crore a year of routed spend, which at the model's central spend per user is **4,000 to 7,500 users**. Foreign users route three to four times the GMV of Indian ones, so a foreign-led base reaches the threshold far earlier. On the published line the late-expansion base passes 4,000 users at month 18 and 7,500 at month 23, against months 27 and 33 on this basis, so the leverage now arrives inside the twelve to twenty-two month window the model allows for merchant agreements rather than well after it.

### 3.3 Data as a sellable asset, and why it is a trap

This is the version of Decision 19 I would remove from the workspace.

Consumer panel businesses monetise at roughly $10 to $40 per panellist per year. At 50,000 users that is $0.5m to $2m a year. Subscription revenue at that scale, in the foreign-led mix, is around $70m a year. **The panel business is one to three per cent of revenue.** It does not change the shape of the company; it is a rounding error attached to the company's single greatest liability.

Now price the risk against it. The business is acutely churn-sensitive: at 50,000 users, moving monthly churn from 2.4 to 3.4 per cent shortens average life from 42 months to 29 and costs roughly a quarter of the steady-state base, which is on the order of $11m a year. **You would be selling $1m to $2m of data revenue against an $11m churn exposure**, in a product whose entire pricing power comes from being trusted with passport numbers and bank statements.

The regulatory position points the same way. Under the DPDP Act and GDPR, purpose limitation means processing personal data for a new purpose needs a fresh lawful basis, and consent obtained for "helping you book things" does not extend to "producing market intelligence". Anonymisation that survives scrutiny is hard when the underlying records include identity documents. And volume itself creates obligations: crossing into Significant Data Fiduciary territory brings a data protection officer, impact assessments and independent audits, which is a cost that rises with the user count rather than falling.

There is also an agency problem that no amount of legal drafting fixes. The moment a merchant can pay for placement in a recommendation, the assistant stops being the user's agent. That is precisely the property the twin is supposed to have, and it is the reason someone pays $105 a month rather than using a free agent.

**The defensible position: the data is worth an enormous amount to the product and a modest amount as commerce margin, and it is worth less than nothing for sale.** Decision 19 should be rewritten to say so, because as currently framed it is the thing a diligence process will seize on.

---

## 4. What I would change in the workspace

1. **Move the UK forward.** Target entry at month 8 to 14, not month 20, and gate it on a five hundred user target within twelve months rather than on a revenue milestone.
2. **Write the entity thresholds down.** 400 UK users and 600 US users to carry the local cost base, as a go or no-go rather than a forecast.
3. **Reframe India.** In the foreign-led scenario India is the delivery base, the workflow laboratory and a real but secondary revenue market. That is a different story from "India first, then expand", and it is a better one.
4. **Add the commerce line to the model as margin, not as a pivot.** Meaningful from around 5,000 users, transparent to the user, and never at the cost of recommendation neutrality.
5. **Rewrite Decision 19.** Keep the internal use of data, keep commerce, delete the sale of insight.

---

## 5. Caveats

The foreign-led scenario assumes you can acquire abroad at 1.6 times the Indian growth rate from a standing start, with no brand, no local team and a founder who has not sold to those users before. That assumption is doing as much work as any parameter in the model, and the Yohana outcome is the reason to hold it loosely. Test it the cheap way before committing: a priced UK waiting list aimed at NRI households, measured for conversion, beats every projection in this document.
