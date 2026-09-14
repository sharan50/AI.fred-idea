"""
AI.fred growth: acquisition as two mechanisms rather than one exogenous rate
============================================================================

The published model has users arrive as a decaying fraction of the installed
base against a market ceiling, and charges an acquisition cost for every arrival
without any spend causing one. The sensitivity then finds that this single rate
owns more of the outcome than every driver on the delivery side combined. A
model whose largest variable has no mechanism cannot be planned against, which
is what this file fixes.

Growth here is the sum of two mechanisms, as the founder specifies them.

  ORGANIC. Word of mouth and referral, exactly as the published model has it:
  a fraction of the installed base each month, decaying, against the market
  ceiling. Its cost is a referral incentive per arrival, not a media buy.

  MARKETING. A monthly budget, converted into arrivals at a cost per arrival
  that rises as the budget does, because the cheap audience is bought first.
  Three channels, priced and saturating separately:
    reels      short video on Instagram, bought on performance
    influencer AI-influencer placements, bought per campaign
    press      technology and business papers, earned rather than bought, so a
               small standing cost and a hard ceiling on what it can deliver
  Arrivals from marketing join the installed base, so they compound through the
  organic mechanism in later months: a rupee of media buys a user and the users
  that user brings.

WHAT IS AND IS NOT EVIDENCE HERE. The organic side is the published model's own
prior. The marketing side has no evidence behind it at all: nobody has run a
reel, and a cost per acquired user for this product in this market is exactly
the number that does not exist. So this file does not assert one. It takes the
cost per arrival as a parameter and answers the question that can be answered
without evidence: how expensive may a paid user be before paid acquisition
stops paying for itself. That is a number a priced waiting list and two weeks
of media can settle, and it is the one worth measuring first.

FIDELITY. With marketing switched off this reproduces sim_viable.csv character
for character. Every new parameter is drawn from a generator of its own, so the
published model's random stream is untouched and the two runs are comparable
path by path rather than only in aggregate.

Usage:  python aifred_growth_model.py [scenario] [n_paths] [seed]
        python aifred_growth_model.py --selftest
"""

import json
import sys

import numpy as np
import pandas as pd

from aifred_harness import CR, DEFAULT_SEED, HERE, MONTHS, bands, outcomes

# --------------------------------------------------------------- the mechanism
# Ranges, not point values. Each is a statement someone can argue with, and the
# sweep below is what matters rather than any single draw.
# One number the founder can argue with, not three: what a paid arrival costs at
# low volume, in dollars. The channels differ by a multiplier off it, and the
# cost rises with volume because the cheap audience is bought first. The
# published model's own India figure is about $13 a user, which is a referral
# cost and not a media cost; the review at /08-review/ carries a consumer
# fintech benchmark of $1,340 to $2,140. The sweep spans both, because the
# answer to "does paid acquisition work" is entirely a function of where in
# that range the truth sits, and nobody has run a reel yet.
MARKETING = dict(
    spend_share=0.15,           # of revenue, once there is revenue
    spend_floor_inr=300000.0,   # a month before there is
    blended_cac_usd=120.0,      # a paid arrival at low volume; the sweep varies this
    fx=89.0,
    # Multiplier off the blended figure, and the saturation: the monthly paid
    # arrivals at which a channel's cost has doubled, as a share of the market
    # ceiling. Press is earned rather than bought, so it is cheap and capped.
    channels={
        "reels": dict(mult=1.0, half_share=0.006, cap=None),
        "influencer": dict(mult=2.0, half_share=0.003, cap=None),
        "press": dict(mult=0.35, half_share=0.001, cap=200.0),
    },
    mix={"reels": 0.6, "influencer": 0.3, "press": 0.1},
    referral_incentive_inr=250.0,
)


def channel_table(blended_cac_usd, market_ceiling, fx=89.0):
    """Per-channel cost in rupees and saturation in arrivals, from one input."""
    out = {}
    for name, c in MARKETING["channels"].items():
        out[name] = dict(cac0=blended_cac_usd * fx * c["mult"],
                         half=max(float(np.median(market_ceiling)) * c["half_share"], 25.0),
                         cap=c["cap"])
    return out


def paid_arrivals(budget, channels, mix):
    """Arrivals bought by one month's budget, with the cost rising as it grows.

    Each channel solves spend = arrivals * cac0 * (1 + arrivals / half) for
    arrivals, which is the closed form of a cost per arrival that doubles at
    `half` arrivals a month. `cap` is a hard ceiling: earned press coverage
    does not scale with money.
    """
    total = np.zeros_like(budget)
    for name, w in mix.items():
        c = channels[name]
        cac0 = c["cac0"]
        half = c["half"]
        s = budget * w
        # arrivals = half/2 * (sqrt(1 + 4*s/(cac0*half)) - 1)
        a = 0.5 * half * (np.sqrt(1.0 + 4.0 * s / np.maximum(cac0 * half, 1e-9)) - 1.0)
        if c["cap"] is not None:
            a = np.minimum(a, c["cap"])
        total += a
    return total


