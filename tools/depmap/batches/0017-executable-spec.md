# Batch 0017: the record as executable specification, and the seams it met

Recorded 2026-09-15. The founder asked for the prose to be turned into an
executable specification: a schema for every record, reference
implementations of the state machine, the envelope engine, the classifier,
the hash service, the substitutor's ordered checks and the evidence pipeline,
with fault-injection and property tests and a canary. The result is the
`spec/` directory at the repository root, outside `docs/`, never served, with
its own suite (`node --test 'spec/test/*.test.mjs'`, 101 tests). No page was
edited. This batch records what encoding the pages as code found, as proposed
changes under DR-017's protocol, and the closure the tool returns for the
nodes those changes would touch.

## What the code is checked against

The closed lists under `spec/vocab/*.map.json` are copies of the map's
vocabulary nodes, written by `spec/vocab/derive.mjs`; `spec/test/vocab.test.mjs`
fails when a copy differs from `graph.json`, and `node tools/depmap.mjs check`
holds `graph.json` to the pages. The two verbatim invariants the code carries
as constants, the state-machine invariant and the point-of-no-return test,
are asserted byte-identical to the map's `inv-state-machine-invariant` and
`inv-point-of-no-return-test`. So a page edit that renames a state, an
outcome code, a transition or a word of either invariant fails the map's
check and the spec's suite in the same commit.

## What was found: the seams

`spec/SEAMS.md` records thirty-one places where the pages leave a mechanism
open, say it two ways, or say it in a way the code could not take literally,
with the reading the code takes. Twenty are decisions the code had to make;
eleven were read before the code and are listed so this record carries them.
The ones that ask for a page edit, each a proposed change and none made:

