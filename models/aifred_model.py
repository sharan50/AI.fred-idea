"""
AI.fred probabilistic trajectory and funding model
==================================================

Monte Carlo over 60 months, from first paying user to Series B.

What is different from a three-column scenario sheet
----------------------------------------------------
Every driver is a distribution, not a point. Paths are then ranked by outcome
and the conservative and optimistic lines are drawn from *coherent families of
paths*, not from blending the 10th percentile of revenue with the 10th
percentile of cost, which describes no world that can actually happen. The
planning line weights those two families 65 / 35 as instructed.

Scenarios
---------
as_specified : the venture as currently written up. $20-$40 tiers, two tasks a
               day, India first, UK and US later.
viable       : the same business with the four parameters the earlier work
               identified as binding moved to where they would have to be.
               Run both. The gap between them is the plan.

Usage:  python aifred_model.py [scenario] [n_paths] [seed]
"""

import sys
import json
import pathlib
import numpy as np
import pandas as pd

SCENARIO = sys.argv[1] if len(sys.argv) > 1 else "as_specified"
N = int(sys.argv[2]) if len(sys.argv) > 2 else 20000
SEED = int(sys.argv[3]) if len(sys.argv) > 3 else 20260913
MONTHS, G = 60, 3
rng = np.random.default_rng(SEED)
sh = (N,)


def tri(lo, mode, hi):
    return rng.triangular(lo, mode, hi, sh)


def logn(p10, p90):
    mu = (np.log(p10) + np.log(p90)) / 2
    sigma = (np.log(p90) - np.log(p10)) / (2 * 1.2816)
    return rng.lognormal(mu, sigma, sh)


# Overrides applied in the viable scenario, with the reasoning in the doc.
V = SCENARIO == "viable"

# ------------------------------------------------------------------ drivers
seed_users = tri(80, 200, 400)
add_rate_0 = tri(0.10, 0.18, 0.30)
add_decay = tri(0.985, 0.992, 0.997)
cap_ind = logn(25000, 250000)
cap_uk = logn(8000, 90000)
cap_us = logn(12000, 200000)

churn_0 = tri(0.06, 0.09, 0.14)
churn_floor = tri(0.020, 0.032, 0.055) if not V else tri(0.014, 0.024, 0.040)
churn_halflife = tri(8, 14, 24)
churn_vol = tri(0.10, 0.20, 0.35)

cac_0 = logn(600, 2200)
cac_growth = tri(1.005, 1.012, 1.022)

# LEVER 1 usage. Promised volume is the single largest cost driver.
tasks_day = tri(0.9, 1.5, 2.4) if not V else tri(0.5, 0.85, 1.3)

# LEVER 2 price.
price_ind = tri(22, 30, 44) if not V else tri(38, 52, 72)
price_uk = tri(38, 55, 85) if not V else tri(60, 85, 120)
price_us = tri(45, 70, 110) if not V else tri(75, 105, 150)
price_drift = tri(0.000, 0.0025, 0.006)
fx = tri(84, 89, 96)

# LEVER 3 automation reach.
auto_0 = tri(0.30, 0.42, 0.52)
auto_ceil = tri(0.58, 0.72, 0.88) if not V else tri(0.68, 0.80, 0.92)
auto_hl = tri(9, 15, 26) if not V else tri(7, 11, 18)
jump_rate = tri(0.02, 0.045, 0.08)
jump_size = tri(0.01, 0.03, 0.06)
tail_0 = tri(0.05, 0.09, 0.16)
tail_floor = tri(0.02, 0.045, 0.08)

# LEVER 4 handling time, driven by tooling rather than practice alone.
assist_0 = tri(4.5, 7.0, 11.0)
assist_floor = tri(1.8, 2.8, 4.2) if not V else tri(1.0, 1.7, 2.6)
tail_min_0 = tri(30, 48, 85)
tail_floor_min = tri(16, 26, 40) if not V else tri(12, 20, 30)
learn_hl = tri(8, 14, 24)
attrition = tri(0.22, 0.38, 0.55)

