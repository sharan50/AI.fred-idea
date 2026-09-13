"""
AI.fred sensitivity: where the biggest swings are, and what breaks the business
==============================================================================

This does not restate the trajectory. It asks of the same model three questions:

  1. Which drivers own the variance? First-order Sobol indices, estimated by
     binning on each driver's rank. Every driver in `aifred_model.py` is drawn
     independently of every other, so a conditional mean at a given driver value
     is already the partial effect of that driver: no confounding to remove.
  2. How much is that worth in units? The median outcome in a driver's bottom
     decile against its top decile, a tornado in crore and in months.
  3. Where does it break? Each driver is pinned to a value across the whole
     sample and the model re-run, sweeping the value over the driver's own
     support. The pin happens after the draws, so every run in a sweep shares
     the same random numbers as every other and the differences are the driver's
     alone.

It reuses `aifred_model.py` rather than restating it: the file is split at its
own section markers and the pieces are executed in order, so the drivers and the
month loop here are literally the code that produced `sim_viable.csv`. The self
test rebuilds that file and compares, and refuses to write anything if it differs.

Usage:  python aifred_sensitivity.py [scenario] [n_paths] [sweep_paths] [seed]
"""

import json
import pathlib
import sys

import numpy as np
import pandas as pd

HERE = pathlib.Path(__file__).resolve().parent
SRC = (HERE / "aifred_model.py").read_text()
MARK_KEYS = "KEYS = ["
MARK_BANDS = "# --------------------------------------------------- coherent outcome bands"
MARK_FUND = "# --------------------------------------------------------- funding schedule"
PART_DRIVERS = SRC[: SRC.index(MARK_KEYS)]
PART_LOOP = SRC[SRC.index(MARK_KEYS) : SRC.index(MARK_BANDS)]
PART_BANDS = SRC[SRC.index(MARK_BANDS) : SRC.index(MARK_FUND)]

SCENARIO = sys.argv[1] if len(sys.argv) > 1 else "viable"
N = int(sys.argv[2]) if len(sys.argv) > 2 else 20000
NSW = int(sys.argv[3]) if len(sys.argv) > 3 else 6000
SEED = int(sys.argv[4]) if len(sys.argv) > 4 else 20260913
MONTHS = 60
CR = 1e7
FX_REPORT = 89.0  # the reporting rate, as in the publication

# The drivers worth naming: the model's own variable names, with the words the
# record uses for them. Anything not listed is still scored, under its own name.
LABELS = {
    "tasks_day": "tasks a user runs a day",
    "price_ind": "India price, $ a month",
    "price_uk": "UK price, $ a month",
    "price_us": "US price, $ a month",
    "auto_ceil": "automation ceiling, share of tasks",
    "auto_hl": "months to half the automation gap",
    "auto_0": "automation at month 1",
    "assist_floor": "assisted task floor, minutes",
    "assist_0": "assisted task at month 1, minutes",
    "tail_floor_min": "tail task floor, minutes",
    "tail_min_0": "tail task at month 1, minutes",
    "tail_0": "tail share at month 1",
    "tail_floor": "tail share floor",
    "churn_0": "churn at month 1",
    "churn_floor": "churn floor",
    "churn_halflife": "months to half the churn gap",
    "churn_vol": "churn sensitivity to saturation",
    "seed_users": "users at month 1",
    "add_rate_0": "referral and growth rate at month 1",
    "add_decay": "monthly decay of that rate",
    "cap_ind": "India ceiling, users",
    "cap_uk": "UK ceiling, users",
    "cap_us": "US ceiling, users",
    "cac_0": "cost to acquire a user, Rs",
    "cac_growth": "monthly growth in that cost",
    "tok0": "tokens a task at month 1, $",
    "tok_decline": "monthly decline in token price",
    "tok_usage_growth": "monthly growth in tokens a task",
    "gen_ctc": "generalist cost to company, Rs a year",
    "sup_mult": "supervisor and QA cost multiple",
    "sup_ratio": "supervisors per generalist",
    "qa_ratio": "QA per generalist",
    "prod_min": "productive minutes a person a month",
    "util": "utilisation",
    "eng0": "engineers at 100 users",
    "eng_exp": "engineering scaling exponent",
    "eng_ctc": "engineer cost to company, Rs a year",
    "uk_m": "UK launch month",
    "us_m": "US launch month",
    "uk_entry": "UK entry cost, Rs",
    "us_entry": "US entry cost, Rs",
    "fric0": "new-market friction at launch",
    "fric_hl": "months to half that friction",
    "fx": "rupees to the dollar",
    "gna0": "G&A at 100 users, Rs a month",
    "gna_exp": "G&A scaling exponent",
    "replat1_c": "first replatform, Rs",
    "replat2_c": "second replatform, Rs",
    "soc2_c": "SOC 2, Rs",
    "audit": "annual audit, Rs",
    "inc_cost": "cost of an incident, Rs",
    "inc_rate": "incidents a month",
    "psp": "payment fees, share of revenue",
    "makegood": "make-goods, share of revenue",
    "attrition": "annual attrition of the floor",
    "learn_hl": "months to half the learning gap",
    "oncost": "employer on-costs",
}
# The four the record calls the levers, in the order it states them.
LEVERS = ["tasks_day", "price_ind", "auto_ceil", "assist_floor"]