| Change | Seam | What the pages would need to say | Seeds |
|--------|------|----------------------------------|-------|
| act-types | 1 | An act type for a step that commits nothing (a chase, a status enquiry, a lookup), or that `attest-fact` covers it | `comp-step-catalogue`, `comp-classifier` |
| state-machine | 2, 3, 4, 5, 6, 12, 16, 17, 18, 19 | Whether a party's response while a user step waits re-opens its step or defers; a board column for the projection mismatch; who records the column-limit escalation; the state a task takes when a re-plan finds no route; whether a renewal resets attempts; the child's opening row under redo; the retry cap's exact count | `comp-task-service`, `comp-watchdog`, `comp-exceptions-board` |
| substitutor | 7, 8, 9 | Whether every payment-instrument placement is committing (the ledger's own afternoon says otherwise); a `committing_placement` field in the signed step context's fixed list; how a revocation reaches a component with no route to the task service | `comp-substitutor`, `comp-step-context`, `comp-fired-marker` |
| hash-service | 10, 11, 15 | That the hash service holds every vault value in memory when it computes the digest sets, or that the vault computes them; what "the broader class" means for a card and an account, one class; how the proxy types a date of birth | `comp-hash-service`, `comp-edge-proxy` |
| ledger | 13, 20 | A closed list of the verbs a use may start with; the map's `vocab-ledger-events` member `exposure-recorded` still carries the previous edition's code `read-back-muted` | `comp-access-ledger`, `vocab-ledger-events` |

## The change, as the tool returned it

`node tools/depmap.mjs batch --change act-types=comp-step-catalogue,comp-classifier --change state-machine=comp-task-service,comp-watchdog,comp-exceptions-board --change substitutor=comp-substitutor,comp-step-context,comp-fired-marker --change hash-service=comp-hash-service,comp-edge-proxy --change ledger=comp-access-ledger,vocab-ledger-events`,
with the rejected-alternative lines left out for length (the full output is
one command away):

```
batch of 5 changes: act-types, state-machine, substitutor, hash-service, ledger

act-types: seeds comp-step-catalogue, comp-classifier
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  residual res-07-09  submit-application is irreversible by rule and reversible in the family journey
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  residual res-07-03  A committing placement fires after a narrowing or a flag flip
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  residual res-07-05  An undo-route submit on a reversible step cannot be told from any other submit
  residual res-07-08  Every submit is refused on a reversible step, and an undo-route submit fires on 
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-17  Delegation by a family member
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open open-07-37  Only one act type per step is flag-checked
  open open-07-32  A fee quoted on a call has nothing to compare it with
  open open-07-34  A dependant's delegation record, which nothing creates
  open open-07-38  A withdrawal that lands inside a placement window
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-11  Vault vendor choice
  open open-07-35  Three findings of the review the record contradicts

state-machine: seeds comp-task-service, comp-watchdog, comp-exceptions-board
  reopens dr-005  An explicit task state machine, with lapsed distinct from withdrawn [fixed]
  reopens dr-002  Verdict system split into a control loop and an improvement loop [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.4.1  User abandonment is legitimate; system forgetting is forbidden as an invariant [fixed]
  reopens ledger-1.4.2  Explicit state machine, lapsed not withdrawn, a watchdog and an exceptions board [fixed]
  reopens ledger-1.4.3  The state-machine invariant appears identically in 02 and the worker console [fixed]
  reopens ledger-1.5.1  Control loop: an outcome code from a fixed vocabulary closes every step [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens dr-006  Office-mandatory 24/7 operation with site controls [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens dr-018  Mail sent from the user's own address [fixed]
  reopens dr-021  Telephony masking dropped; no value is ever spoken [fixed]
  reopens dr-022  Structured task cards replace pixel masking [fixed]
  reopens dr-026  A call is for account mapping, never for authentication [fixed]
  reopens dr-027  No name ever reaches a worker [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens ledger-1.3.3  Every execution surface is ours: managed browser, our telephony, our mail relay [fixed]
  reopens ledger-1.5.2  Improvement loop: a one-tap verdict with five options closes every task [fixed]
  reopens ledger-1.5.3  Verdict joined to step trace is the improvement measurement [fixed]
  reopens ledger-1.5.4  Incentive mechanics are an assumption, make-good policy an open decision [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  reopens ledger-1.8.3  Task cards are AI-generated and need-to-know [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens dr-009  Evidence redaction as part of the harness [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  reopens ledger-1.8.1  Office mandatory 24/7, site controls in the trust guarantee, remote-safe later [fixed]
  reopens ledger-1.8.2  Workforce tiers L1, L2, L3, with QA and escalation standalone [fixed]
  reopens dr-007  A universal core with per-country adapters, legal pack and shift [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  reopens ledger-1.3.4  Evidence redaction is part of the harness; the evidence system is a leak path [fixed]
  reopens dr-019  The endgame is the starting scope [fixed]
  reopens ledger-1.7.1  India is the build base; the US and the UK are where commercial viability lies [fixed]
  reopens ledger-1.7.4  Expansion is a repeatable playbook: adapter plus legal pack plus shift [fixed]
  reopens dr-016  The context store as a temporal knowledge graph [fixed]
  reopens ledger-1.10.1  A temporal knowledge graph of facts with source, date, confidence, confirmation [fixed]
  residual res-07-04  The step-deadline timer can re-run an irreversible act that has fired
  residual res-07-10  A task that reached its report can run steps again after revive
  residual res-07-15  A withdrawn committing utterance closes cancelled although the step has fired
  residual res-07-05  An undo-route submit on a reversible step cannot be told from any other submit
  residual res-07-08  Every submit is refused on a reversible step, and an undo-route submit fires on 
  residual res-07-03  A committing placement fires after a narrowing or a flag flip
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  residual res-07-06  Every date is masked, yet workers, checkers and the ai executor must read dates
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  residual res-07-01  A health or legal matter in common words reaches a worker
  open open-07-15  Nudge schedules and every state-machine timer, per task type
  open open-07-16  Lapsed covers two cases; measurement must keep them apart
  open open-07-33  At most once, on a call step that never receives a marker
  open open-07-12  Browser sandbox and model vendors
  open open-07-36  A party-issued reference, heard on a call
  open open-07-20  Mail providers' delegated send scope
  open open-07-11  Vault vendor choice
  open open-07-35  Three findings of the review the record contradicts
  open open-07-09  Make-good policy
  open open-07-31  The given name, settled by DR-027
  open open-07-17  Delegation by a family member
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open open-07-37  Only one act type per step is flag-checked
  open open-07-32  A fee quoted on a call has nothing to compare it with
  open open-07-34  A dependant's delegation record, which nothing creates
  open open-07-38  A withdrawal that lands inside a placement window
  open open-07-10  Remote-safe operations as a designed-later programme
  open open-07-27  The headcount threshold for the attested site
  open open-07-48  The step cost of the floor
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-05  Legal to-verifies: privacy law and cross-border transfer safeguards
  open open-07-02  First-cohort market sequencing
  open open-07-29  What a paid arrival costs

substitutor: seeds comp-substitutor, comp-step-context, comp-fired-marker
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  residual res-07-03  A committing placement fires after a narrowing or a flag flip
  residual res-07-04  The step-deadline timer can re-run an irreversible act that has fired
  residual res-07-15  A withdrawn committing utterance closes cancelled although the step has fired
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  residual res-07-01  A health or legal matter in common words reaches a worker
  residual res-07-05  An undo-route submit on a reversible step cannot be told from any other submit
  residual res-07-08  Every submit is refused on a reversible step, and an undo-route submit fires on 
  open open-07-11  Vault vendor choice
  open open-07-17  Delegation by a family member
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open open-07-37  Only one act type per step is flag-checked
  open open-07-32  A fee quoted on a call has nothing to compare it with
  open open-07-34  A dependant's delegation record, which nothing creates
  open open-07-38  A withdrawal that lands inside a placement window
  open open-07-35  Three findings of the review the record contradicts
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-12  Browser sandbox and model vendors
  open open-07-36  A party-issued reference, heard on a call
  open open-07-20  Mail providers' delegated send scope
  open open-07-26  Whether the engineering headcount exponent falls

hash-service: seeds comp-hash-service, comp-edge-proxy
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  residual res-07-06  Every date is masked, yet workers, checkers and the ai executor must read dates
  residual res-07-01  A health or legal matter in common words reaches a worker
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  residual res-07-05  An undo-route submit on a reversible step cannot be told from any other submit
  residual res-07-08  Every submit is refused on a reversible step, and an undo-route submit fires on 
  open open-07-11  Vault vendor choice
  open open-07-35  Three findings of the review the record contradicts
  open open-07-21  The data story, settled by DR-019
  open open-07-01  The front door per market (the channel amber)
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-12  Browser sandbox and model vendors
  open open-07-36  A party-issued reference, heard on a call
  open open-07-20  Mail providers' delegated send scope
  open open-07-03  Pilot vertical sequencing

ledger: seeds comp-access-ledger, vocab-ledger-events
  reopens ledger-1.1.2  The trust story is visible through a per-task access ledger in plain words [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens dr-009  Evidence redaction as part of the harness [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.3.4  Evidence redaction is part of the harness; the evidence system is a leak path [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  residual res-07-03  A committing placement fires after a narrowing or a flag flip
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  residual res-07-04  The step-deadline timer can re-run an irreversible act that has fired
  residual res-07-15  A withdrawn committing utterance closes cancelled although the step has fired
  residual res-07-01  A health or legal matter in common words reaches a worker
  residual res-07-05  An undo-route submit on a reversible step cannot be told from any other submit
  residual res-07-08  Every submit is refused on a reversible step, and an undo-route submit fires on 
  open open-07-11  Vault vendor choice
  open open-07-17  Delegation by a family member
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open open-07-37  Only one act type per step is flag-checked
  open open-07-35  Three findings of the review the record contradicts
  open open-07-32  A fee quoted on a call has nothing to compare it with
  open open-07-34  A dependant's delegation record, which nothing creates
  open open-07-38  A withdrawal that lands inside a placement window
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-03  Pilot vertical sequencing

shared upstream (reopened by two or more changes)
  dr-008  Tokenisation vault bought, not built  (act-types, state-machine, substitutor, hash-service, ledger)
  ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases  (act-types, state-machine, substitutor, hash-service, ledger)
  ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map  (act-types, state-machine, substitutor, hash-service, ledger)
  dr-004  The authority envelope and the point-of-no-return test  (act-types, state-machine, substitutor, ledger)
  ledger-1.7.2  Universal core, one build, country-agnostic  (act-types, state-machine, substitutor, ledger)
  dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags  (act-types, state-machine, substitutor, ledger)
  ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside  (act-types, state-machine, substitutor, ledger)
  ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control  (act-types, state-machine, substitutor, ledger)
  ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime  (act-types, state-machine, substitutor, ledger)
  ledger-1.2.2  The per-country flag table doubles as the lobbying agenda  (act-types, state-machine, substitutor, ledger)
  ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints  (act-types, state-machine, substitutor, ledger)
  dr-014  The substitution framing: boundary sequence over ledger spine  (state-machine, substitutor, ledger)
  ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary  (state-machine, substitutor, ledger)
  dr-009  Evidence redaction as part of the harness  (state-machine, ledger)
  ledger-1.3.4  Evidence redaction is part of the harness; the evidence system is a leak path  (state-machine, ledger)

loci: 157 sections on 29 pages; "touched by" counts the changes whose closure reaches the section
   5 of 5  index.html#fatal-one                                         132  A worker sees something they should   fatal-1  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  00-thesis/index.html#what-consequence-means                   68  What consequence means                fatal-1, fatal-2, inv-point-of-no-return-test  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  00-thesis/index.html#markets                                 194  Markets                               premise-india-build-base  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  00-thesis/index.html#india-build-base                        196  India as the build base               premise-india-build-base, comp-adapter-in  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  00-thesis/index.html#moat-made-of                            256  What the moat is made of              comp-envelope, comp-substitutor, inv-alias-only-outside-zone, inv-system-forgetting-forbidden, comp-access-ledger, comp-site-controls, comp-evidence-pipeline, premise-moat  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  01-product/index.html#journey-family                         120  Family affairs: a parent's repeat pr  res-07-05, res-07-08, res-07-09  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  01-product/index.html#refusals                               403  What we refuse to do                  fatal-1, fatal-2, inv-otp-never-ours, vocab-refusal-codes  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#step-record                       234  The step record                       res-07-16, res-07-06  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#table:2.6                         304  Table 2.6                             res-07-05, vocab-bounce-forms, vocab-alias-classes, vocab-tiers  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#table:2.7                         337  Table 2.7                             res-07-08  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#ai-executor                       350  The ai executor                       res-07-05, comp-ai-executor  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#telephony                         363  Telephony                             res-07-02, comp-party-directory, comp-telephony  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#surface-controllers               374  The surface controllers and the step  res-07-03, res-07-05, res-07-08, comp-surface-controllers, comp-task-service, vocab-committing-actions  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#envelope-record                   681  The envelope record and the ledger e  comp-envelope, res-07-16, comp-access-ledger  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  02-architecture/index.html#context-store                     788  The context store                     res-07-02, comp-context-store  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  03-trust-and-data/index.html#alias-types                      65  Alias types, classes and their polic  inv-missing-row-is-bounce, comp-vault, vocab-alias-classes  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  03-trust-and-data/index.html#table:3.1                        68  Table 3.1                             inv-otp-never-ours, res-07-01  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  03-trust-and-data/index.html#managed-browser                 308  The managed browser                   res-07-08, comp-browser-masker, comp-managed-browser, vocab-browser-masks  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  03-trust-and-data/index.html#threat-model                    427  The threat model: paths by which a h  fatal-1, comp-threat-model  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  04-operations/index.html#card-generation                      65  How a card is generated               vocab-classes, comp-task-cards, res-07-01  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  04-operations/index.html#card-script                          86  The script and the result             res-07-16, res-07-06  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  04-operations/index.html#dual-control                        311  Dual control on the floor             res-07-08, comp-fired-marker, inv-at-most-once, res-07-04, res-07-15, vocab-committing-actions  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  06-roadmap/index.html#sequence                                63  The harness-first build sequence      comp-step-catalogue, fatal-1, fatal-2, stage-2, stage-3, comp-worker-console, inv-vault-sdk-two-places, stage-4, stage-6, stage-7, stage-1, stage-5, stage-8, inv-no-raw-artefact  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  06-roadmap/index.html#fig-sequence                            66  Eight stages in a fixed order, each   stage-2, stage-3, stage-4, stage-6, stage-7, stage-1, stage-5, stage-8  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  06-roadmap/index.html#table:6.1                              183  Table 6.1                             comp-classifier, comp-envelope, comp-planner, comp-policy-layer, comp-hash-service, comp-managed-browser, comp-state-machine, comp-substitutor, comp-task-cards, comp-task-service, comp-telephony, comp-vault, comp-worker-console, comp-access-ledger, comp-adapters, comp-context-store, comp-evidence-pipeline, comp-intake-gateway  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  decisions/dr-004-authority-envelope.html#test                 79  The test and the rule                 inv-point-of-no-return-test, res-07-05, res-07-08, vocab-routes, comp-approval-token, comp-fired-marker, vocab-committing-actions  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  decisions/dr-008-vault-bought.html#decision                   64  Decision                              dr-008  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  decisions/dr-008-vault-bought.html#closes-off                 87  What this closes off                  inv-envelope-bound-detokenise, inv-no-raw-byte-in-our-process, inv-no-real-value-at-rest, inv-region-per-market, inv-vault-sdk-two-places  (act-types, state-machine, substitutor, hash-service, ledger)
   5 of 5  decisions/index.html#ledger                                   63  The ledger                            dr-003, dr-004, dr-008, dr-002, dr-005, dr-006, dr-007, dr-009, dr-014, dr-016, dr-018, dr-019, dr-021, dr-022, dr-026, dr-027  (act-types, state-machine, substitutor, hash-service, ledger)
   4 of 5  index.html#fatal-two                                         134  An irreversible act the user did not  fatal-2, inv-point-of-no-return-test, vocab-routes  (act-types, state-machine, substitutor, ledger)
   4 of 5  00-thesis/index.html#why-now                                 157  Why now                               premise-why-now  (act-types, state-machine, substitutor, ledger)
   4 of 5  00-thesis/index.html#trust-layer-bought                      165  The trust layer can be bought         comp-vault  (state-machine, substitutor, hash-service, ledger)
   4 of 5  01-product/index.html#envelope                               198  The authority envelope from the user  comp-envelope, comp-approval-token  (act-types, state-machine, substitutor, ledger)
   4 of 5  01-product/index.html#envelope-setup                         202  Set-up at task start                  inv-envelope-bound-detokenise, res-07-02, vocab-committable-acts, vocab-identity-acts, vocab-committing-actions  (act-types, state-machine, substitutor, ledger)
   4 of 5  01-product/index.html#envelope-edits                         215  Edits mid-task: extend and narrow     comp-classifier, res-07-03, vocab-routes  (act-types, state-machine, substitutor, ledger)
   4 of 5  02-architecture/index.html#class-selection                   229  Choosing between the three classes    comp-policy-layer, vocab-bounce-forms  (act-types, state-machine, substitutor, ledger)
   4 of 5  02-architecture/index.html#step-catalogue                    280  The step-type catalogue and the act   comp-step-catalogue, res-07-02, res-07-09, comp-party-directory  (act-types, state-machine, substitutor, ledger)
   4 of 5  02-architecture/index.html#table:2.5                         283  Table 2.5                             res-07-09, vocab-committable-acts, vocab-identity-acts  (act-types, state-machine, substitutor, ledger)
   4 of 5  02-architecture/index.html#step-context                      377  The signed step context               res-07-03, comp-step-context  (act-types, state-machine, substitutor, ledger)
   4 of 5  02-architecture/index.html#timers                            516  Timers, nudges and the watchdog       comp-task-service, comp-watchdog, res-07-04, res-07-10  (state-machine, substitutor, hash-service, ledger)
   4 of 5  02-architecture/index.html#dual-control-mechanics            678  Dual control                          comp-approval-token, res-07-06  (state-machine, substitutor, hash-service, ledger)
   4 of 5  02-architecture/worker-console.html#alias-only               142  The alias-only rule                   comp-worker-console, inv-alias-only-outside-zone  (state-machine, substitutor, hash-service, ledger)
   4 of 5  03-trust-and-data/index.html#substitutor-interface           199  Boundary three: the interface and th  inv-envelope-bound-detokenise, res-07-03, comp-step-context, comp-surface-controllers, vocab-committing-actions  (act-types, state-machine, substitutor, ledger)
   4 of 5  03-trust-and-data/index.html#telephony                       312  Telephony                             comp-telephony, comp-transcriber, res-07-01, res-07-06  (state-machine, substitutor, hash-service, ledger)
   4 of 5  03-trust-and-data/index.html#table:3.4                       374  Table 3.4                             premise-why-now  (act-types, state-machine, substitutor, ledger)
   4 of 5  03-trust-and-data/index.html#policy-flags                    403  The policy flag table and the lobbyi  comp-policy-layer  (act-types, state-machine, substitutor, ledger)
   4 of 5  03-trust-and-data/index.html#table:3.5                       406  Table 3.5                             vocab-identity-acts  (act-types, state-machine, substitutor, ledger)
   4 of 5  03-trust-and-data/index.html#table:3.6                       563  Table 3.6                             inv-no-real-value-at-rest, res-07-01, comp-ai-executor  (state-machine, substitutor, hash-service, ledger)
   4 of 5  03-trust-and-data/trust-story.html#promise                    63  The promise                           inv-envelope-bound-detokenise, inv-mail-from-users-own-address  (act-types, state-machine, substitutor, ledger)
   4 of 5  04-operations/index.html#three-tiers                         231  The three tiers                       vocab-identity-acts, comp-tiers  (act-types, state-machine, substitutor, ledger)
   4 of 5  decisions/dr-003-full-delegation-ceiling.html#decision        64  Decision                              dr-003  (act-types, state-machine, substitutor, ledger)
   4 of 5  decisions/dr-003-full-delegation-ceiling.html#ceiling         66  The ceiling                           inv-otp-never-ours, vocab-identity-acts  (act-types, state-machine, substitutor, ledger)
   4 of 5  decisions/dr-003-full-delegation-ceiling.html#policy-layer    68  The policy layer                      comp-policy-layer, inv-missing-row-is-bounce  (act-types, state-machine, substitutor, ledger)
   4 of 5  decisions/dr-003-full-delegation-ceiling.html#closes-off      88  What this closes off                  inv-flag-filters-envelope, inv-missing-row-is-bounce, inv-no-design-constraint-from-jurisdiction, inv-otp-never-ours  (act-types, state-machine, substitutor, ledger)
   4 of 5  decisions/dr-004-authority-envelope.html#decision             64  Decision                              dr-004  (act-types, state-machine, substitutor, ledger)
   4 of 5  decisions/dr-004-authority-envelope.html#fields               66  The five fields                       vocab-committable-acts, vocab-committing-actions  (act-types, state-machine, substitutor, ledger)
   4 of 5  decisions/dr-004-authority-envelope.html#closes-off          100  What this closes off                  inv-no-step-before-envelope, inv-nothing-past-validity-window, inv-at-most-once, inv-irreversible-inside-dual-control, inv-no-irreversible-outside-envelope, res-07-04  (act-types, state-machine, substitutor, ledger)
   3 of 5  00-thesis/index.html#how-we-cross-it                         139  How we cross it                       comp-threat-model  (substitutor, hash-service, ledger)
   3 of 5  02-architecture/index.html#overview                           63  Overview                              inv-alias-only-outside-zone  (state-machine, substitutor, ledger)
   3 of 5  02-architecture/index.html#fig-components                     66  One component can detokenise, the va  comp-substitutor  (state-machine, substitutor, ledger)
   3 of 5  02-architecture/index.html#managed-browser                   357  The managed browser                   comp-browser-masker, comp-managed-browser, res-07-06, vocab-browser-masks  (state-machine, substitutor, hash-service)
   3 of 5  02-architecture/index.html#mail-relay                        368  The mail relay                        comp-mail-relay, inv-mail-from-users-own-address  (state-machine, substitutor, hash-service)
   3 of 5  02-architecture/index.html#table:2.8                         519  Table 2.8                             res-07-04, vocab-timers  (state-machine, substitutor, ledger)
   3 of 5  02-architecture/index.html#step-states                       539  Step states and the event log         res-07-15, vocab-committing-actions  (state-machine, substitutor, ledger)
   3 of 5  02-architecture/index.html#closing                           661  Closing a step                        comp-fired-marker, inv-at-most-once, res-07-04, vocab-outcome-codes  (state-machine, substitutor, ledger)
   3 of 5  02-architecture/index.html#hash-service                      783  The hash service                      comp-hash-service, vocab-detectors  (state-machine, hash-service, ledger)
   3 of 5  02-architecture/index.html#who-reads                         811  Who reads and writes it               vocab-detectors  (state-machine, hash-service, ledger)
   3 of 5  02-architecture/index.html#edge-tokenisation                 820  Tokenisation at the edge              comp-channel-connector, comp-edge-proxy, vocab-detectors  (state-machine, hash-service, ledger)
   3 of 5  03-trust-and-data/index.html#entry-routes                     85  Boundary one: the three doors a real  comp-edge-proxy, comp-hash-service  (state-machine, hash-service, ledger)
   3 of 5  03-trust-and-data/index.html#substitution                    197  The substitution component            comp-substitutor  (state-machine, substitutor, ledger)
   3 of 5  03-trust-and-data/index.html#mail-relay                      316  The mail relay                        comp-mail-relay, inv-mail-from-users-own-address  (state-machine, substitutor, hash-service)
   3 of 5  03-trust-and-data/index.html#access-ledger                   598  The access ledger                     comp-access-ledger  (substitutor, hash-service, ledger)
   3 of 5  03-trust-and-data/trust-story.html#ledger-example            117  What your ledger looks like           comp-access-ledger  (substitutor, hash-service, ledger)
   3 of 5  04-operations/index.html#need-to-know                         67  Need-to-know and Client 4471          vocab-detectors  (state-machine, hash-service, ledger)
   3 of 5  04-operations/index.html#handover                            208  The three shifts and the handover     res-07-04  (state-machine, substitutor, ledger)
   3 of 5  decisions/dr-014-substitution-framing.html#decision           64  Decision                              dr-014  (state-machine, substitutor, ledger)
   3 of 5  decisions/dr-016-context-store.html#decision                  64  Decision                              dr-016, vocab-detectors, comp-context-store  (state-machine, hash-service, ledger)
   2 of 5  00-thesis/index.html#customer-and-wedge                       63  Customer and scope                    premise-wedge  (state-machine, ledger)
   2 of 5  00-thesis/index.html#us-uk-commercial                        198  The US and the UK as commercial grou  inv-otp-never-ours, comp-adapter-uk, comp-adapter-us  (act-types, hash-service)
   2 of 5  00-thesis/index.html#one-core                                200  One core, three adapters              comp-residency-map, comp-adapters  (state-machine, hash-service)
   2 of 5  00-thesis/index.html#flat-fee-stops                          252  Why the flat-fee model stops at the   premise-wedge  (state-machine, ledger)
   2 of 5  01-product/index.html#journey-legal                           80  Legal and administrative: contest a   res-07-06  (state-machine, hash-service)
   2 of 5  01-product/index.html#journey-health                         108  Health and medical: a specialist app  res-07-06  (state-machine, hash-service)
   2 of 5  01-product/index.html#journey-travel                         133  Travel: rebook a cancelled flight (U  res-07-06  (state-machine, hash-service)
   2 of 5  01-product/index.html#taxonomy                               146  The task taxonomy                     inv-point-of-no-return-test, vocab-classes, inv-everyday-same-harness  (act-types, state-machine)
   2 of 5  02-architecture/index.html#planner                           179  The planner                           comp-planner  (act-types, hash-service)
   2 of 5  02-architecture/index.html#classifier                        214  The classifier                        comp-classifier, inv-point-of-no-return-test, vocab-classes, vocab-routes, inv-send-scope-not-a-connector  (act-types, state-machine)
   2 of 5  02-architecture/index.html#evidence-pipeline                 726  The evidence pipeline                 comp-evidence-pipeline  (hash-service, ledger)
   2 of 5  02-architecture/index.html#fig-evidence                      728  Only an artefact that has been redac  comp-verifier  (hash-service, ledger)
   2 of 5  02-architecture/worker-console.html#task-card                 63  The task card                         comp-task-cards, comp-tiers, vocab-tiers  (state-machine, hash-service)
   2 of 5  03-trust-and-data/index.html#redaction                       340  Artefact redaction                    comp-evidence-pipeline  (hash-service, ledger)
   2 of 5  03-trust-and-data/index.html#redaction-pipeline              342  Boundary five: capture, redact, veri  comp-verifier, vocab-redaction-masks  (hash-service, ledger)
   2 of 5  04-operations/index.html#task-cards                           63  Task cards and pseudonymisation       comp-task-cards  (state-machine, hash-service)
   2 of 5  04-operations/index.html#site-controls                       317  Site controls as part of the trust g  comp-site-controls  (substitutor, ledger)
   2 of 5  decisions/dr-006-office-mandatory.html#site-as-control        66  Why the room is a trust control       comp-site-controls  (substitutor, ledger)
   2 of 5  decisions/dr-008-vault-bought.html#not-delegated              68  What buying does not delegate         comp-channel-connector, comp-edge-proxy  (state-machine, hash-service)
   2 of 5  decisions/dr-009-evidence-redaction.html#decision             64  Decision                              dr-009, vocab-redaction-masks  (state-machine, ledger)
   1 of 5  index.html#promise                                            64  The promise                           premise-endgame  (state-machine)
   1 of 5  00-thesis/index.html#moat                                    250  The moat                              premise-moat  (ledger)
   1 of 5  00-thesis/index.html#moat-is-not                             269  What the moat is not                  premise-moat  (ledger)
   1 of 5  00-thesis/index.html#endgame                                 274  The scope, and what it gives up       premise-endgame  (state-machine)
   1 of 5  00-thesis/index.html#endgame-sequence                        276  The everyday tasks on the same harne  inv-everyday-same-harness  (state-machine)
   1 of 5  01-product/index.html#intake                                 174  Intake and the channel-agnostic gate  comp-intake-gateway  (hash-service)
   1 of 5  01-product/index.html#control-loop                           288  The control loop, before "done" is s  res-07-10, vocab-outcome-codes  (state-machine)
   1 of 5  01-product/index.html#connectors                             370  Read-only connectors the user choose  inv-send-scope-not-a-connector  (state-machine)
   1 of 5  01-product/index.html#learning                               380  Learning as a by-product of tasks     comp-context-store  (hash-service)
   1 of 5  02-architecture/index.html#replanning                        198  Re-planning triggers                  res-07-10  (state-machine)
   1 of 5  02-architecture/index.html#workflow-library                  371  The workflow library                  comp-workflow-library  (substitutor)
   1 of 5  02-architecture/index.html#state-machine                     384  The state machine                     comp-state-machine, inv-system-forgetting-forbidden  (state-machine)
   1 of 5  02-architecture/index.html#state-machine-invariant           386  a task never leaves the system by om  inv-state-machine-invariant  (state-machine)
   1 of 5  02-architecture/index.html#table:2.1                         389  Table 2.1                             res-07-10, vocab-states  (state-machine)
   1 of 5  02-architecture/index.html#table:2.2                         408  Table 2.2                             vocab-transitions  (state-machine)
   1 of 5  02-architecture/index.html#fig-state-machine                 432  Every path across the rule is a name  vocab-states  (state-machine)
   1 of 5  02-architecture/index.html#adapters                          578  The market adapter model              comp-adapters  (hash-service)
   1 of 5  02-architecture/index.html#legal-pack                        654  The legal pack and the shift          comp-legal-pack, vocab-refusal-codes  (state-machine)
   1 of 5  02-architecture/index.html#stages                            778  The four stages                       vocab-redaction-masks  (ledger)
   1 of 5  02-architecture/index.html#intake-gateway                    818  The intake gateway                    comp-intake-gateway  (hash-service)
   1 of 5  02-architecture/worker-console.html#outcome-codes            167  Structured outcome codes              vocab-outcome-codes  (state-machine)
   1 of 5  02-architecture/worker-console.html#exceptions-board         197  The exceptions board                  comp-exceptions-board, comp-watchdog  (state-machine)
   1 of 5  02-architecture/worker-console.html#invariant                272  The invariant                         comp-state-machine  (state-machine)
   1 of 5  02-architecture/worker-console.html#state-machine-invariant   274  a task never leaves the system by om  inv-state-machine-invariant  (state-machine)
   1 of 5  03-trust-and-data/index.html#passports                       363  The passports                         comp-adapters  (hash-service)
   1 of 5  03-trust-and-data/index.html#bounce-back                     365  The universal device bounce-back      vocab-bounce-forms  (act-types)
   1 of 5  03-trust-and-data/index.html#india-stack                     367  India Stack: DigiLocker, Account Agg  comp-adapter-in  (hash-service)
   1 of 5  03-trust-and-data/index.html#uk-rails                        369  United Kingdom: Open Banking and the  comp-adapter-uk  (hash-service)
   1 of 5  03-trust-and-data/index.html#us-rails                        371  United States: bank-data aggregation  comp-adapter-us  (hash-service)
   1 of 5  03-trust-and-data/index.html#ledger-fields                   600  Fields and event types                vocab-ledger-events  (ledger)
   1 of 5  03-trust-and-data/index.html#residency                       625  The data-residency map                comp-residency-map  (state-machine)
   1 of 5  04-operations/index.html#workflow-tickets                    227  The workflow library and its tickets  comp-workflow-library  (substitutor)
   1 of 5  04-operations/index.html#tiers                               229  Tiers, escalation and dual control    vocab-tiers  (state-machine)
   1 of 5  04-operations/index.html#qa                                  338  QA and the exceptions board           comp-exceptions-board  (state-machine)
   1 of 5  05-business/index.html#the-ratio                              89  The one ratio that decides everythin  comp-workflow-library  (substitutor)
   1 of 5  06-roadmap/index.html#pilot-steps                            169  Step classes and reversibility        vocab-classes  (act-types)
   1 of 5  06-roadmap/index.html#expansion-legal                        226  The legal pack                        comp-legal-pack, inv-everyday-same-harness  (state-machine)
   1 of 5  07-open/index.html#items                                      63  Every open item, with an owner and a  vocab-timers  (state-machine)
   1 of 5  decisions/dr-002-verdict-two-loops.html#decision              64  Decision                              dr-002  (state-machine)
   1 of 5  decisions/dr-002-verdict-two-loops.html#control-loop          66  The control loop                      vocab-outcome-codes  (state-machine)
   1 of 5  decisions/dr-002-verdict-two-loops.html#closes-off            86  What this closes off                  inv-outcome-code-closes-step  (state-machine)
   1 of 5  decisions/dr-005-state-machine-lapsed.html#decision           64  Decision                              dr-005, inv-system-forgetting-forbidden  (state-machine)
   1 of 5  decisions/dr-005-state-machine-lapsed.html#states             66  The states                            vocab-states  (state-machine)
   1 of 5  decisions/dr-005-state-machine-lapsed.html#transitions        68  The transitions                       vocab-transitions  (state-machine)
   1 of 5  decisions/dr-005-state-machine-lapsed.html#invariant          70  The invariant                         comp-state-machine  (state-machine)
   1 of 5  decisions/dr-005-state-machine-lapsed.html#closes-off         87  What this closes off                  inv-lapsed-never-withdrawn, inv-live-timer-on-every-live-state, inv-no-terminal-without-transition  (state-machine)
   1 of 5  decisions/dr-006-office-mandatory.html#decision               64  Decision                              dr-006  (state-machine)
   1 of 5  decisions/dr-007-universal-core-adapters.html#decision        64  Decision                              dr-007  (state-machine)
   1 of 5  decisions/dr-007-universal-core-adapters.html#legal-pack      71  The legal pack and the residency map  comp-legal-pack, comp-residency-map  (state-machine)
   1 of 5  decisions/dr-007-universal-core-adapters.html#closes-off      90  What this closes off                  inv-core-country-agnostic, inv-one-text-per-core-rule  (state-machine)
   1 of 5  decisions/dr-009-evidence-redaction.html#closes-off           89  What this closes off                  inv-no-export-path, inv-no-raw-artefact, inv-verify-before-view  (ledger)
   1 of 5  decisions/dr-016-context-store.html#record-status            101  Status                                inv-send-scope-not-a-connector  (state-machine)
   1 of 5  decisions/dr-018-mail-from-the-users-address.html#decision    64  Decision                              dr-018  (state-machine)
   1 of 5  decisions/dr-018-mail-from-the-users-address.html#closes-off    93  What this closes off                  inv-mail-from-users-own-address, inv-send-scope-not-a-connector  (state-machine)
   1 of 5  decisions/dr-019-the-endgame.html#decision                    64  Decision                              dr-019  (state-machine)
   1 of 5  decisions/dr-020-everyday-tasks-day-one.html#closes-off       79  What this closes off                  inv-everyday-same-harness  (state-machine)
   1 of 5  decisions/dr-021-no-value-spoken.html#decision                63  Decision                              dr-021  (state-machine)
   1 of 5  decisions/dr-022-structured-task-cards.html#decision          63  Decision                              dr-022  (state-machine)
   1 of 5  decisions/dr-026-telephony-mapping-not-authentication.html#decision    63  Decision                              dr-026  (state-machine)
   1 of 5  decisions/dr-027-no-name-reaches-a-worker.html#decision       63  Decision                              dr-027  (state-machine)
```

The state-machine seeds reopen most of the fixed decisions because the task
service is the component every other one reports to; that is the map saying
that a change to the projection rule or the board is a change to the record's
spine, and the reason none of these edits is made here. Each waits on the
founder's reading of the seam.

## Checks

- `node --test 'spec/test/*.test.mjs'`: 101 tests, all passing.
- `node tools/verify.mjs`: clean, 42 pages; the harness does not read `spec/`.
- `node tools/depmap.mjs check`: clean, 405 nodes, 636 edges; the map is
  unchanged by this batch.
