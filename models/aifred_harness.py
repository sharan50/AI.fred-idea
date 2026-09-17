"""
The published trajectory model, wrapped so it can be re-run and interrogated
============================================================================

`aifred_model.py` is a script: it draws its drivers, runs sixty months and writes
a CSV. This module executes that same file in pieces, so anything built on top of
it runs the published code rather than a restatement of it.

  run(n, seed, overrides)  draws the drivers, optionally pins some of them to a
                           value or an array, then runs the month loop. The pin
                           lands after the draws, so two runs with the same seed
                           share their random numbers and differ only by the pin.
  outcomes(ns)             the per-path statistics a founder would act on: what
                           the path actually needed, when it crossed over, whether
                           it ever did.
  selftest()               rebuilds sim_viable.csv character for character. Call it
                           before quoting anything.

Nothing here decides anything. It is the bench the probes sit on.
"""

import pathlib
import sys

import numpy as np
import pandas as pd

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "out"  # every file a script writes, and reads back, lives here
SRC = (HERE / "aifred_model.py").read_text()
MARK_KEYS = "KEYS = ["
MARK_BANDS = "# --------------------------------------------------- coherent outcome bands"
MARK_FUND = "# --------------------------------------------------------- funding schedule"
PART_DRIVERS = SRC[: SRC.index(MARK_KEYS)]
PART_LOOP = SRC[SRC.index(MARK_KEYS) : SRC.index(MARK_BANDS)]
PART_BANDS = SRC[SRC.index(MARK_BANDS) : SRC.index(MARK_FUND)]

MONTHS = 60
CR = 1e7
FX_REPORT = 89.0  # the reporting rate, as in the publication
PLAN_TROUGH_CR = 17.34  # the planning line's own trough, from sim_viable.csv
DEFAULT_SEED = 20260913

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


def run(n, seed=DEFAULT_SEED, overrides=None, scenario="viable"):
    """Execute the published model's own driver block and month loop."""
    argv = sys.argv
    sys.argv = ["aifred_model.py", scenario, str(n), str(seed)]
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
    """The median outcome when a driver sits in its bottom or its top tenth."""
    q = np.quantile(x, 0.1 if which == "lo" else 0.9)
    sel = x <= q if which == "lo" else x >= q
    return float(np.median(y[sel]))


def bands(ns):
    """The published conservative, optimistic, median and planning lines."""
    b = dict(ns)
    exec(compile(PART_BANDS, "aifred_model.py", "exec"), b)
    return b["df"]


def selftest(scenario="viable"):
    """Refuse to be believed unless this rebuilds the published CSV exactly."""
    published = OUT / f"sim_{scenario}.csv"
    df = bands(run(20000, DEFAULT_SEED, scenario=scenario)[1])
    if df.to_csv(index=False) != published.read_text():
        raise SystemExit(f"self test failed: this run does not rebuild {published.name}")
    return f"self test: rebuilds {published.name} exactly"