def run(n, seed, overrides=None):
    """Execute the published model's own driver block and month loop."""
    argv = sys.argv
    sys.argv = ["aifred_model.py", SCENARIO, str(n), str(seed)]
    ns = {"__name__": "aifred_model_sensitivity"}
    try:
        exec(compile(PART_DRIVERS, "aifred_model.py", "exec"), ns)
        drivers = {k: v for k, v in ns.items()
                   if isinstance(v, np.ndarray) and v.shape == (n,)}
        if overrides:
            for k, v in overrides.items():
                if k not in drivers:
                    raise KeyError(f"{k} is not a driver of this model")
                ns[k] = np.full(n, v, dtype=float) if np.isscalar(v) else np.asarray(v, float)
        exec(compile(PART_LOOP, "aifred_model.py", "exec"), ns)
    finally:
        sys.argv = argv
    return drivers, ns


def outcomes(ns):
    """Per-path outcomes, in the units the record reports."""
    cum = ns["out"]["cum_cash"]
    contrib = ns["out"]["contribution"]
    pos = contrib > 0
    any_neg = (~pos).any(0)
    last_nonpos = np.where(any_neg, MONTHS - 1 - np.argmax((~pos)[::-1], 0), -1)
    crossover = last_nonpos + 2  # first month of the final unbroken positive run
    return {
        "peak_need_cr": -np.minimum(cum.min(0), 0) / CR,
        "trough_month": (cum.argmin(0) + 1).astype(float),
        "crossover_month": crossover.astype(float),
        "profitable_by_m60": (crossover <= MONTHS).astype(float),
        "profitable_by_m36": (crossover <= 36).astype(float),
        "m60_contribution_cr": contrib[-1] / CR,
        "m60_users": ns["out"]["users"][-1],
        "m36_minutes_per_user": ns["out"]["min_per_user_month"][35],
        "m36_labour_share": ns["out"]["labour"][35] / np.maximum(ns["out"]["revenue"][35], 1),
    }


def s1(x, y, bins=25):
    """First-order Sobol index, binned on the driver's rank."""
    if y.var() == 0:
        return 0.0
    parts = np.array_split(y[np.argsort(x, kind="stable")], bins)
    means = np.array([p.mean() for p in parts])
    weights = np.array([len(p) for p in parts], float)
    return float(np.average((means - y.mean()) ** 2, weights=weights) / y.var())


