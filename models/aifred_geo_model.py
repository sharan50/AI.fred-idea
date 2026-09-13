"""
AI.fred geography and data layer model
======================================

Extends aifred_model.py with the three things the previous run treated too
crudely:

1. Acquisition cost and churn by geography. A US subscriber is not an Indian
   subscriber at three times the price; the cost of finding one is an order of
   magnitude higher, and the alternatives available to them are better.
2. The real cost of operating abroad. A local entity, a country lead, local
   accounting and counsel, and a night shift premium on the Indian staff who
   serve those users.
3. A commerce take rate layer, which is the honest version of the data thesis:
   revenue from transactions the user already asked you to execute.

Scenarios: india_only | expansion | expansion_commerce

Usage:  python aifred_geo_model.py [scenario] [n_paths] [seed]
"""

import sys
import json
import numpy as np
import pandas as pd

SC = sys.argv[1] if len(sys.argv) > 1 else "expansion"
N = int(sys.argv[2]) if len(sys.argv) > 2 else 20000
SEED = int(sys.argv[3]) if len(sys.argv) > 3 else 20260913
MONTHS, G = 60, 3
rng = np.random.default_rng(SEED)
sh = (N,)
EXPAND = SC in ("expansion", "expansion_commerce", "foreign_led")
FLED = SC == "foreign_led"
COMMERCE = SC in ("expansion_commerce", "foreign_led")


def tri(a, b, c):
    return rng.triangular(a, b, c, sh)


def logn(p10, p90):
    mu = (np.log(p10) + np.log(p90)) / 2
    sg = (np.log(p90) - np.log(p10)) / (2 * 1.2816)
    return rng.lognormal(mu, sg, sh)


# ---- demand -----------------------------------------------------------------
seed_users = tri(80, 200, 400)
add_rate_0 = tri(0.10, 0.18, 0.30)
add_decay = tri(0.985, 0.992, 0.997)
caps = np.stack([logn(25000, 250000), logn(8000, 90000), logn(12000, 200000)], 1)
churn_0, churn_floor = tri(0.06, 0.09, 0.14), tri(0.014, 0.024, 0.040)
churn_hl, churn_vol = tri(8, 14, 24), tri(0.10, 0.20, 0.35)
# Abroad the user has more alternatives and higher expectations.
foreign_churn_mult = tri(0.90, 1.15, 1.45)

# Acquisition cost by geography, INR. This is the line the PPP argument forgets.
cac = np.stack([logn(600, 2200), logn(4000, 18000), logn(5000, 25000)], 1)
cac_growth = tri(1.005, 1.012, 1.022)

tasks_day = tri(0.5, 0.85, 1.3)
prices = np.stack([tri(38, 52, 72), tri(60, 85, 120), tri(75, 105, 150)], 1)
price_drift, fx = tri(0.0, 0.0025, 0.006), tri(84, 89, 96)

# ---- delivery ---------------------------------------------------------------
auto_0, auto_ceil, auto_hl = tri(0.30, 0.42, 0.52), tri(0.68, 0.80, 0.92), tri(7, 11, 18)
jump_rate, jump_size = tri(0.02, 0.045, 0.08), tri(0.01, 0.03, 0.06)
tail_0, tail_floor = tri(0.05, 0.09, 0.16), tri(0.02, 0.045, 0.08)
assist_0, assist_floor = tri(4.5, 7.0, 11.0), tri(1.0, 1.7, 2.6)
tail_min_0, tail_floor_min = tri(30, 48, 85), tri(12, 20, 30)
learn_hl, attrition = tri(8, 14, 24), tri(0.22, 0.38, 0.55)
# Serving UK and US from India means night shifts and a higher English bar.
night_premium = tri(0.20, 0.32, 0.48)

tok0, tok_dec = tri(0.14, 0.28, 0.55), tri(0.030, 0.055, 0.080)
tok_grow, tok_plat = tri(0.005, 0.020, 0.040), tri(18, 30, 48)

gen_ctc, gen_infl = tri(420000, 520000, 650000), tri(0.07, 0.095, 0.13)
mgmt_infl, mgmt_scale = tri(0.10, 0.145, 0.20), tri(0.00, 0.06, 0.14)
oncost = tri(0.16, 0.21, 0.28)
seat0, seat_scale, perks = tri(2200, 3200, 4800), tri(1.15, 1.45, 1.90), tri(400, 1100, 2400)
sup_ratio, qa_ratio, sup_mult = tri(0.10, 0.15, 0.22), tri(0.03, 0.055, 0.09), tri(2.0, 2.5, 3.2)
prod_min, util = tri(330, 380, 415), tri(0.62, 0.71, 0.80)

eng0, eng_ctc = tri(3, 5, 8), tri(2600000, 3600000, 5200000)
eng_exp, eng_infl = tri(0.18, 0.27, 0.38), tri(0.10, 0.15, 0.21)
rep1_m, rep1_c = tri(14, 20, 28), logn(3500000, 18000000)
rep2_m, rep2_c = tri(30, 38, 48), logn(8000000, 45000000)

