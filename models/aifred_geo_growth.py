"""
AI.fred geography on the promoted line
======================================

The published trajectory now carries the two acquisition mechanisms of DR-025:
word of mouth against a market ceiling, plus a media budget that buys arrivals
at a cost per arrival which rises as the budget does. The geography scenarios
were still run on the older basis, where every arrival cost money and no money
bought an arrival, which left Table 5.5 on a different footing from the rest of
the page. This file puts the four geography scenarios on the same footing.

It does to aifred_geo_model.py exactly what aifred_growth_model.py does to
aifred_model.py: it splits the published file at its own boundaries, replaces
only the acquisition and acquisition-cost blocks, and quotes both the old text
and the new so a reader can see precisely what differs. Everything else, the
delivery side, the foreign entity costs, the night premium, the commerce layer
and the outcome bands, is the published code running unmodified.

THE ONE THING THIS ADDS, AND THE NUMBERS IT DOES NOT INVENT.

  Media costs more abroad. How much more is not a new assumption here: it is
  the ratio of the geography model's own per-market acquisition-cost draws,
  which are about $13, $95 and $126 a user for India, the United Kingdom and
  the United States. So the low-volume cost of a paid arrival is the promoted
  line's own $120 in India and that same figure times each market's published
  ratio abroad, which puts the American figure inside the consumer fintech
  benchmark band the review at /08-review/ already carries. No figure enters
  that the record did not hold.

  Saturation is per market. A channel's cost doubles at a share of the market
  ceiling, and each market has its own ceiling, so the same share gives a
  smaller absolute volume in the smaller market. Earned press is capped in
  proportion to the ceiling for the same reason.

  The budget splits evenly across live markets. This is the promoted line's
  own rule, extended. An operator allocating to marginal cost would do better,
  because Indian arrivals are cheaper by a factor of seven, so this is the
  conservative reading of expansion rather than a flattering one.

FIDELITY. With marketing switched off each of the four published geography
CSVs comes back character for character. Every new quantity is pure arithmetic
on arrays the published file already drew, so the random stream is untouched
and the two bases are comparable path by path rather than only in aggregate.

Usage:  python aifred_geo_growth.py [scenario] [n_paths] [seed]
        python aifred_geo_growth.py --selftest
"""

import json
import sys

import numpy as np
import pandas as pd

from aifred_growth_model import MARKETING, paid_arrivals
from aifred_harness import CR, DEFAULT_SEED, HERE

SCENARIOS = ("india_only", "expansion", "expansion_commerce", "foreign_led")

# ---------------------------------------------------- the published file, once
SRC = (HERE / "aifred_geo_model.py").read_text()
MARK_KEYS = "KEYS = ["
MARK_BANDS = 'score = out["cum_cash"][-1]'
MARK_WRITE = 'df.to_csv(f"geo_{SC}.csv"'
PART_DRIVERS = SRC[: SRC.index(MARK_KEYS)]
PART_LOOP = SRC[SRC.index(MARK_KEYS) : SRC.index(MARK_BANDS)]
PART_BANDS = SRC[SRC.index(MARK_BANDS) : SRC.index(MARK_WRITE)]

# The acquisition and acquisition-cost block of the published file. Arrivals are
# a decaying fraction of each market's installed base, and each one is charged
# that market's acquisition cost whether or not anything was spent to find it.
OLD_ADDS = '''    sales = np.zeros(sh)
    for g in range(G):
        b = users[:, g]
        if g > 0:
            ent = tri(0.6, 1.2, 2.2) if FLED else tri(0.15, 0.35, 0.7)
            b = np.where(m == launch[:, g], seed_users * ent, b)
        live = m >= launch[:, g]
        cg = ch * (foreign_churn_mult if g > 0 else 1.0)
        gmul = (1.6 if (FLED and g > 0) else 1.0)
        a = np.where(live, b * rate * gmul * np.clip(1 - b / caps[:, g], 0, 1)
                     * np.exp(rng.normal(0, 0.25, sh)), 0.0)
        users[:, g] = np.where(live, np.maximum(b * (1 - cg) + a, 0), 0.0)
        sales += a * cac[:, g] * cac_growth ** t
    tot = users.sum(1)'''

