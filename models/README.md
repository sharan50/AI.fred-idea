# models

Everything behind the numbers in `/05-business/`. Nothing here is edited by hand.

| File | What it is |
| --- | --- |
| `AIfred_unit_model.xlsx` | Deterministic unit model. Set the assumptions on Inputs, fill Capture from the measurement protocol, and headcount, cost per task and margin fall out. The Trajectory sheet runs 36 months with improving automation, learning curves and user growth. |
| `AIfred_task_measurement_protocol.md` | The thirty-task instrument that replaces the priors: rubric, timing definitions, run protocol, decision thresholds. |
| `aifred_model.py` | Monte Carlo, 60 months. Scenarios: `as_specified`, `viable`. |
| `aifred_geo_model.py` | As above with geography-specific acquisition cost, churn, night premiums, entity costs and a commerce take rate. Scenarios: `india_only`, `expansion`, `expansion_commerce`, `foreign_led`. |
| `AIfred_probabilistic_model.xlsx` | Output of `aifred_model.py`: monthly bands, per-month rationale, driver table, funding plan. |
| `AIfred_model_rationale.md` | Why every distribution is shaped the way it is, phase by phase. |
| `AIfred_geography_and_data_layer.md` | The four geography scenarios, the entity thresholds, and the staging of the data layer. |
| `sim_*.csv`, `geo_*.csv` | Raw monthly output of the runs quoted in the publication. |

## Rerunning

    python aifred_model.py viable 20000 20260913
    python aifred_geo_model.py foreign_led 20000 20260913

The publication quotes runs of 20,000 paths at seed 20260913, dated 13 September 2026. Quote the seed and the date whenever a number from these files appears on a page, because the bands move slightly between seeds.

## Health warning

These are informed priors, not evidence. The company has no customers. Five measurements replace them, in the order the sensitivity puts them rather than the order this directory first stated: the rate at which users arrive and what it costs to make them arrive, minutes per user per month, twelve-month churn on a paying cohort, willingness to pay above $50, and whether the engineering headcount exponent falls as the workflow library generalises. The first owns more of the outcome than the other four together and is the one the model has no mechanism for.

## The sensitivity

`aifred_sensitivity.py` asks of `aifred_model.py` which drivers the answer actually turns on. It does not restate
the model: it splits that file at its own section markers and executes the pieces, so the drivers and the month loop
are literally the code that produced `sim_viable.csv`, and its self test rebuilds that file character for character
before it will write anything.

Three things come out of it, each as a CSV:

- `sensitivity_viable.csv`, one row per driver: first-order Sobol indices for six outcomes, on the raw values and on
  ranks, and the median outcome in the driver's bottom and top decile. Every driver in the model is drawn
  independently of every other, so a conditional median at a given driver value is already that driver's partial
  effect; there is nothing to hold constant.
- `sensitivity_sweeps_viable.csv` and `sensitivity_thresholds_viable.csv`: each driver pinned to a value across the
  whole sample and the model re-run, nine values across its own support. The pin is applied after the draws, so
  every run in a sweep shares its random numbers with every other and the difference is the driver's alone. The
  thresholds file reads the crossings off those sweeps.
- `sensitivity_reversion_viable.csv`: what the business looks like with one parameter put back where the
  as-specified run had it, one at a time and in groups, including the four the record calls the levers.
- `sensitivity_two_way_viable.csv`: the growth rate against G&A, the two that own the most variance, on a grid.

`aifred_harness.py` is what both of those run on: it executes `aifred_model.py` in pieces so that anything built on
top of it runs the published code rather than a restatement of it, and it refuses to be believed unless it can
rebuild `sim_viable.csv` character for character. `aifred_structural_probes.py` uses the same bench to measure two
things the model cannot say: what imposing dependence between the drivers is worth, preserving every marginal
exactly, and what the $52 price may cost in retention and word of mouth before it stops being worth taking. Its
outputs are `probe_dependence.csv`, `probe_price_feedback.csv` and `summary_probes.json`.

`AIfred_model_critique.md` reads the model against itself: what its summary statistics do to its own numbers, what
it leaves out, and what to change first. Read it beside the rationale, not instead of it.

`summary_sensitivity_viable.json` carries the headline: the distribution of what a path actually needs, which
drivers own the variance of each outcome, and what the paths that never turn profitable have in common.

One limit worth stating, since it bounds what the sweeps mean. `aifred_model.py` prices a user, not a task:
revenue is users times price, and the task allowance enters only as cost. The metered allowance the publication now
specifies is not in it, so the sweep over tasks a day is a pure cost sweep and understates what that lever does.

## Growth

`aifred_growth_model.py` replaces the published model's single exogenous arrival rate with the two mechanisms
DR-025 fixes: organic word of mouth compounding on the installed base, and a monthly media budget converted into
arrivals at a cost that rises with the budget, across reels, AI-influencer placements and earned press. It reaches
the published model the same way the sensitivity does, by executing `aifred_model.py` in pieces, and replaces only
the acquisition and acquisition-cost blocks, which are quoted in the file so a reader can see exactly what differs.
Every new parameter is drawn outside the published random stream, so with marketing switched off it rebuilds
`sim_viable.csv` character for character and the two runs are comparable path by path rather than only in aggregate.
Run `python3 aifred_growth_model.py --selftest` to check that before quoting anything from it.

The marketing side has no evidence behind it and the file does not pretend otherwise: the cost of a paid arrival is
an input, not a finding. `growth_sweep_viable.csv` sweeps it from $15 to $2,100 against three budget shares and is
where the break-even comes from; `growth_split_viable.csv` carries the organic and paid arrivals month by month,
which is what Figure 5.5 is drawn from; `summary_growth_viable.json` holds the headline against the organic-only
line. The published trajectory in `sim_viable.csv` remains organic-only, so 05's sections 5 and 7 are the case where
nothing is spent on being found.

## Where the publication quotes these

`/05-business/` carries the numbers, `/05-business/model.html` describes the instruments, the scenarios and the
limits, and `/05-business/measurement-protocol.html` is `AIfred_task_measurement_protocol.md` in the publication's
own conventions. Nothing here is linked from a page: the published site is `docs/` only, so a page that needs a
number states it with its scenario and its seed instead. When a figure on a page and a figure here disagree, this
directory is right and the page is stale.

Figures 5.1 to 5.4 on `/05-business/` are drawn from `sim_viable.csv` alone, on the planning line: the cost base by
factor from `labour_plan`, `eng_plan`, `tokens_plan` and the sum of `compliance_plan`, `sales_plan`, `gna_plan` and
`onetime_plan`; revenue against cost from `revenue_plan` and `total_cost_plan`; the labour share from `labour_plan`
over `revenue_plan`; the cash curves from `cum_cash_plan` and `cum_cash_cons`. They are in rupees crore at the
model's own rate of 89 rupees to the dollar. Regenerating the CSV means regenerating the figures; no value in them
is entered by hand.