legal_base = logn(180000, 700000)
soc2_m, soc2_c, audit = tri(10, 16, 24), logn(2500000, 9000000), logn(1200000, 5000000)
insur_1k = logn(9000, 45000)
inc_rate, inc_cost = tri(0.010, 0.025, 0.055), logn(400000, 9000000)

uk_m = np.round(tri(8, 12, 18) if FLED else tri(13, 20, 30)).astype(int) if EXPAND else np.full(N, 9999)
us_m = np.round(tri(16, 24, 34) if FLED else tri(26, 36, 50)).astype(int) if EXPAND else np.full(N, 9999)
uk_entry, us_entry = logn(6000000, 30000000), logn(12000000, 70000000)
# Standing cost of a foreign entity: country lead, local ops, counsel,
# accounting, registered office, local insurance. Scales mildly with users.
uk_fixed, us_fixed = logn(900000, 3200000), logn(1800000, 6500000)
geo_fixed_exp = tri(0.15, 0.25, 0.38)
fric0, fric_hl = tri(0.12, 0.22, 0.36), tri(6, 12, 22)

psp, makegood = tri(0.020, 0.026, 0.035), tri(0.010, 0.022, 0.045)
gna0, gna_exp = logn(600000, 2200000), tri(0.25, 0.38, 0.52)

# ---- commerce layer ---------------------------------------------------------
txn_share = tri(0.30, 0.45, 0.60)          # tasks that involve a purchase
monetisable = tri(0.20, 0.42, 0.65)        # of those, ones with a payable channel
take_rate = tri(0.012, 0.028, 0.050)
atv = np.stack([tri(1500, 3500, 7000), tri(9000, 14000, 26000), tri(10000, 16000, 30000)], 1)
commerce_start = tri(12, 16, 22)           # merchant agreements take time
commerce_ramp = tri(12, 18, 30)

KEYS = ["users", "users_ind", "users_fgn", "sub_rev", "commerce_rev", "revenue",
        "labour", "tokens", "eng", "compliance", "geo_fixed", "sales", "gna",
        "onetime", "total_cost", "contribution", "cum_cash", "floor_heads",
        "blended_min", "arpu_usd", "gmv"]
out = {k: np.zeros((MONTHS, N)) for k in KEYS}

users = np.zeros((N, G)); users[:, 0] = seed_users
launch = np.stack([np.ones(N, int), uk_m, us_m], 1)
exp_idx, cum, ceil_ = np.zeros(sh), np.zeros(sh), auto_ceil.copy()
m_attr = 1 - (1 - attrition) ** (1 / 12)

for m in range(1, MONTHS + 1):
    t = m - 1
    ceil_ = np.minimum(0.93, ceil_ + (rng.random(sh) < jump_rate) * jump_size)
    auto = ceil_ - (ceil_ - auto_0) * np.exp(-np.log(2) / auto_hl * t)
    tot = users.sum(1) + 1e-9
    fgn = users[:, 1] + users[:, 2]
    fgn_w = fgn / tot
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

    ch = churn_floor + (churn_0 - churn_floor) * np.exp(-np.log(2) / churn_hl * t)
    ch = ch * (1 + churn_vol * np.clip(tot / caps.sum(1), 0, 1))
    ch = np.clip(ch * np.exp(rng.normal(0, 0.18, sh)), 0.005, 0.30)
    rate = add_rate_0 * add_decay ** t

    sales = np.zeros(sh)
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
    tot = users.sum(1)
    fgn = users[:, 1] + users[:, 2]

    sub_usd = (users * prices * (1 + price_drift[:, None]) ** t).sum(1)
    sub_rev = sub_usd * fx

    tasks = tot * tasks_day
    if COMMERCE:
        ramp = np.clip((m - commerce_start) / commerce_ramp, 0, 1)
        per_geo_tasks = users * tasks_day[:, None]
        gmv = (per_geo_tasks * atv).sum(1) * 30.4 * txn_share
        commerce = gmv * monetisable * take_rate * ramp
    else:
        gmv = np.zeros(sh); commerce = np.zeros(sh)
    revenue = sub_rev + commerce

    hmin = tasks * blended
    gen = np.ceil(hmin / np.maximum(prod_min * util, 1))
    sup, qa = np.ceil(gen * sup_ratio), np.ceil(gen * qa_ratio)
    heads = gen + sup + qa
    wg = (1 + gen_infl) ** (t / 12) * (1 + night_premium * fgn_w)
    wm = (1 + mgmt_infl + mgmt_scale * np.log10(np.maximum(heads, 10) / 10)) ** (t / 12)
    seatm = 1 + (seat_scale - 1) * np.clip(np.log10(np.maximum(heads, 10) / 10) / 1.5, 0, 1)
    labour = ((gen * gen_ctc * wg + (sup + qa) * gen_ctc * sup_mult * wm) / 12
              * (1 + oncost) + heads * (seat0 * seatm + perks))

    tok_task = tok0 * (1 - tok_dec) ** t * (1 + tok_grow) ** np.minimum(t, tok_plat)
    tokens = tasks * 30.4 * tok_task * fx

    eheads = np.ceil(eng0 * (np.maximum(tot, 100) / 100) ** eng_exp
                     * (1 + 0.25 * (m >= launch[:, 1]) + 0.35 * (m >= launch[:, 2])))
    eng = eheads * eng_ctc * (1 + eng_infl) ** (t / 12) / 12 * (1 + oncost)

    scale_f = (np.maximum(fgn, 50) / 50) ** geo_fixed_exp
    geo_fixed = (np.where(m >= launch[:, 1], uk_fixed * scale_f, 0)
                 + np.where(m >= launch[:, 2], us_fixed * scale_f, 0))
    comp = (legal_base + insur_1k * tot / 1000 + np.where(m > soc2_m, audit / 12, 0))
    gna = gna0 * (np.maximum(tot, 100) / 100) ** gna_exp
    one = (np.where(np.round(rep1_m) == m, rep1_c, 0)
           + np.where(np.round(rep2_m) == m, rep2_c, 0)
           + np.where(np.round(soc2_m) == m, soc2_c, 0)
           + np.where(launch[:, 1] == m, uk_entry, 0)
           + np.where(launch[:, 2] == m, us_entry, 0)
           + (rng.random(sh) < inc_rate) * inc_cost)
    total = (labour + tokens + eng + comp + geo_fixed + sales + gna + one
             + revenue * (psp + makegood))
    contrib = revenue - total
    cum += contrib

    for k, v in dict(users=tot, users_ind=users[:, 0], users_fgn=fgn, sub_rev=sub_rev,
                     commerce_rev=commerce, revenue=revenue, labour=labour, tokens=tokens,
                     eng=eng, compliance=comp, geo_fixed=geo_fixed, sales=sales, gna=gna,
                     onetime=one, total_cost=total, contribution=contrib, cum_cash=cum,
                     floor_heads=heads, blended_min=blended,
                     arpu_usd=(revenue / fx) / np.maximum(tot, 1), gmv=gmv).items():
        out[k][t] = v

