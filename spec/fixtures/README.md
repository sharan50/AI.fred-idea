# Fixtures

Worked examples the pages state, as records the schemas validate, plus the
tables the reference implementations need to run them.

## task-12, from the pages

| File | Locus | Status |
|------|-------|--------|
| `request.json` | 02, Table 2.3 example (`req_7f`) | As printed; ids completed where the page prints an ellipsis |
| `envelope-v2.json` | 02, 7.3 (`env_12` v2) | As printed |
| `step-s03.json` | 02, 3.2 (`s_03`) | As printed |
| `step-s05.json` | 02, 3.2 (`s_05`, the user-step fragment) | The page prints the bounce block, the class and the state; the other fields are completed to the step schema |
| `outcome-s03.json` | 02, 7.1 | As printed |
| `ledger-l12-0007.json` | 02, 7.3 (`l_12_0007`) | As printed, with a placement id in place of the ellipsis |
| `fact-f0281.json` | 02, 9.1 (`f_0281`) | As printed |
| `event-e000412.json` | 02, 5.4 (`e_000412`) | As printed |
| `envelope-v1.json` | Composed: the unsigned proposal v2 narrowed at authorisation | Composed |
| `plan-p12-1.json` | Composed from the task 12 walkthrough: `s_02` to `s_06` | Composed; the pages name `s_02` (as `s_03`'s predecessor), `s_03`, `s_04` (the form the ledger line records) and `s_05` |

"Composed" means the pages give the shape and the names but not the record;
the record here is one consistent reading, and a page that later prints the
record wins.

## Tables

| File | Locus | Status |
|------|-------|--------|
| `catalogue.json` | 02, Table 2.7 rows, plus the entries task 12 needs and the two enquiry step types 02 names (chase the party, status enquiry) | Illustrative, as the page says of its own rows |
| `parties.json` | 02, 3.3 (the party directory's fields) | Illustrative |
| `flags-ceiling.json` | 03, Table 3.5, the designed ceiling | Every cell to-verify |
| `flags-pilot.json` | 03, section 6 and 07: identity acts outside India read bounce; make a payment under the cap reads bounce in every market | Every cell to-verify |

The enquiry step types carry `attest-fact` as their act type because Table 2.5
has no act for a step that commits nothing; `spec/SEAMS.md` records the gap.
