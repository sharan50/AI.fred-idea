# The executable specification

The pages under `docs/` are the design record. This directory is the same
record as code: a schema for every record the pages print, the closed lists
the pages enumerate, and a reference implementation of the mechanisms the
pages specify, each with tests that fail when the code and the pages
disagree. It is the answer to "could a founding engineer build this from the
record": the parts of the record that are mechanism are here as mechanism.

Nothing here is served. The publication stays plain HTML under `docs/` with no
build step (DR-010); this directory is application code in the repository the
brief reserves for it, and the harness `tools/verify.mjs` does not read it.

## Running it

```
node --test 'spec/test/*.test.mjs'
```

Node 22 or later, no dependencies, no package manifest. The suite runs in a
few seconds. A change to a page that renames a state, an outcome code or a
transition fails the vocabulary tests, because the closed lists here are
copies of the dependency map's, which `node tools/depmap.mjs check` holds to
the pages; after such a change, run `node spec/vocab/derive.mjs` and record
the batch as DR-017's protocol asks.

## What is here

| Path | What it is |
|------|------------|
| `vocab/*.map.json` | The closed lists, copied from the map's vocabulary nodes by `vocab/derive.mjs`; `vocab.test.mjs` fails when a copy has drifted |
| `vocab/local.json` | Closed lists the pages state but the map does not carry as vocabulary nodes, each with the locus it was read from |
| `schemas/*.schema.json` | JSON Schema (a 2020-12 subset) for every record: request, task, event, step, plan, envelope, extension request, approval token, signed step context, outcome, ledger entry, fact, question, verdict, catalogue entry, party directory entry, placement request and receipt, evidence artefact, incident, delegation, outcome report, policy flag table |
| `schemas/vocab.schema.json` | One enum per closed list, generated with the copies; every other schema refers into it |
| `lib/validate.mjs` | The validator, with `canonical()` for signing |
| `lib/vocab.mjs` | The closed lists as constants |
| `lib/state-machine.mjs` | The task service: ten states, eighteen transitions, the step machine, the projection rule, every timer of Table 2.8, the nudge schedule, the watchdog and the exceptions board |
| `lib/envelope.mjs` | Versioned envelopes with scoped lines, the running cap, approval tokens |
| `lib/policy.mjs` | The two-jurisdiction flag lookup with named predicates |
| `lib/classifier.mjs` | The point-of-no-return test, the four routes, the three user cases, ai against human |
| `lib/context.mjs`, `lib/signing.mjs` | The signed step context and version stamp; Ed25519 over canonical JSON; the bound device |
| `lib/vault.mjs` | The vault behind its five operations, with credentials per operation, class and region |
| `lib/detectors.mjs`, `lib/hash-service.mjs` | The four detectors as one policy artefact; the hash service with two keyed digest sets, the batched digest call, the screen; the vault's edge proxy |
| `lib/substitutor.mjs` | The ten ordered checks, the placing line before the vault call, the fired marker before a committing placement, the receipt that never carries the value |
| `lib/evidence.mjs` | Capture, the five artefact masks in order, a verifier with its own recognisers and digest set that fails closed, the store that accepts only a signed artefact, Table 3.3 |
| `lib/ledger.mjs` | The access ledger: fields, event types, rendering from fields, the wording rules as a linter, the append-only chain |
| `lib/console.mjs` | The task card and the check card as projections, screened before they reach a console |
| `fixtures/` | The records the pages print for task 12, the catalogue and party rows the pages illustrate, both flag tables |
| `test/` | Unit tests against the fixtures, fault injection on the timers and the board, a seeded property test over random walks of the state machine, and the canary |
| `SEAMS.md` | Where the pages leave a mechanism open or say it two ways, and the reading the code takes |

## What the tests prove

- Every record the pages print validates against its schema, and the
  schemas refuse what the pages forbid: a value on a call, an outcome without
  its fields, an unsigned envelope with authority, a board action by anyone
  but a person, a receipt that carries a value.
- The invariant of the state machine holds under fault injection and under
  random walks: no live task without a future timer, no terminal state
  without a recorded transition, no way to set a state except a transition.
- The classifier reproduces the class, reversibility, route and policy block
  of the printed step records, and every rule of section 3 of 02 in isolation.
- The substitutor's ten checks refuse in order and name the check; a refused
  request never reaches the vault; the line is written before the vault call;
  a committing placement consumes the token and writes the marker before the
  first character leaves.
- The ledger renders the afternoon of 03, 8.4 line for line from fields, and
  refuses a line the system could not make true.
- The canary plants a value of every class at the door and finds it on the
  surface where it was placed and nowhere else: not in the request, the step
  record, the card, the receipts, the ledger, the events, the stored evidence,
  the manifests, the incidents or a log line.

## What it does not do

It is a reference, not a product: in memory, single process, no persistence,
no network, no model. The planner is a stub the tests drive. The streamed
browser masks of DR-022's fallback are not implemented, only the artefact
masks and the card's default paint. The detectors and the dictionary are
starting sets. Where the pages leave a value illustrative, the code pins it
and says so.