tok0 = tri(0.14, 0.28, 0.55)
tok_decline = tri(0.030, 0.055, 0.080)
tok_usage_growth = tri(0.005, 0.020, 0.040)
tok_plateau = tri(18, 30, 48)

gen_ctc = tri(420000, 520000, 650000)
gen_infl = tri(0.07, 0.095, 0.13)
mgmt_infl = tri(0.10, 0.145, 0.20)
mgmt_scale = tri(0.00, 0.06, 0.14)
oncost = tri(0.16, 0.21, 0.28)
seat0 = tri(2200, 3200, 4800)
seat_scale = tri(1.15, 1.45, 1.90)
perks = tri(400, 1100, 2400)
sup_ratio = tri(0.10, 0.15, 0.22)
qa_ratio = tri(0.03, 0.055, 0.09)
sup_mult = tri(2.0, 2.5, 3.2)
prod_min = tri(330, 380, 415)
util = tri(0.62, 0.71, 0.80)

eng0 = tri(3, 5, 8)
eng_ctc = tri(2600000, 3600000, 5200000)
eng_exp = tri(0.22, 0.34, 0.48) if not V else tri(0.18, 0.27, 0.38)
eng_infl = tri(0.10, 0.15, 0.21)
replat1_m, replat1_c = tri(14, 20, 28), logn(3500000, 18000000)
replat2_m, replat2_c = tri(30, 38, 48), logn(8000000, 45000000)

legal_base = logn(180000, 700000)
soc2_m, soc2_c = tri(10, 16, 24), logn(2500000, 9000000)
audit = logn(1200000, 5000000)
insur_1k = logn(9000, 45000)
inc_rate, inc_cost = tri(0.010, 0.025, 0.055), logn(400000, 9000000)

uk_m = np.round(tri(13, 20, 30)).astype(int)
us_m = np.round(tri(26, 36, 50)).astype(int)
uk_entry, us_entry = logn(6000000, 30000000), logn(12000000, 70000000)
uk_legal, us_legal = logn(350000, 1600000), logn(700000, 3500000)
fric0, fric_hl = tri(0.12, 0.22, 0.36), tri(6, 12, 22)

psp, makegood = tri(0.020, 0.026, 0.035), tri(0.010, 0.022, 0.045)
gna0, gna_exp = logn(600000, 2200000), tri(0.25, 0.38, 0.52)

KEYS = ["users", "revenue", "labour", "tokens", "eng", "compliance", "sales",
        "gna", "onetime", "total_cost", "contribution", "cum_cash", "gen_heads",
        "floor_heads", "eng_heads", "blended_min", "auto_share", "tok_task_usd",
        "churn", "arpu_usd", "min_per_user_month"]
out = {k: np.zeros((MONTHS, N)) for k in KEYS}

users = np.zeros((N, G)); users[:, 0] = seed_users
caps = np.stack([cap_ind, cap_uk, cap_us], 1)
prices = np.stack([price_ind, price_uk, price_us], 1)
launch = np.stack([np.ones(N, int), uk_m, us_m], 1)
exp_idx = np.zeros(sh); cum = np.zeros(sh); ceil_ = auto_ceil.copy()
m_attr = 1 - (1 - attrition) ** (1 / 12)