# --------------------------------------------------- the published loop, once
SRC = (HERE / "aifred_model.py").read_text()
MARK_KEYS = "KEYS = ["
MARK_BANDS = "# --------------------------------------------------- coherent outcome bands"
PART_DRIVERS = SRC[: SRC.index(MARK_KEYS)]
PART_LOOP = SRC[SRC.index(MARK_KEYS) : SRC.index(MARK_BANDS)]

# The acquisition and acquisition-cost blocks, replaced rather than patched, so
# that a reader can see exactly what differs from the published model.
OLD_ADDS = """    adds_tot = np.zeros(sh)
    for g in range(G):
        b = users[:, g]
        if g > 0:
            b = np.where(m == launch[:, g], seed_users * tri(0.15, 0.35, 0.7), b)
        live = m >= launch[:, g]
        a = np.where(live, b * rate * np.clip(1 - b / caps[:, g], 0, 1)
                     * np.exp(rng.normal(0, 0.25, sh)), 0.0)
        users[:, g] = np.where(live, np.maximum(b * (1 - churn) + a, 0), 0.0)
        adds_tot += a
    tot = users.sum(1)"""

NEW_ADDS = """    adds_tot = np.zeros(sh)
    adds_organic = np.zeros(sh)
    adds_paid = np.zeros(sh)
    budget = np.zeros(sh) if not MARKETING_ON else (
        np.maximum(SPEND_FLOOR, SPEND_SHARE * prev_revenue))
    bought = paid_arrivals(budget, CHANNELS, MIX) if MARKETING_ON else np.zeros(sh)
    live_any = np.maximum((m >= launch).sum(1), 1)
    for g in range(G):
        b = users[:, g]
        if g > 0:
            b = np.where(m == launch[:, g], seed_users * tri(0.15, 0.35, 0.7), b)
        live = m >= launch[:, g]
        a = np.where(live, b * rate * np.clip(1 - b / caps[:, g], 0, 1)
                     * np.exp(rng.normal(0, 0.25, sh)), 0.0)
        # Media is spent where the market is open, and buys against the same
        # ceiling the organic mechanism saturates into.
        p = np.where(live, bought / live_any * np.clip(1 - b / caps[:, g], 0, 1), 0.0)
        users[:, g] = np.where(live, np.maximum(b * (1 - churn) + a + p, 0), 0.0)
        adds_organic += a
        adds_paid += p
        adds_tot += a + p
    tot = users.sum(1)"""

OLD_SALES = "    sales = adds_tot * cac_0 * cac_growth ** t"
NEW_SALES = """    sales = (adds_tot * cac_0 * cac_growth ** t if not MARKETING_ON
             else budget + adds_organic * REFERRAL_INCENTIVE)"""

OLD_KEYS = '"churn", "arpu_usd", "min_per_user_month"]'
NEW_KEYS = '"churn", "arpu_usd", "min_per_user_month", "adds_organic", "adds_paid", "marketing_spend"]'
OLD_VALS = "min_per_user_month=blended * tasks_day * 30.4)"
NEW_VALS = ("min_per_user_month=blended * tasks_day * 30.4,\n"
            "                adds_organic=adds_organic, adds_paid=adds_paid, marketing_spend=budget)")

assert PART_LOOP.count(OLD_ADDS) == 1 and PART_LOOP.count(OLD_SALES) == 1
assert PART_LOOP.count(OLD_KEYS) == 1 and PART_LOOP.count(OLD_VALS) == 1
LOOP = (PART_LOOP.replace(OLD_ADDS, NEW_ADDS).replace(OLD_SALES, NEW_SALES)
        .replace(OLD_KEYS, NEW_KEYS).replace(OLD_VALS, NEW_VALS))
# The budget follows last month's revenue, so revenue has to be carried forward.
LOOP = LOOP.replace("for m in range(1, MONTHS + 1):\n    t = m - 1",
                    "prev_revenue = np.zeros(sh)\nfor m in range(1, MONTHS + 1):\n    t = m - 1")
assert "prev_revenue = np.zeros(sh)" in LOOP
LOOP = LOOP.replace("    for k, v in vals.items():\n        out[k][t] = v",
                    "    for k, v in vals.items():\n        out[k][t] = v\n    prev_revenue = revenue")