# The same block with the two mechanisms in it. The organic arrival is the
# published one, unchanged and drawn in the same order, so the stream holds. A
# per-market media budget buys arrivals beside it at that market's own cost and
# saturation, and the acquisition line becomes what is actually spent: the media
# budget, plus a referral incentive on the arrivals word of mouth brings.
NEW_ADDS = '''    sales = np.zeros(sh)
    adds_organic = np.zeros(sh)
    adds_paid = np.zeros(sh)
    budget = np.zeros(sh) if not MARKETING_ON else (
        np.maximum(SPEND_FLOOR, SPEND_SHARE * prev_revenue))
    live_any = np.maximum((m >= launch).sum(1), 1)
    for g in range(G):
        b = users[:, g]
        if g > 0:
            ent = tri(0.6, 1.2, 2.2) if FLED else tri(0.15, 0.35, 0.7)
            b = np.where(m == launch[:, g], seed_users * ent, b)
        live = m >= launch[:, g]
        cg = ch * (foreign_churn_mult if g > 0 else 1.0)
        gmul = (1.6 if (FLED and g > 0) else 1.0)
        a = np.where(live, b * rate * gmul * np.clip(1 - b / caps[:, g], 0, 1)
                     * np.exp(rng.normal(0, 0.25, sh)), 0.0)
        p = (np.where(live, paid_arrivals(budget / live_any, CHANNELS[g], MIX)
                      * np.clip(1 - b / caps[:, g], 0, 1), 0.0)
             if MARKETING_ON else np.zeros(sh))
        users[:, g] = np.where(live, np.maximum(b * (1 - cg) + a + p, 0), 0.0)
        sales += (a * cac[:, g] * cac_growth ** t if not MARKETING_ON
                  else a * REFERRAL_INCENTIVE)
        adds_organic += a
        adds_paid += p
    if MARKETING_ON:
        sales += budget
    tot = users.sum(1)'''

OLD_KEYS = '"blended_min", "arpu_usd", "gmv"]'
NEW_KEYS = ('"blended_min", "arpu_usd", "gmv",\n'
            '        "adds_organic", "adds_paid", "marketing_spend"]')
OLD_VALS = "arpu_usd=(revenue / fx) / np.maximum(tot, 1), gmv=gmv).items():"
NEW_VALS = ("arpu_usd=(revenue / fx) / np.maximum(tot, 1), gmv=gmv,\n"
            "                     adds_organic=adds_organic, adds_paid=adds_paid,\n"
            "                     marketing_spend=budget).items():")

assert PART_LOOP.count(OLD_ADDS) == 1, "the published acquisition block has moved"
assert PART_LOOP.count(OLD_KEYS) == 1 and PART_LOOP.count(OLD_VALS) == 1
LOOP = (PART_LOOP.replace(OLD_ADDS, NEW_ADDS).replace(OLD_KEYS, NEW_KEYS)
        .replace(OLD_VALS, NEW_VALS))
# The budget follows last month's revenue, so revenue is carried forward.
LOOP = LOOP.replace("for m in range(1, MONTHS + 1):\n    t = m - 1",
                    "prev_revenue = np.zeros(sh)\nfor m in range(1, MONTHS + 1):\n    t = m - 1")
assert "prev_revenue = np.zeros(sh)" in LOOP
assert LOOP.count("        out[k][t] = v") == 1
LOOP = LOOP.replace("        out[k][t] = v",
                    "        out[k][t] = v\n    prev_revenue = revenue")


def channel_tables(cac_usd, cac_inr, caps, fx=89.0):
    """One channel table per market, from the promoted line's single input.

    `cac_usd` is what a paid arrival costs at low volume in the home market.
    `cac_inr` and `caps` are the geography model's own per-market acquisition
    cost and market ceiling draws: the first fixes how much dearer a foreign
    arrival is, the second fixes where each market's channels saturate.
    """
    home = float(np.median(cac_inr[:, 0]))
    ceil_home = float(np.median(caps[:, 0]))
    tables = []
    for g in range(cac_inr.shape[1]):
        ratio = float(np.median(cac_inr[:, g])) / max(home, 1e-9)
        ceiling = float(np.median(caps[:, g]))
        t = {}
        for name, c in MARKETING["channels"].items():
            t[name] = dict(cac0=cac_usd * fx * c["mult"] * ratio,
                           half=max(ceiling * c["half_share"], 25.0),
                           cap=None if c["cap"] is None
                           else max(c["cap"] * ceiling / max(ceil_home, 1e-9), 5.0))
        tables.append(t)
    return tables