for m in range(1, MONTHS + 1):
    t = m - 1
    ceil_ = np.minimum(0.93, ceil_ + (rng.random(sh) < jump_rate) * jump_size)
    auto = ceil_ - (ceil_ - auto_0) * np.exp(-np.log(2) / auto_hl * t)
    tot = users.sum(1) + 1e-9
    f_uk = fric0 * np.exp(-np.log(2) / fric_hl * np.maximum(0, m - launch[:, 1]))
    f_us = fric0 * np.exp(-np.log(2) / fric_hl * np.maximum(0, m - launch[:, 2]))
    auto_e = np.clip(auto - f_uk * users[:, 1] / tot - f_us * users[:, 2] / tot, 0.05, 0.93)
    tail_s = tail_floor + (tail_0 - tail_floor) * np.exp(-np.log(2) / auto_hl * t)
    assist_s = np.maximum(0, 1 - auto_e - tail_s)

    target = 1 - np.exp(-np.log(2) / learn_hl * t)
    exp_idx = np.clip(exp_idx + (target - exp_idx) * 0.35 - m_attr * exp_idx * 0.6, 0, 1)
    a_min = assist_0 - (assist_0 - assist_floor) * exp_idx
    t_min = tail_min_0 - (tail_min_0 - tail_floor_min) * exp_idx
    blended = assist_s * a_min + tail_s * t_min

    churn = churn_floor + (churn_0 - churn_floor) * np.exp(-np.log(2) / churn_halflife * t)
    churn = churn * (1 + churn_vol * np.clip(tot / caps.sum(1), 0, 1))
    churn = np.clip(churn * np.exp(rng.normal(0, 0.18, sh)), 0.005, 0.30)
    rate = add_rate_0 * add_decay ** t

    adds_tot = np.zeros(sh)
    for g in range(G):
        b = users[:, g]
        if g > 0:
            b = np.where(m == launch[:, g], seed_users * tri(0.15, 0.35, 0.7), b)
        live = m >= launch[:, g]
        a = np.where(live, b * rate * np.clip(1 - b / caps[:, g], 0, 1)
                     * np.exp(rng.normal(0, 0.25, sh)), 0.0)
        users[:, g] = np.where(live, np.maximum(b * (1 - churn) + a, 0), 0.0)
        adds_tot += a
    tot = users.sum(1)

    rev_usd = (users * prices * (1 + price_drift[:, None]) ** t).sum(1)
    revenue = rev_usd * fx
    tasks = tot * tasks_day
    hmin = tasks * blended
    gen = np.ceil(hmin / np.maximum(prod_min * util, 1))
    sup, qa = np.ceil(gen * sup_ratio), np.ceil(gen * qa_ratio)
    heads = gen + sup + qa
    wg = (1 + gen_infl) ** (t / 12)
    wm = (1 + mgmt_infl + mgmt_scale * np.log10(np.maximum(heads, 10) / 10)) ** (t / 12)
    seatm = 1 + (seat_scale - 1) * np.clip(np.log10(np.maximum(heads, 10) / 10) / 1.5, 0, 1)
    labour = ((gen * gen_ctc * wg + (sup + qa) * gen_ctc * sup_mult * wm) / 12
              * (1 + oncost) + heads * (seat0 * seatm + perks))

    tok_task = tok0 * (1 - tok_decline) ** t * (1 + tok_usage_growth) ** np.minimum(t, tok_plateau)
    tokens = tasks * 30.4 * tok_task * fx

    eheads = np.ceil(eng0 * (np.maximum(tot, 100) / 100) ** eng_exp
                     * (1 + 0.25 * (m >= launch[:, 1]) + 0.35 * (m >= launch[:, 2])))
    eng = eheads * eng_ctc * (1 + eng_infl) ** (t / 12) / 12 * (1 + oncost)

    comp = (legal_base + np.where(m >= launch[:, 1], uk_legal, 0)
            + np.where(m >= launch[:, 2], us_legal, 0)
            + insur_1k * tot / 1000 + np.where(m > soc2_m, audit / 12, 0))
    sales = adds_tot * cac_0 * cac_growth ** t
    gna = gna0 * (np.maximum(tot, 100) / 100) ** gna_exp
    one = (np.where(np.round(replat1_m) == m, replat1_c, 0)
           + np.where(np.round(replat2_m) == m, replat2_c, 0)
           + np.where(np.round(soc2_m) == m, soc2_c, 0)
           + np.where(launch[:, 1] == m, uk_entry, 0)
           + np.where(launch[:, 2] == m, us_entry, 0)
           + (rng.random(sh) < inc_rate) * inc_cost)
    total = labour + tokens + eng + comp + sales + gna + one + revenue * (psp + makegood)
    contrib = revenue - total
    cum += contrib

    vals = dict(users=tot, revenue=revenue, labour=labour, tokens=tokens, eng=eng,
                compliance=comp, sales=sales, gna=gna, onetime=one, total_cost=total,
                contribution=contrib, cum_cash=cum, gen_heads=gen, floor_heads=heads,
                eng_heads=eheads, blended_min=blended, auto_share=auto_e,
                tok_task_usd=tok_task, churn=churn,
                arpu_usd=rev_usd / np.maximum(tot, 1),
                min_per_user_month=blended * tasks_day * 30.4)
    for k, v in vals.items():
        out[k][t] = v

