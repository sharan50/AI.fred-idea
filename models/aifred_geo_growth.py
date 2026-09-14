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
        # A referral incentive is not one rupee figure in every market: it is
        # scaled by the same published ratio that prices the media, because a
        # referrer abroad will not accept the Indian sum.
        sales += (a * cac[:, g] * cac_growth ** t if not MARKETING_ON
                  else a * REFERRAL_G[g])
        adds_organic += a
        adds_paid += p
        out_paid[g][t] = p
        out_spend[g][t] = np.where(live, budget / live_any, 0.0)
    if MARKETING_ON:
        sales += budget
    tot = users.sum(1)'''

OLD_KEYS = '"blended_min", "arpu_usd", "gmv"]'
NEW_KEYS = ('"blended_min", "arpu_usd", "gmv",\n'
            '        "adds_organic", "adds_paid", "marketing_spend",\n'
            '        "adds_paid_ind", "adds_paid_uk", "adds_paid_us",\n'
            '        "spend_ind", "spend_uk", "spend_us"]')
OLD_VALS = "arpu_usd=(revenue / fx) / np.maximum(tot, 1), gmv=gmv).items():"
NEW_VALS = ("arpu_usd=(revenue / fx) / np.maximum(tot, 1), gmv=gmv,\n"
            "                     adds_organic=adds_organic, adds_paid=adds_paid,\n"
            "                     marketing_spend=budget,\n"
            "                     adds_paid_ind=out_paid[0][t], adds_paid_uk=out_paid[1][t],\n"
            "                     adds_paid_us=out_paid[2][t],\n"
            "                     spend_ind=out_spend[0][t], spend_uk=out_spend[1][t],\n"
            "                     spend_us=out_spend[2][t]).items():")

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


def market_ratios(cac_inr):
    """How much dearer a user is in each market, on the published draws alone.

    The geography model already asserts a per-market acquisition cost. Its
    ratio is the only statement the record holds about how much more a foreign
    user costs to find, so it is what scales both the media and the referral
    incentive here. At the published seed it is 1, 7.4 and 9.7, which is what
    the pages should quote rather than the "ten times" gloss.
    """
    home = float(np.median(cac_inr[:, 0]))
    return [float(np.median(cac_inr[:, g])) / max(home, 1e-9)
            for g in range(cac_inr.shape[1])]


def channel_tables(cac_usd, cac_inr, caps, fx=89.0):
    """One channel table per market, from the promoted line's single input.

    `cac_usd` is what a paid arrival costs at low volume in the home market's
    cheapest channel. `cac_inr` and `caps` are the geography model's own
    per-market acquisition cost and market ceiling draws: the first fixes how
    much dearer a foreign arrival is, the second fixes where each market's
    channels saturate.
    """
    ceil_home = float(np.median(caps[:, 0]))
    ratios = market_ratios(cac_inr)
    tables = []
    for g in range(cac_inr.shape[1]):
        ratio = ratios[g]
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
        cac_usd=None, spend_share=None, organic_cost=None, commerce=None):
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
        if commerce is not None:
            ns["COMMERCE"] = bool(commerce)
        ns["CHANNELS"] = channel_tables(ns["CAC_USD"], ns["cac"], ns["caps"])
        ns["RATIOS"] = market_ratios(ns["cac"])
        if organic_cost == "published":
            # The pessimistic bound: a word-of-mouth arrival costs the
            # geography model's own per-market acquisition figure rather than a
            # referral incentive, which is what the page's ten-times qualifier
            # would mean if it still priced organic arrivals.
            ns["REFERRAL_G"] = [None] * ns["G"]
            ns["ORGANIC_AT_PUBLISHED_CAC"] = True
        else:
            ns["REFERRAL_G"] = [ns["REFERRAL_INCENTIVE"] * r for r in ns["RATIOS"]]
        ns["out_paid"] = {g: np.zeros((ns["MONTHS"], n)) for g in range(ns["G"])}
        ns["out_spend"] = {g: np.zeros((ns["MONTHS"], n)) for g in range(ns["G"])}
        loop = LOOP if organic_cost != "published" else LOOP.replace(
            "                  else a * REFERRAL_G[g])",
            "                  else a * cac[:, g] * cac_growth ** t)")
        exec(compile(loop, "aifred_geo_model.py(growth)", "exec"), ns)
        exec(compile(PART_BANDS, "aifred_geo_model.py(bands)", "exec"), ns)
    finally:
        sys.argv = argv
    return ns


def _with_loop(scenario, n, seed, loop, commerce=None):
    """Run with a substituted loop, for the allocation counterfactual alone."""
    argv = sys.argv
    sys.argv = ["aifred_geo_model.py", scenario, str(n), str(seed)]
    ns = {"__name__": "aifred_geo_growth", "MARKETING_ON": True,
          "SPEND_SHARE": MARKETING["spend_share"], "SPEND_FLOOR": float(MARKETING["spend_floor_inr"]),
          "MIX": MARKETING["mix"], "CAC_USD": float(MARKETING["blended_cac_usd"]),
          "REFERRAL_INCENTIVE": float(MARKETING["referral_incentive_inr"]),
          "paid_arrivals": paid_arrivals}
    try:
        exec(compile(PART_DRIVERS, "aifred_geo_model.py", "exec"), ns)
        if commerce is not None:
            ns["COMMERCE"] = bool(commerce)
        ns["CHANNELS"] = channel_tables(ns["CAC_USD"], ns["cac"], ns["caps"])
        ns["RATIOS"] = market_ratios(ns["cac"])
        ns["REFERRAL_G"] = [ns["REFERRAL_INCENTIVE"] * r for r in ns["RATIOS"]]
        ns["out_paid"] = {g: np.zeros((ns["MONTHS"], n)) for g in range(ns["G"])}
        ns["out_spend"] = {g: np.zeros((ns["MONTHS"], n)) for g in range(ns["G"])}
        exec(compile(loop, "aifred_geo_model.py(growth)", "exec"), ns)
        exec(compile(PART_BANDS, "aifred_geo_model.py(bands)", "exec"), ns)
    finally:
        sys.argv = argv
    return ns["df"]


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
    ratios = ns["RATIOS"]
    mix = MARKETING["mix"]
    ch = MARKETING["channels"]
    mixw = sum(mix[k] * ch[k]["mult"] for k in mix)
    def eff(market, month):
        sp, ad = df[f"spend_{market}_plan"][month - 1], df[f"adds_paid_{market}_plan"][month - 1]
        return float(sp / ad / 89.0) if ad > 1e-9 else None
    s["marketing"] = {
        "market_ratios": ratios,
        # What the pages may quote. The single input prices the cheapest
        # channel at zero volume; the mix-weighted anchor and the effective
        # cost at the budget the run actually spends are the honest figures.
        "cheapest_channel_anchor_usd": [ns["CAC_USD"] * r for r in ratios],
        "mix_weighted_anchor_usd": [ns["CAC_USD"] * r * mixw for r in ratios],
        "effective_cost_per_paid_arrival_usd_m36": {
            k: eff(k, 36) for k in ("ind", "uk", "us")},
        "effective_cost_per_paid_arrival_usd_m60": {
            k: eff(k, 60) for k in ("ind", "uk", "us")},
        "referral_incentive_inr_by_market": ns["REFERRAL_G"],
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

    # Like for like, for the sequencing table: the commerce layer off in every
    # scenario, because the published file has it on in foreign_led and in
    # expansion_commerce and off in the other two, which is not a comparison.
    if not only:
        nc = run("foreign_led", N, SEED, marketing=True, commerce=False)
        nc["df"].to_csv(HERE / "geo_growth_foreign_led_nocommerce.csv", index=False)
        s_nc = report(nc)
        summaries["foreign_led_nocommerce"] = s_nc
        json.dump(s_nc, open(HERE / "geogrowthsum_foreign_led_nocommerce.json", "w"),
                  indent=2, default=float)
        print(f'{"foreign_led, commerce off":26s} peak need {s_nc["peak_cash_cr_plan"]:6.1f} cr   '
              f'cons {s_nc["peak_cash_usd_cons"]/1e6:5.2f}m   '
              f'arpu m36 ${s_nc["m36"]["arpu_usd"]:.0f}   '
              f'contribution m36 {s_nc["m36"]["contribution_cr"]:5.2f} cr')

        # The pessimistic bound, the matched percentiles, and the allocation
        # counterfactual: every figure section 8 of 05 quotes, in a file.
        rows, pct, alloc = [], [], []
        alt = LOOP.replace("paid_arrivals(budget / live_any, CHANNELS[g], MIX)",
                           "paid_arrivals(budget * (1.0 if g == 0 else 0.0), CHANNELS[g], MIX)")
        assert alt != LOOP
        # foreign_led carries the commerce layer by its own definition, so the
        # sequencing table's column for it is the commerce-off run; the bound,
        # the percentiles and the counterfactual are reported for both.
        BASES = [(sc, None) for sc in SCENARIOS] + [("foreign_led", False)]
        for sc, comm in BASES:
            tag = sc if comm is None else f"{sc}_nocommerce"
            for basis in ("referral_scaled", "published_cac_on_organic"):
                r = report(run(sc, N, SEED, marketing=True, commerce=comm,
                               organic_cost=None if basis == "referral_scaled" else "published"))
                rows.append({"scenario": tag, "organic_cost_basis": basis,
                             "peak_cash_cr_plan": r["peak_cash_cr_plan"],
                             "peak_cash_cr_cons": r["peak_cash_cr_cons"],
                             "profitable_by_m36": r["profitable_by_m36"],
                             "contribution_cr_m36": r["m36"]["contribution_cr"]})
            ns2 = run(sc, N, SEED, marketing=True, commerce=comm)
            cum = np.cumsum(ns2["out"]["contribution"], axis=0)
            need = -np.minimum(cum.min(axis=0), 0) / CR
            band = -ns2["df"].cum_cash_cons.min() / CR
            pct.append({"scenario": tag, "need_cr_p50": float(np.median(need)),
                        "need_cr_p80": float(np.quantile(need, 0.8)),
                        "need_cr_p90": float(np.quantile(need, 0.9)),
                        "band_cons_cr": float(band),
                        "band_sits_at_percentile": float((need < band).mean() * 100)})
            for rule, loop in (("even_split", LOOP), ("home_market_only", alt)):
                d = _with_loop(sc, N, SEED, loop, comm)
                alloc.append({"scenario": tag, "allocation": rule,
                              "foreign_share_users_m60":
                                  float(d.users_fgn_plan[59] / max(d.users_plan[59], 1)),
                              "peak_cash_cr_cons": float(-d.cum_cash_cons.min() / CR)})
        pd.DataFrame(rows).to_csv(HERE / "geo_growth_bounds.csv", index=False)
        pd.DataFrame(pct).to_csv(HERE / "geo_growth_percentiles.csv", index=False)
        pd.DataFrame(alloc).to_csv(HERE / "geo_growth_allocation.csv", index=False)
        print()
        print(pd.DataFrame(pct).to_string(index=False))
        print()
        print(pd.DataFrame(alloc).to_string(index=False))

    if len(todo) > 1:
        json.dump(summaries, open(HERE / "geogrowthsum_all.json", "w"), indent=2, default=float)
        print()
        for sc, s in summaries.items():
            print(f"{sc:20s} m60 revenue {s['m60']['revenue_cr']:6.1f} cr   "
                  f"contribution {s['m60']['contribution_cr']:6.1f} cr   "
                  f"commerce share {s['m60'].get('commerce_share', 0):5.1%}   "
                  f"arpu ${s['m60']['arpu_usd']:.0f}")
