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

These are informed priors, not evidence. The company has no customers. The four measurements that replace them, in order of how much they move the answer, are minutes per user per month, twelve-month churn on a paying cohort, willingness to pay above $50, and whether the engineering headcount exponent falls as the workflow library generalises.

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