def rank(a):
    r = np.empty(len(a))
    r[np.argsort(a, kind="stable")] = np.arange(len(a))
    return r


def decile(x, y, which):
    q = np.quantile(x, 0.1 if which == "lo" else 0.9)
    sel = x <= q if which == "lo" else x >= q
    return float(np.median(y[sel]))


# ------------------------------------------------------------------ self test
drivers, ns = run(N, SEED)
bands = dict(ns)
exec(compile(PART_BANDS, "aifred_model.py", "exec"), bands)
published = HERE / f"sim_{SCENARIO}.csv"
if published.exists() and N == 20000 and SEED == 20260913:
    # Character for character, through the same writer that produced the file.
    if bands["df"].to_csv(index=False) != published.read_text():
        raise SystemExit(f"self test failed: this run does not rebuild {published.name}")
    print(f"self test: rebuilds {published.name} exactly")

Y = outcomes(ns)
NAMES = [k for k in LABELS if k in drivers] + sorted(set(drivers) - set(LABELS))
SCORED = ["peak_need_cr", "crossover_month", "m60_contribution_cr",
          "profitable_by_m60", "m36_minutes_per_user", "m60_users"]

rows = []
for name in NAMES:
    x = drivers[name]
    if x.std() == 0:
        continue
    r = {"driver": name, "reads_as": LABELS.get(name, name),
         "p10": float(np.quantile(x, 0.1)), "p50": float(np.median(x)),
         "p90": float(np.quantile(x, 0.9))}
    for k in SCORED:
        y = Y[k]
        r[f"s1_{k}"] = s1(x, y)
        r[f"s1rank_{k}"] = s1(rank(x), rank(y))
        r[f"lo_{k}"] = decile(x, y, "lo")
        r[f"hi_{k}"] = decile(x, y, "hi")
    rows.append(r)
sens = pd.DataFrame(rows).sort_values("s1_peak_need_cr", ascending=False)

# --------------------------------------------------------------- the sweeps
# Pin a driver across the sample and re-run. Paired random numbers throughout.
top = list(dict.fromkeys(
    LEVERS
    + list(sens.sort_values("s1_peak_need_cr", ascending=False).driver[:8])
    + list(sens.sort_values("s1_crossover_month", ascending=False).driver[:8])))
sw = []
for name in top:
    x = drivers[name]
    lo, hi = np.quantile(x, 0.02), np.quantile(x, 0.98)
    for v in np.linspace(lo, hi, 9):
        _, nsv = run(NSW, SEED, overrides={name: v})
        yv = outcomes(nsv)
        sw.append({"driver": name, "reads_as": LABELS.get(name, name), "pinned_at": float(v),
                   "median_peak_need_cr": float(np.median(yv["peak_need_cr"])),
                   "median_crossover_month": float(np.median(yv["crossover_month"])),
                   "share_profitable_by_m60": float(yv["profitable_by_m60"].mean()),
                   "share_profitable_by_m36": float(yv["profitable_by_m36"].mean()),
                   "median_m60_contribution_cr": float(np.median(yv["m60_contribution_cr"]))})
    print(f"swept {name}")
sweeps = pd.DataFrame(sw)

# ----------------------------------------------------- reverting each lever
# What the business looks like if one lever slips back to where the record
# found it. The as-specified supports, drawn from a stream of their own.
AS_SPEC = {"tasks_day": (0.9, 1.5, 2.4), "price_ind": (22, 30, 44),
           "auto_ceil": (0.58, 0.72, 0.88), "assist_floor": (1.8, 2.8, 4.2),
           "auto_hl": (9, 15, 26), "tail_floor_min": (16, 26, 40),
           "churn_floor": (0.020, 0.032, 0.055), "eng_exp": (0.22, 0.34, 0.48),
           "price_uk": (38, 55, 85), "price_us": (45, 70, 110)}