score = out["cum_cash"][-1] + 0.00001 * out["revenue"][-1] * 12
o = np.argsort(score)
lo, hi, mid = o[int(.05 * N):int(.20 * N)], o[int(.80 * N):int(.95 * N)], o[int(.45 * N):int(.55 * N)]
rows = []
for t in range(MONTHS):
    r = {"month": t + 1}
    for k in KEYS:
        a = out[k][t]
        r[f"{k}_cons"], r[f"{k}_opt"], r[f"{k}_med"] = a[lo].mean(), a[hi].mean(), a[mid].mean()
        r[f"{k}_plan"] = 0.65 * a[lo].mean() + 0.35 * a[hi].mean()
    rows.append(r)
df = pd.DataFrame(rows)


def burn(col, a, b):
    return float(-np.minimum(df[f"contribution_{col}"].values[a - 1:b], 0).sum())


summary = {
    "scenario": SC,
    "profitable_by_m36": float((out["contribution"][35] > 0).mean()),
    "profitable_by_m60": float((out["contribution"][59] > 0).mean()),
    "peak_cash_usd_plan": float(-df.cum_cash_plan.min() / 89),
    "peak_cash_usd_cons": float(-df.cum_cash_cons.min() / 89),
    "m36": {"users": float(df.users_plan[35]), "foreign_share":
            float(df.users_fgn_plan[35] / max(df.users_plan[35], 1)),
            "arpu_usd": float(df.arpu_usd_plan[35]),
            "revenue_cr": float(df.revenue_plan[35] / 1e7),
            "contribution_cr": float(df.contribution_plan[35] / 1e7)},
    "m60": {"users": float(df.users_plan[59]), "foreign_share":
            float(df.users_fgn_plan[59] / max(df.users_plan[59], 1)),
            "arpu_usd": float(df.arpu_usd_plan[59]),
            "revenue_cr": float(df.revenue_plan[59] / 1e7),
            "contribution_cr": float(df.contribution_plan[59] / 1e7),
            "commerce_share": float(df.commerce_rev_plan[59] / max(df.revenue_plan[59], 1)),
            "gmv_cr_month": float(df.gmv_plan[59] / 1e7)},
    "rounds_plan": {k: burn("plan", a, b) / 1e7 for k, (a, b) in
                    {"Seed(1-18)": (1, 18), "A(19-36)": (19, 36), "B(37-60)": (37, 60)}.items()},
    "rounds_cons": {k: burn("cons", a, b) / 1e7 for k, (a, b) in
                    {"Seed(1-18)": (1, 18), "A(19-36)": (19, 36), "B(37-60)": (37, 60)}.items()},
}
df.to_csv(f"geo_{SC}.csv", index=False)
json.dump(summary, open(f"geosum_{SC}.json", "w"), indent=2, default=float)
if __name__ == "__main__":
    print(json.dumps(summary, indent=2, default=float))