# --------------------------------------------------- coherent outcome bands
# Rank paths by a single outcome statistic so the conservative and optimistic
# lines each describe a consistent world.
score = out["cum_cash"][-1] + 0.00001 * out["revenue"][-1] * 12
order = np.argsort(score)
lo_idx = order[int(0.05 * N):int(0.20 * N)]      # conservative family
hi_idx = order[int(0.80 * N):int(0.95 * N)]      # optimistic family
mid_idx = order[int(0.45 * N):int(0.55 * N)]

rows = []
for t in range(MONTHS):
    r = {"month": t + 1}
    for k in KEYS:
        a = out[k][t]
        r[f"{k}_cons"] = a[lo_idx].mean()
        r[f"{k}_opt"] = a[hi_idx].mean()
        r[f"{k}_med"] = a[mid_idx].mean()
        r[f"{k}_plan"] = 0.65 * a[lo_idx].mean() + 0.35 * a[hi_idx].mean()
    rows.append(r)
df = pd.DataFrame(rows)

# --------------------------------------------------------- funding schedule
WINDOWS = {"Seed": (1, 18), "Series A": (19, 36), "Series B": (37, 60)}


def window_burn(series, a, b):
    s = series[a - 1:b]
    return float(-np.minimum(s, 0).sum())


def funding_table(col):
    res = {}
    for name, (a, b) in WINDOWS.items():
        burn = window_burn(df[f"contribution_{col}"].values, a, b)
        res[name] = {"months": f"{a}-{b}", "burn_inr": burn,
                     "raise_inr": burn * 1.3, "raise_usd": burn * 1.3 / 89}
    return res


summary = {
    "scenario": SCENARIO, "paths": N,
    "share_profitable_by_m60": float((out["contribution"][-1] > 0).mean()),
    "share_profitable_by_m36": float((out["contribution"][35] > 0).mean()),
    "peak_cash_need_usd": {
        "conservative": float(-df.cum_cash_cons.min() / 89),
        "plan": float(-df.cum_cash_plan.min() / 89),
        "optimistic": float(-df.cum_cash_opt.min() / 89)},
    "users_m36": {"cons": float(df.users_cons[35]), "plan": float(df.users_plan[35]),
                  "opt": float(df.users_opt[35])},
    "min_per_user_month_m36": {"cons": float(df.min_per_user_month_cons[35]),
                               "plan": float(df.min_per_user_month_plan[35])},
    "arpu_usd_m36": {"plan": float(df.arpu_usd_plan[35])},
    "funding_plan": funding_table("plan"),
    "funding_conservative": funding_table("cons"),
}

OUT = pathlib.Path(__file__).resolve().parent / "out"
OUT.mkdir(exist_ok=True)
df.to_csv(OUT / f"sim_{SCENARIO}.csv", index=False)
with open(OUT / f"summary_{SCENARIO}.json", "w") as f:
    json.dump(summary, f, indent=2, default=float)

if __name__ == "__main__":
    print(json.dumps(summary, indent=2, default=float))
    print("\nmonth |  users cons/plan/opt      | revenue plan | contrib plan | cum cash plan")
    for m in [6, 12, 18, 24, 30, 36, 48, 60]:
        r = df.iloc[m - 1]
        print(f"{m:5d} | {r.users_cons:6.0f}/{r.users_plan:7.0f}/{r.users_opt:8.0f} |"
              f" {r.revenue_plan/1e5:9.1f}L | {r.contribution_plan/1e5:9.1f}L |"
              f" {r.cum_cash_plan/1e7:8.2f}Cr")