rev_rng = np.random.default_rng(SEED + 1)
base = outcomes(run(NSW, SEED)[1])
rv = [{"reverted": "nothing, the viable line", "n": NSW,
       "median_peak_need_cr": float(np.median(base["peak_need_cr"])),
       "median_crossover_month": float(np.median(base["crossover_month"])),
       "share_profitable_by_m60": float(base["profitable_by_m60"].mean()),
       "median_m60_contribution_cr": float(np.median(base["m60_contribution_cr"]))}]
groups = ([(k, [k]) for k in AS_SPEC]
          + [("price and volume together", ["tasks_day", "price_ind"]),
             ("the two automation levers together", ["auto_ceil", "assist_floor"]),
             ("volume with both automation levers", ["tasks_day", "auto_ceil", "assist_floor",
                                                     "tail_floor_min", "auto_hl"]),
             ("the four levers together", LEVERS),
             ("every as-specified parameter", list(AS_SPEC))])
for label, keys in groups:
    ov = {k: rev_rng.triangular(*AS_SPEC[k], NSW) for k in keys}
    yv = outcomes(run(NSW, SEED, overrides=ov)[1])
    rv.append({"reverted": LABELS.get(label, label) if label in LABELS else label, "n": NSW,
               "median_peak_need_cr": float(np.median(yv["peak_need_cr"])),
               "median_crossover_month": float(np.median(yv["crossover_month"])),
               "share_profitable_by_m60": float(yv["profitable_by_m60"].mean()),
               "median_m60_contribution_cr": float(np.median(yv["m60_contribution_cr"]))})
reversion = pd.DataFrame(rv)

# --------------------------------------------------------------- thresholds
# The pinned value at which a sweep crosses a line worth naming.
def crossing(xs, ys, level, rising):
    xs, ys = np.asarray(xs, float), np.asarray(ys, float)
    for i in range(len(xs) - 1):
        a, b = ys[i], ys[i + 1]
        if (a < level <= b) or (b <= level < a):
            if b == a:
                return float(xs[i])
            return float(xs[i] + (xs[i + 1] - xs[i]) * (level - a) / (b - a))
    return float("nan") if (ys.min() > level) == rising else float("nan")


PLAN_TROUGH_CR = 17.34  # the planning line's own trough, from sim_viable.csv
th = []
for name, g in sweeps.groupby("driver", sort=False):
    g = g.sort_values("pinned_at")
    th.append({
        "driver": name, "reads_as": g.reads_as.iloc[0],
        "swept_from": float(g.pinned_at.min()), "swept_to": float(g.pinned_at.max()),
        "at_half_the_paths_profitable": crossing(g.pinned_at, g.share_profitable_by_m60, 0.5, True),
        "at_nine_in_ten_profitable": crossing(g.pinned_at, g.share_profitable_by_m60, 0.9, True),
        "at_twice_the_plan_trough": crossing(g.pinned_at, g.median_peak_need_cr,
                                             2 * PLAN_TROUGH_CR, True),
        "at_thrice_the_plan_trough": crossing(g.pinned_at, g.median_peak_need_cr,
                                              3 * PLAN_TROUGH_CR, True),
        "need_span_cr": float(g.median_peak_need_cr.max() - g.median_peak_need_cr.min()),
        "profitable_span": float(g.share_profitable_by_m60.max() - g.share_profitable_by_m60.min()),
    })
thresholds = pd.DataFrame(th).sort_values("need_span_cr", ascending=False)

# ------------------------------------------------ the two that own the variance, together
PAIR = ("add_rate_0", "gna0")
grid = []
for va in np.linspace(*np.quantile(drivers[PAIR[0]], [0.02, 0.98]), 11):
    for vb in np.quantile(drivers[PAIR[1]], [0.1, 0.5, 0.9]):
        yv = outcomes(run(NSW, SEED, overrides={PAIR[0]: va, PAIR[1]: vb})[1])
        grid.append({"driver_a": PAIR[0], "a": float(va), "driver_b": PAIR[1], "b": float(vb),
                     "median_peak_need_cr": float(np.median(yv["peak_need_cr"])),
                     "share_profitable_by_m60": float(yv["profitable_by_m60"].mean()),
                     "median_crossover_month": float(np.median(yv["crossover_month"]))})