def run(n, seed=DEFAULT_SEED, scenario="viable", marketing=True, cac_usd=None, spend_share=None):
    argv = sys.argv
    sys.argv = ["aifred_model.py", scenario, str(n), str(seed)]
    ns = {
        "__name__": "aifred_growth_model",
        "MARKETING_ON": bool(marketing),
        "SPEND_SHARE": MARKETING["spend_share"] if spend_share is None else spend_share,
        "SPEND_FLOOR": float(MARKETING["spend_floor_inr"]),
        "MIX": MARKETING["mix"],
        "CAC_USD": float(MARKETING["blended_cac_usd"] if cac_usd is None else cac_usd),
        "REFERRAL_INCENTIVE": float(MARKETING["referral_incentive_inr"]),
        "paid_arrivals": paid_arrivals,
    }
    try:
        exec(compile(PART_DRIVERS, "aifred_model.py", "exec"), ns)
        ns["CHANNELS"] = channel_table(ns["CAC_USD"], ns["cap_ind"])
        exec(compile(LOOP, "aifred_model.py(growth)", "exec"), ns)
    finally:
        sys.argv = argv
    return ns


def selftest():
    """With marketing off, the published CSV must come back character for character."""
    ns = run(20000, DEFAULT_SEED, marketing=False)
    published = HERE / "sim_viable.csv"
    df = bands(ns)
    same = df[[c for c in pd.read_csv(published).columns]].to_csv(index=False) == published.read_text()
    return same


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        print("self test:", "rebuilds sim_viable.csv exactly" if selftest() else "FAILED")
        raise SystemExit(0 if selftest() else 1)

    SCENARIO = sys.argv[1] if len(sys.argv) > 1 else "viable"
    N = int(sys.argv[2]) if len(sys.argv) > 2 else 20000
    SEED = int(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_SEED
    print("self test:", "clean" if selftest() else "FAILED")

    base = outcomes(run(N, SEED, SCENARIO, marketing=False))
    with_mk = run(N, SEED, SCENARIO, marketing=True)
    mk = outcomes(with_mk)

    def line(tag, y):
        q = np.quantile(y["peak_need_cr"], [0.5, 0.9])
        return (f'{tag:34s} need p50 {q[0]:6.1f}  p90 {q[1]:6.1f} cr   '
                f'ever profitable {y["profitable_by_m60"].mean():6.1%}   '
                f'crossover m{np.median(y["crossover_month"]):.0f}   '
                f'users m60 {np.median(y["m60_users"]):9,.0f}')
    print()
    print(line("organic only, as published", base))
    print(line(f'with marketing at {MARKETING["spend_share"]:.0%} of revenue', mk))

    # What a paid user may cost before paid acquisition stops paying. The
    # organic-only line is the comparator, not zero.
    rows = []
    for cac in (15, 30, 60, 120, 250, 500, 900, 1500, 2100):
        for share in (0.05, 0.15, 0.25):
            y = outcomes(run(max(N // 4, 2000), SEED, SCENARIO, marketing=True,
                             cac_usd=cac, spend_share=share))
            rows.append({"paid_cac_usd": cac, "spend_share": share,
                         "median_peak_need_cr": float(np.median(y["peak_need_cr"])),
                         "share_profitable_by_m60": float(y["profitable_by_m60"].mean()),
                         "median_crossover_month": float(np.median(y["crossover_month"])),
                         "median_m60_users": float(np.median(y["m60_users"])),
                         "worse_than_organic_only": bool(
                             np.median(y["peak_need_cr"]) > np.median(base["peak_need_cr"]))})
        print(f"  swept ${cac} a paid user")
    sweep = pd.DataFrame(rows)
    sweep.to_csv(HERE / f"growth_sweep_{SCENARIO}.csv", index=False)

    months = np.arange(1, MONTHS + 1)
    o = with_mk["out"]
    split = pd.DataFrame({
        "month": months,
        "adds_organic_plan": o["adds_organic"].mean(1),
        "adds_paid_plan": o["adds_paid"].mean(1),
        "marketing_spend_plan": o["marketing_spend"].mean(1),
        "users_plan": o["users"].mean(1),
    })
    split.to_csv(HERE / f"growth_split_{SCENARIO}.csv", index=False)

    with open(HERE / f"summary_growth_{SCENARIO}.json", "w") as f:
        json.dump({"scenario": SCENARIO, "paths": N, "seed": SEED,
                   "marketing": {k: v for k, v in MARKETING.items()},
                   "organic_only": {k: float(np.median(v)) for k, v in base.items()},
                   "with_marketing": {k: float(np.median(v)) for k, v in mk.items()},
                   "share_profitable_organic_only": float(base["profitable_by_m60"].mean()),
                   "share_profitable_with_marketing": float(mk["profitable_by_m60"].mean())},
                  f, indent=2, default=float)
    print()
    print(sweep.to_string(index=False))