def run(scenario="expansion", n=20000, seed=DEFAULT_SEED, marketing=True,
        cac_usd=None, spend_share=None):
    """Execute the published geography file with the acquisition block replaced."""
    argv = sys.argv
    sys.argv = ["aifred_geo_model.py", scenario, str(n), str(seed)]
    ns = {
        "__name__": "aifred_geo_growth",
        "MARKETING_ON": bool(marketing),
        "SPEND_SHARE": MARKETING["spend_share"] if spend_share is None else spend_share,
        "SPEND_FLOOR": float(MARKETING["spend_floor_inr"]),
        "MIX": MARKETING["mix"],
        "CAC_USD": float(MARKETING["blended_cac_usd"] if cac_usd is None else cac_usd),
        "REFERRAL_INCENTIVE": float(MARKETING["referral_incentive_inr"]),
        "paid_arrivals": paid_arrivals,
    }
    try:
        exec(compile(PART_DRIVERS, "aifred_geo_model.py", "exec"), ns)
        ns["CHANNELS"] = channel_tables(ns["CAC_USD"], ns["cac"], ns["caps"])
        exec(compile(LOOP, "aifred_geo_model.py(growth)", "exec"), ns)
        exec(compile(PART_BANDS, "aifred_geo_model.py(bands)", "exec"), ns)
    finally:
        sys.argv = argv
    return ns


def selftest(scenario):
    """With marketing off the published geography CSV must come back exactly."""
    ns = run(scenario, 20000, DEFAULT_SEED, marketing=False)
    published = HERE / f"geo_{scenario}.csv"
    cols = list(pd.read_csv(published).columns)
    return ns["df"][cols].to_csv(index=False) == published.read_text()


def report(ns):
    """The published summary, plus what the media budget did."""
    s = dict(ns["summary"])
    df, out = ns["df"], ns["out"]
    s["marketing"] = {
        "paid_cac_usd_home": ns["CAC_USD"],
        "spend_share_of_revenue": ns["SPEND_SHARE"],
        "spend_floor_inr": ns["SPEND_FLOOR"],
        "paid_share_of_arrivals_m12": float(
            out["adds_paid"][11].mean()
            / max(out["adds_paid"][11].mean() + out["adds_organic"][11].mean(), 1e-9)),
        "paid_share_of_arrivals_m60": float(
            out["adds_paid"][59].mean()
            / max(out["adds_paid"][59].mean() + out["adds_organic"][59].mean(), 1e-9)),
        "media_spend_cr_m60_plan": float(df.marketing_spend_plan[59] / CR),
        "sales_share_of_cost_m60_plan": float(
            df.sales_plan[59] / max(df.total_cost_plan[59], 1e-9)),
    }
    cross = np.where(df.contribution_plan.values > 0)[0]
    s["crossover_month_plan"] = int(cross[0] + 1) if len(cross) else None
    s["trough_month_plan"] = int(df.cum_cash_plan.values.argmin() + 1)
    s["peak_cash_cr_plan"] = float(-df.cum_cash_plan.min() / CR)
    s["peak_cash_cr_cons"] = float(-df.cum_cash_cons.min() / CR)
    return s


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        ok = True
        for sc in SCENARIOS:
            good = selftest(sc)
            ok = ok and good
            print(f"self test {sc:20s}", "rebuilds geo_%s.csv exactly" % sc if good else "FAILED")
        raise SystemExit(0 if ok else 1)

    only = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else None
    N = int(sys.argv[2]) if len(sys.argv) > 2 else 20000
    SEED = int(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_SEED
    todo = (only,) if only else SCENARIOS

    summaries = {}
    for sc in todo:
        assert selftest(sc), f"self test failed for {sc}"
        ns = run(sc, N, SEED, marketing=True)
        ns["df"].to_csv(HERE / f"geo_growth_{sc}.csv", index=False)
        s = report(ns)
        summaries[sc] = s
        json.dump(s, open(HERE / f"geogrowthsum_{sc}.json", "w"), indent=2, default=float)
        print(f"{sc:20s} peak need {s['peak_cash_cr_plan']:6.1f} cr   "
              f"crossover m{s['crossover_month_plan']}   "
              f"users m60 {s['m60']['users']:9,.0f}   "
              f"foreign share {s['m60']['foreign_share']:5.1%}   "
              f"paid share of arrivals m12 {s['marketing']['paid_share_of_arrivals_m12']:5.1%}"
              f" m60 {s['marketing']['paid_share_of_arrivals_m60']:5.1%}")

    if len(todo) > 1:
        json.dump(summaries, open(HERE / "geogrowthsum_all.json", "w"), indent=2, default=float)
        print()
        for sc, s in summaries.items():
            print(f"{sc:20s} m60 revenue {s['m60']['revenue_cr']:6.1f} cr   "
                  f"contribution {s['m60']['contribution_cr']:6.1f} cr   "
                  f"commerce share {s['m60'].get('commerce_share', 0):5.1%}   "
                  f"arpu ${s['m60']['arpu_usd']:.0f}")