two_way = pd.DataFrame(grid)
print("gridded", PAIR[0], "against", PAIR[1])

# ------------------------------------------------------- what the failures share
fail = Y["profitable_by_m60"] == 0
prof = {"share_never_profitable_by_m60": float(fail.mean()),
        "drivers": {}}
for name in NAMES:
    x = drivers[name]
    if x.std() == 0 or not fail.any():
        continue
    fail_med, all_med = float(np.median(x[fail])), float(np.median(x))
    spread = float(np.quantile(x, 0.9) - np.quantile(x, 0.1)) or 1.0
    prof["drivers"][name] = {"reads_as": LABELS.get(name, name), "median_all": all_med,
                             "median_in_failures": fail_med,
                             "shift_in_p10_p90_widths": (fail_med - all_med) / spread}

summary = {
    "scenario": SCENARIO, "paths": N, "sweep_paths": NSW, "seed": SEED,
    "reporting_fx": FX_REPORT,
    "median": {k: float(np.median(v)) for k, v in Y.items()},
    "share_profitable_by_m60": float(Y["profitable_by_m60"].mean()),
    "share_profitable_by_m36": float(Y["profitable_by_m36"].mean()),
    "peak_need_cr": {q: float(np.quantile(Y["peak_need_cr"], q / 100))
                     for q in (10, 25, 50, 75, 90, 95)},
    "variance_owned_by_top_five": {
        k: {r.driver: round(getattr(r, f"s1_{k}"), 4)
            for r in sens.sort_values(f"s1_{k}", ascending=False).head(5).itertuples()}
        for k in SCORED},
    "failure_profile": prof,
    "plan_trough_cr": PLAN_TROUGH_CR,
    "plan_trough_percentile_of_path_need": float((Y["peak_need_cr"] <= PLAN_TROUGH_CR).mean()),
    "peak_need_usd_at_reporting_fx": {q: float(np.quantile(Y["peak_need_cr"], q / 100)
                                               * CR / FX_REPORT)
                                      for q in (50, 75, 90)},
}

sens.to_csv(HERE / f"sensitivity_{SCENARIO}.csv", index=False)
thresholds.to_csv(HERE / f"sensitivity_thresholds_{SCENARIO}.csv", index=False)
two_way.to_csv(HERE / f"sensitivity_two_way_{SCENARIO}.csv", index=False)
sweeps.to_csv(HERE / f"sensitivity_sweeps_{SCENARIO}.csv", index=False)
reversion.to_csv(HERE / f"sensitivity_reversion_{SCENARIO}.csv", index=False)
with open(HERE / f"summary_sensitivity_{SCENARIO}.json", "w") as f:
    json.dump(summary, f, indent=2, default=float)

if __name__ == "__main__":
    pd.set_option("display.width", 160)
    print(json.dumps({k: summary[k] for k in
                      ("median", "share_profitable_by_m60", "peak_need_cr",
                       "variance_owned_by_top_five")}, indent=2, default=float))
    print("\ntornado on the peak cash need, crore, by driver decile")
    t = sens.sort_values("s1_peak_need_cr", ascending=False).head(14)
    for r in t.itertuples():
        print(f"  {r.reads_as:42s} S1 {r.s1_peak_need_cr:5.3f}  "
              f"{r.lo_peak_need_cr:6.1f} -> {r.hi_peak_need_cr:6.1f} cr")
    print("\nreverting a lever to where the record found it")
    print(reversion.to_string(index=False))
    print("\nwhere each sweep crosses a line worth naming")
    print(thresholds.to_string(index=False))
