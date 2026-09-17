# models/

The economics behind `docs/05-business/`. The scripts and the notes are edited by hand; everything a script writes goes to `models/out/`, and a script reads its inputs back from there too. Python 3 with numpy and pandas; run from this directory.

## What each script produces, all under `out/`

- `aifred_model.py [scenario] [n] [seed]`: `sim_<scenario>.csv`, `summary_<scenario>.json`. Scenarios `as_specified`, `viable`.
- `aifred_geo_model.py [scenario] [n] [seed]`: `geo_<scenario>.csv`, `geosum_<scenario>.json`. Scenarios `india_only`, `expansion`, `expansion_commerce`, `foreign_led`.
- `aifred_harness.py`: writes nothing; executes `aifred_model.py` in pieces for the three scripts below and refuses unless it rebuilds `out/sim_viable.csv` exactly.
- `aifred_sensitivity.py [scenario] [n] [nsw] [seed]`: `sensitivity_<scenario>.csv`, `sensitivity_thresholds_*.csv`, `sensitivity_two_way_*.csv`, `sensitivity_sweeps_*.csv`, `sensitivity_reversion_*.csv`, `summary_sensitivity_<scenario>.json`.
- `aifred_structural_probes.py [n] [seed]`: `probe_dependence.csv`, `probe_price_feedback.csv`, `summary_probes.json`.
- `aifred_growth_model.py [scenario] [n] [seed]`: `sim_growth.csv`, `sim_growth_india_only.csv`, `sim_growth_net_of_tax.csv`, `growth_sweep_<scenario>.csv`, `growth_split_<scenario>.csv`, `summary_growth_<scenario>.json`. Reads `out/sim_viable.csv` for its self test.
- `aifred_geo_growth.py [scenario] [n] [seed]`: `geo_growth_<scenario>.csv`, `geogrowthsum_<scenario>.json`, `geo_growth_foreign_led_nocommerce.csv`, `geogrowthsum_foreign_led_nocommerce.json`, `geo_growth_bounds.csv`, `geo_growth_percentiles.csv`, `geo_growth_allocation.csv`, `geogrowthsum_all.json`. Reads `out/geo_<scenario>.csv` for its self tests.
- `../tools/figures/forecast-05.py` and `growth-05.py` read `out/sim_growth.csv`, `out/summary_growth_viable.json` and `out/sim_as_specified.csv` and write figure fragments under `docs/05-business/`, which are pasted into the page source under `src/pages/` and then deleted.
- The `.md` files are notes, and the `.xlsx` files are kept by hand; no script writes them.

## Regenerating

    python3 aifred_model.py viable 20000 20260913 && python3 aifred_model.py as_specified 20000 20260913
    for s in india_only expansion expansion_commerce foreign_led; do python3 aifred_geo_model.py $s 20000 20260913; done
    python3 aifred_growth_model.py --selftest && python3 aifred_growth_model.py
    python3 aifred_geo_growth.py --selftest && python3 aifred_geo_growth.py
    python3 aifred_structural_probes.py && python3 aifred_sensitivity.py

Run the two model files first; the others read their outputs. The publication quotes 20,000 paths at seed 20260913, and a page quotes the seed and the date beside every number it takes from here. `README.md` in this directory says what each file means and where 05 quotes it.
