"""
Two probes of what the model leaves out
=======================================

The sensitivity asks which drivers move the answer inside the model. These two
ask what the model cannot say at all, by putting the missing structure in by hand
and measuring what it costs.

  1. Dependence. Every driver in `aifred_model.py` is drawn independently of every
     other. Real drivers move together. This imposes a signed rank correlation on
     ten of them by the Iman-Conover reordering, which preserves each marginal
     exactly and changes only which draw meets which, then re-runs.

  2. Feedback. The viable scenario raises the India price from $30 to $52 and takes
     no penalty anywhere: churn and word of mouth are drawn from the same
     distributions at either price. That is the model's most consequential silence,
     because the price lever is the second largest thing in it. This charges the
     price a penalty, in retention and in growth together, and finds the penalty at
     which the higher price stops being worth taking.

Neither probe is a correction to the model. Each is a measurement of what its
absence is worth, so the reader knows which way the published numbers lean.

Usage:  python aifred_structural_probes.py [n_paths] [seed]
"""

import json
import sys

import numpy as np
import pandas as pd

from aifred_harness import DEFAULT_SEED, HERE, outcomes, run, selftest

N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_SEED

# Signed, and each one a sentence someone would defend out loud.
PAIRS = {
    ("price_ind", "churn_floor"): (0.40, "a higher price is bought with retention"),
    ("price_ind", "add_rate_0"): (-0.40, "and with word of mouth"),
    ("tasks_day", "churn_0"): (-0.30, "heavy users stay"),
    ("add_rate_0", "churn_0"): (-0.30, "a product people like grows and retains"),
    ("auto_ceil", "eng_exp"): (0.40, "automation is bought with engineers"),
    ("assist_floor", "eng_exp"): (-0.30, "so is a lower handling floor"),
    ("gna0", "eng0"): (0.30, "overhead discipline is one habit, not several"),
}
VARS = sorted({v for pair in PAIRS for v in pair})


def summarise(tag, y):
    q = np.quantile(y["peak_need_cr"], [0.5, 0.75, 0.9, 0.95])
    return {"case": tag, "need_p50_cr": q[0], "need_p75_cr": q[1], "need_p90_cr": q[2],
            "need_p95_cr": q[3], "share_profitable_by_m60": float(y["profitable_by_m60"].mean()),
            "median_crossover_month": float(np.median(y["crossover_month"]))}


print(selftest())
drivers, ns = run(N, SEED)
base = outcomes(ns)

# ------------------------------------------------------------- 1. dependence
k = len(VARS)
R = np.eye(k)
for (a, b), (r, _) in PAIRS.items():
    i, j = VARS.index(a), VARS.index(b)
    R[i, j] = R[j, i] = r
w, V = np.linalg.eigh(R)
if w.min() <= 0:                                  # nearest positive-definite
    R = V @ np.diag(np.clip(w, 1e-6, None)) @ V.T
    d = np.sqrt(np.diag(R))
    R = R / np.outer(d, d)
Z = np.random.default_rng(SEED + 7).standard_normal((N, k)) @ np.linalg.cholesky(R).T
ov = {name: np.sort(drivers[name])[np.argsort(np.argsort(Z[:, j]))]
      for j, name in enumerate(VARS)}
for name in VARS:                                 # the marginals must be untouched
    assert np.allclose(np.sort(ov[name]), np.sort(drivers[name]))
dependence = pd.DataFrame([summarise("independent, as published", base),
                           summarise("correlated", outcomes(run(N, SEED, overrides=ov)[1]))])

# --------------------------------------------------------------- 2. feedback
rng = np.random.default_rng(SEED + 11)
as_spec_price = rng.triangular(22, 30, 44, N)
alt = summarise("the price left at $30, no penalty",
                outcomes(run(N, SEED, overrides={"price_ind": as_spec_price})[1]))
rows = [alt]
for p in (0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50):
    y = outcomes(run(N, SEED, overrides={
        "churn_0": drivers["churn_0"] * (1 + p),
        "churn_floor": drivers["churn_floor"] * (1 + p),
        "add_rate_0": drivers["add_rate_0"] * (1 - p)})[1])
    r = summarise(f"$52 costing {p:.0%} churn and {p:.0%} growth", y)
    r["penalty"] = p
    r["worse_than_leaving_the_price_at_30"] = bool(r["need_p50_cr"] > alt["need_p50_cr"])
    rows.append(r)
feedback = pd.DataFrame(rows)
paid = feedback[feedback.get("worse_than_leaving_the_price_at_30") == True]
break_even = float(paid.penalty.min()) if len(paid) else float("nan")

dependence.to_csv(HERE / "probe_dependence.csv", index=False)
feedback.to_csv(HERE / "probe_price_feedback.csv", index=False)
with open(HERE / "summary_probes.json", "w") as f:
    json.dump({"paths": N, "seed": SEED,
               "correlations": {f"{a} x {b}": {"rho": r, "because": why}
                                for (a, b), (r, why) in PAIRS.items()},
               "dependence": dependence.to_dict("records"),
               "price_feedback": feedback.to_dict("records"),
               "price_break_even_penalty": break_even}, f, indent=2, default=float)

if __name__ == "__main__":
    pd.set_option("display.width", 200)
    print("\n1. the same marginals, made to move together")
    print(dependence.to_string(index=False))
    print("\n2. what the $52 price may cost before it stops paying")
    print(feedback.to_string(index=False))
    print(f"\nbreak-even: the higher price is worth taking while it costs less than "
          f"{break_even:.0%} more churn and {break_even:.0%} slower growth")
