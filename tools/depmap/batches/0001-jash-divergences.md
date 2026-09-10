# Batch 0001: the five divergences from the Jash exchange

Recorded 2026-09-10 as the first run of the dependency map (DR-017). This is
the acceptance test of the instrument and the first batch proposal, not a
change: nothing on any page was edited to produce it, and none of these
positions is a node. Each change is written as seeds, in the record's own
terms, and the tool returns what the change would touch.

## The changes, as seeds

| Change | What was said in the exchange | Seeds |
|--------|-------------------------------|-------|
| custody | Sensitive data kept in incumbent consumer containers (a payment app, a password manager), AI.fred as a porter handing off an OTP | `dr-008` |
| bank | Direct access to a bank account as an unsolved use case, rather than a refused one | `vocab-refusal-codes/refused-credential`, `dr-003`, `vocab-identity-acts/use-delegated-login` |
| geography | Geography-specific workflows to match local health compliance | `dr-007` |
| legal | Workflows legally framed as the user acting, letters and emails sent as them | `open-07-04`, `open-07-05`, `vocab-refusal-codes/refused-illegal`, `comp-mail-relay` |
| endgame | First port of call for everything personal, a general assistant most of the time, a data company | no seeds: the position has no node, and the query below shows what the nearest locus carries |

## Drift the map found while it was built, to be fixed in this batch

1. `07-open/index.html#items`: the caption of Table 7.1 says eighteen open items over nineteen rows. Carried as a waiver on `vocab-open-items` (drift `open-07-19`); the waiver fails when the caption is corrected.
2. Two different five-item lists are both called "the five masks": the browser-stream masker's (`03#managed-browser`) and the evidence pipeline's (`03#redaction-pipeline`). Carried as two nodes, `vocab-browser-masks` and `vocab-redaction-masks`, each with a note.
3. `refused-policy` (an outcome code) and `refused-policy-pending` (a refusal reason code) near-collide; the closedness scan on `vocab-refusal-codes` reports it as a warning on every check.
4. The six committing actions are stated on seven pages; at `03#substitutor-interface` the list is interrupted by a section reference, so it is checked as members there and verbatim on the other six.
5. The record's own claim that the point-of-no-return question is stated in the same words on every page holds for 00 and DR-004 only; 01 and 02 name the test without the question.
6. DR-010, DR-011 and DR-012 are cited from no numbered document, only from the decisions section.

## The batch, as the tool returned it

```
batch of 4 changes: custody, bank, geography, legal

custody: seeds dr-008
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  alternative alt-dr-008-build-the-vault-ourselves  Build the vault ourselves
  alternative alt-dr-008-encrypt-fields-in-place-in  Encrypt fields in place in our own database
  alternative alt-dr-008-rely-on-the-rails-own  Rely on the rails' own tokens
  alternative alt-dr-008-choose-the-vendor-now  Choose the vendor now
  residual res-07-01  A health or legal matter in common words reaches a worker
  residual res-07-03  A committing placement fires after a narrowing or a flag flip
  residual res-07-06  Every date is masked, yet workers, checkers and the ai executor must read dates
  residual res-07-07  A reversible phone booking cannot close ok under the outbound gate as specified
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  open open-07-11  Vault vendor choice
  open open-07-05  Legal to-verifies: privacy law and cross-border transfer safeguards
  open open-07-01  The front door per market (the channel amber)
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row

bank: seeds vocab-refusal-codes, dr-003, vocab-identity-acts
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  alternative alt-dr-003-the-a-b-c-capability  The A/B/C capability tiers (superseded)
  alternative alt-dr-003-design-to-the-most-restrictive  Design to the most restrictive jurisdiction
  alternative alt-dr-003-no-policy-layer-a-fork  No policy layer; a fork of the core per country
  alternative alt-dr-003-the-full-ceiling-as-launch  The full ceiling as launch scope, with no flags
  residual res-07-14  Objection A's every-cell-delegated against Table 3.5's sign row
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  residual res-07-03  A committing placement fires after a narrowing or a flag flip
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  residual res-07-07  A reversible phone booking cannot close ok under the outbound gate as specified
  residual res-07-09  submit-application is irreversible by rule and reversible in the family journey
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-17  Delegation by a family member

geography: seeds dr-007
  reopens dr-007  A universal core with per-country adapters, legal pack and shift [fixed]
  reopens ledger-1.7.1  India is the build base; the US and the UK are where commercial viability lies [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  reopens ledger-1.7.4  Expansion is a repeatable playbook: adapter plus legal pack plus shift [fixed]
  alternative alt-dr-007-build-for-india-first-fork  Build for India first, fork for the west later
  alternative alt-dr-007-build-for-one-market-only  Build for one market only
  alternative alt-dr-007-adapters-that-hand-real-values  Adapters that hand real values to the planner
  alternative alt-dr-007-one-global-deployment-with-no  One global deployment with no residency map
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  open open-07-02  First-cohort market sequencing
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-05  Legal to-verifies: privacy law and cross-border transfer safeguards
  open open-07-03  Pilot vertical sequencing

legal: seeds open-07-04, open-07-05, vocab-refusal-codes, comp-mail-relay
  reopens ledger-1.3.3  Every execution surface is ours: managed browser, our telephony, our mail relay [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  alternative alt-dr-014-framing-b-ledger-led-what  Framing B, ledger-led: what it did better
  alternative alt-dr-014-the-cost-a-read-back  The cost: a read-back path left open
  alternative alt-dr-014-the-cost-its-figures  The cost: its figures
  alternative alt-dr-014-the-cost-drift-from-the  The cost: drift from the canon
  alternative alt-dr-008-build-the-vault-ourselves  Build the vault ourselves
  alternative alt-dr-008-encrypt-fields-in-place-in  Encrypt fields in place in our own database
  alternative alt-dr-008-rely-on-the-rails-own  Rely on the rails' own tokens
  alternative alt-dr-008-choose-the-vendor-now  Choose the vendor now
  alternative alt-dr-004-a-standing-mandate-at-account  A standing mandate at account level
  alternative alt-dr-004-a-spend-cap-alone  A spend cap alone
  alternative alt-dr-004-confirm-every-step  Confirm every step
  alternative alt-dr-004-reversibility-judged-by-the-executor  Reversibility judged by the executor at the moment of acting
  alternative alt-dr-003-the-a-b-c-capability  The A/B/C capability tiers (superseded)
  alternative alt-dr-003-design-to-the-most-restrictive  Design to the most restrictive jurisdiction
  alternative alt-dr-003-no-policy-layer-a-fork  No policy layer; a fork of the core per country
  alternative alt-dr-003-the-full-ceiling-as-launch  The full ceiling as launch scope, with no flags
  residual res-07-03  A committing placement fires after a narrowing or a flag flip
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  residual res-07-16  The worked card for task 12 step 3 carries a sub-cap the envelope cannot produce
  residual res-07-04  The step-deadline timer can re-run an irreversible act that has fired
  residual res-07-15  A withdrawn committing utterance closes cancelled although the step has fired
  residual res-07-01  A health or legal matter in common words reaches a worker
  residual res-07-05  An undo-route submit on a reversible step cannot be told from any other submit
  residual res-07-08  Every submit is refused on a reversible step, and an undo-route submit fires on 
  open comp-residency-map  The data-residency map
  open open-07-11  Vault vendor choice
  open open-07-17  Delegation by a family member
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long

shared upstream (reopened by two or more changes)
  ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map  (custody, geography, legal)
  dr-008  Tokenisation vault bought, not built  (custody, legal)
  ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases  (custody, legal)
  dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags  (bank, legal)
  ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime  (bank, legal)
  ledger-1.2.2  The per-country flag table doubles as the lobbying agenda  (bank, legal)
  ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints  (bank, legal)
  ledger-1.7.2  Universal core, one build, country-agnostic  (geography, legal)

loci: 106 sections on 16 pages; "touched by" counts the changes whose closure reaches the section
   4 of 4  00-thesis/index.html#one-core                                189  One core, three adapters              comp-adapters, comp-residency-map, vocab-core-components  (custody, bank, geography, legal)
   4 of 4  02-architecture/index.html#telephony                         359  Telephony                             res-07-07, comp-party-directory, res-07-02  (custody, bank, geography, legal)
   4 of 4  02-architecture/index.html#adapters                          570  The market adapter model              comp-adapters  (custody, bank, geography, legal)
   4 of 4  02-architecture/index.html#context-store                     780  The context store                     comp-context-store, res-07-02  (custody, bank, geography, legal)
   4 of 4  03-trust-and-data/index.html#passports                       357  The passports                         comp-adapters  (custody, bank, geography, legal)
   4 of 4  06-roadmap/index.html#sequence                                60  The harness-first build sequence      fatal-1, inv-vault-sdk-two-places, stage-1, stage-2, inv-adapter-never-raw, stage-8, fatal-2, stage-5, stage-6  (custody, bank, geography, legal)
   4 of 4  06-roadmap/index.html#fig-sequence                            63  Eight stages in a fixed order, each   stage-1, stage-2, stage-8, stage-5, stage-6  (custody, bank, geography, legal)
   4 of 4  06-roadmap/index.html#table:6.1                              180  Table 6.1                             comp-adapters, comp-context-store, comp-evidence-pipeline, comp-hash-service, comp-intake-gateway, comp-substitutor, comp-task-cards, comp-task-service, comp-vault, comp-classifier, comp-device-surface, comp-envelope, comp-planner, comp-policy-layer  (custody, bank, geography, legal)
   4 of 4  decisions/dr-007-universal-core-adapters.html#legal-pack      68  The legal pack and the residency map  comp-residency-map, comp-legal-pack  (custody, bank, geography, legal)
   4 of 4  decisions/index.html#ledger                                   60  The ledger                            dr-008, dr-003, dr-007, dr-004, dr-014  (custody, bank, geography, legal)
   3 of 4  00-thesis/index.html#markets                                 183  Markets                               premise-india-build-base  (custody, geography, legal)
   3 of 4  00-thesis/index.html#india-build-base                        185  India as the build base               premise-india-build-base, comp-adapter-in  (custody, geography, legal)
   3 of 4  00-thesis/index.html#moat-made-of                            245  What the moat is made of              comp-evidence-pipeline, comp-substitutor, comp-envelope, inv-alias-only-outside-zone  (custody, bank, legal)
   3 of 4  01-product/index.html#envelope-setup                         197  Set-up at task start                  res-07-02, vocab-identity-acts, vocab-committable-acts, vocab-committing-actions  (bank, geography, legal)
   3 of 4  01-product/index.html#envelope-edits                         210  Edits mid-task: extend and narrow     res-07-03, comp-classifier  (custody, bank, legal)
   3 of 4  01-product/index.html#refusals                               398  What we refuse to do                  fatal-1, inv-otp-never-ours, vocab-flag-values, vocab-refusal-codes, fatal-2  (custody, bank, legal)
   3 of 4  02-architecture/index.html#fig-components                     63  One component can detokenise, the va  comp-substitutor  (custody, bank, legal)
   3 of 4  02-architecture/index.html#step-record                       231  The step record                       res-07-06, res-07-07, res-07-16  (custody, bank, legal)
   3 of 4  02-architecture/index.html#step-catalogue                    277  The step-type catalogue and the act   comp-party-directory, res-07-02, res-07-09  (bank, geography, legal)
   3 of 4  02-architecture/index.html#surface-controllers               366  The surface controllers and the step  comp-task-service, res-07-03, comp-surface-controllers, res-07-05, res-07-08, vocab-committing-actions  (custody, bank, legal)
   3 of 4  02-architecture/index.html#step-context                      369  The signed step context               res-07-03, comp-step-context  (custody, bank, legal)
   3 of 4  02-architecture/index.html#timers                            508  Timers, nudges and the watchdog       comp-task-service, res-07-04  (custody, bank, legal)
   3 of 4  02-architecture/index.html#legal-pack                        646  The legal pack and the shift          comp-legal-pack, vocab-refusal-codes  (bank, geography, legal)
   3 of 4  02-architecture/index.html#dual-control-mechanics            670  Dual control                          res-07-06, comp-approval-token  (custody, bank, legal)
   3 of 4  02-architecture/index.html#envelope-record                   673  The envelope record and the ledger e  res-07-16, comp-envelope  (custody, bank, legal)
   3 of 4  03-trust-and-data/index.html#alias-types                      62  Alias types, classes and their polic  comp-vault, vocab-alias-classes, inv-missing-row-is-bounce  (custody, bank, legal)
   3 of 4  03-trust-and-data/index.html#table:3.1                        65  Table 3.1                             res-07-01, inv-otp-never-ours  (custody, bank, legal)
   3 of 4  03-trust-and-data/index.html#substitution                    194  The substitution component            comp-substitutor  (custody, bank, legal)
   3 of 4  03-trust-and-data/index.html#substitutor-interface           196  Boundary three: the interface and th  res-07-03, comp-step-context, comp-surface-controllers, vocab-committing-actions  (custody, bank, legal)
   3 of 4  03-trust-and-data/index.html#telephony                       308  Telephony                             comp-transcriber, res-07-01, res-07-06, res-07-07, vocab-committing-actions  (custody, bank, legal)
   3 of 4  04-operations/index.html#card-generation                      62  How a card is generated               comp-task-cards, res-07-01  (custody, bank, legal)
   3 of 4  04-operations/index.html#card-script                          83  The script and the result             res-07-06, res-07-07, res-07-16  (custody, bank, legal)
   3 of 4  06-roadmap/index.html#expansion-legal                        219  The legal pack                        comp-legal-pack, vocab-flag-values  (bank, geography, legal)
   3 of 4  decisions/dr-004-authority-envelope.html#test                 76  The test and the rule                 res-07-07, comp-approval-token, comp-fired-marker, res-07-05, res-07-08, vocab-committing-actions  (custody, bank, legal)
   2 of 4  index.html#fatal-one                                         129  A worker sees something they should   fatal-1  (custody, legal)
   2 of 4  00-thesis/index.html#what-consequence-means                   64  What consequence means                fatal-1, fatal-2  (custody, legal)
   2 of 4  00-thesis/index.html#why-now                                 146  Why now                               premise-why-now  (bank, legal)
   2 of 4  00-thesis/index.html#trust-layer-bought                      154  The trust layer can be bought         comp-vault  (custody, legal)
   2 of 4  00-thesis/index.html#us-uk-commercial                        187  The US and the UK as commercial grou  inv-otp-never-ours, comp-adapter-uk, comp-adapter-us  (bank, geography)
   2 of 4  01-product/index.html#journey-health                         105  Health and medical: a specialist app  res-07-06, res-07-07  (custody, bank)
   2 of 4  01-product/index.html#journey-family                         117  Family affairs: a parent's repeat pr  res-07-09, res-07-05, res-07-08  (bank, legal)
   2 of 4  01-product/index.html#envelope                               193  The authority envelope from the user  comp-approval-token, comp-envelope  (bank, legal)
   2 of 4  02-architecture/index.html#overview                           60  Overview                              vocab-core-components, inv-alias-only-outside-zone  (geography, legal)
   2 of 4  02-architecture/index.html#class-selection                   226  Choosing between the three classes    comp-policy-layer, res-07-14, vocab-flag-values  (bank, legal)
   2 of 4  02-architecture/index.html#table:2.5                         280  Table 2.5                             res-07-09, vocab-identity-acts, vocab-committable-acts  (bank, legal)
   2 of 4  02-architecture/index.html#table:2.6                         301  Table 2.6                             vocab-alias-classes, res-07-05  (custody, legal)
   2 of 4  02-architecture/index.html#mail-relay                        363  The mail relay                        comp-mail-relay  (custody, legal)
   2 of 4  02-architecture/index.html#hash-service                      775  The hash service                      comp-hash-service, vocab-detectors, vocab-doors  (custody, legal)
   2 of 4  02-architecture/index.html#who-reads                         803  Who reads and writes it               vocab-detectors  (custody, legal)
   2 of 4  02-architecture/index.html#edge-tokenisation                 812  Tokenisation at the edge              comp-channel-connector, comp-edge-proxy, vocab-detectors, vocab-doors  (custody, legal)
   2 of 4  02-architecture/worker-console.html#task-card                 60  The task card                         comp-task-cards, comp-tiers  (custody, bank)
   2 of 4  03-trust-and-data/index.html#entry-routes                     82  Boundary one: the three doors a real  comp-edge-proxy, comp-hash-service, vocab-doors  (custody, legal)
   2 of 4  03-trust-and-data/index.html#managed-browser                 305  The managed browser                   comp-browser-masker, res-07-08  (custody, legal)
   2 of 4  03-trust-and-data/index.html#mail-relay                      310  The mail relay                        comp-mail-relay  (custody, legal)
   2 of 4  03-trust-and-data/index.html#policy-flags                    396  The policy flag table and the lobbyi  comp-policy-layer, vocab-flag-values  (bank, legal)
   2 of 4  03-trust-and-data/index.html#table:3.5                       399  Table 3.5                             flag-answer-security-questions, flag-attest-fact, flag-basis-speak-as-customer, flag-book-or-cancel, flag-complete-kyc-form, flag-pay-under-cap, flag-present-document, flag-share-health-record, flag-sign, flag-state-identity-number, flag-undergo-identification, flag-use-delegated-login, res-07-14, vocab-identity-acts  (bank, legal)
   2 of 4  03-trust-and-data/index.html#threat-model                    420  The threat model: paths by which a h  fatal-1  (custody, legal)
   2 of 4  03-trust-and-data/index.html#table:3.6                       556  Table 3.6                             comp-transcriber, inv-no-real-value-at-rest, res-07-01  (custody, legal)
   2 of 4  03-trust-and-data/index.html#residency                       618  The data-residency map                comp-residency-map  (custody, geography)
   2 of 4  04-operations/index.html#task-cards                           60  Task cards and pseudonymisation       comp-task-cards  (custody, bank)
   2 of 4  04-operations/index.html#need-to-know                         64  Need-to-know and Client 4471          vocab-detectors  (custody, legal)
   2 of 4  04-operations/index.html#three-tiers                         222  The three tiers                       comp-tiers, vocab-identity-acts  (bank, legal)
   2 of 4  07-open/index.html#items                                      60  Every open item, with an owner and a  res-07-14, open-07-04, open-07-05  (bank, legal)
   2 of 4  decisions/dr-003-full-delegation-ceiling.html#decision        61  Decision                              dr-003  (bank, legal)
   2 of 4  decisions/dr-003-full-delegation-ceiling.html#ceiling         63  The ceiling                           inv-otp-never-ours, vocab-identity-acts  (bank, legal)
   2 of 4  decisions/dr-003-full-delegation-ceiling.html#policy-layer    65  The policy layer                      comp-policy-layer, inv-missing-row-is-bounce, vocab-flag-values  (bank, legal)
   2 of 4  decisions/dr-003-full-delegation-ceiling.html#closes-off      85  What this closes off                  inv-flag-filters-envelope, inv-missing-row-is-bounce, inv-no-design-constraint-from-jurisdiction, inv-otp-never-ours  (bank, legal)
   2 of 4  decisions/dr-008-vault-bought.html#decision                   61  Decision                              dr-008  (custody, legal)
   2 of 4  decisions/dr-008-vault-bought.html#not-delegated              65  What buying does not delegate         comp-channel-connector, comp-edge-proxy  (custody, legal)
   2 of 4  decisions/dr-008-vault-bought.html#closes-off                 84  What this closes off                  inv-no-raw-byte-in-our-process, inv-no-real-value-at-rest, inv-region-per-market, inv-vault-sdk-two-places  (custody, legal)
   2 of 4  decisions/dr-016-context-store.html#decision                  61  Decision                              comp-context-store, vocab-detectors  (custody, legal)
   1 of 4  index.html#fatal-two                                         131  An irreversible act the user did not  fatal-2  (legal)
   1 of 4  index.html#three-markets                                     135  Three markets, one build              vocab-core-components  (geography)
   1 of 4  01-product/index.html#journey-legal                           77  Legal and administrative: contest a   res-07-06  (custody)
   1 of 4  01-product/index.html#journey-travel                         130  Travel: rebook a cancelled flight (U  res-07-06  (custody)
   1 of 4  01-product/index.html#intake                                 169  Intake and the channel-agnostic gate  comp-intake-gateway  (custody)
   1 of 4  01-product/index.html#learning                               375  Learning as a by-product of tasks     comp-context-store  (custody)
   1 of 4  02-architecture/index.html#planner                           176  The planner                           comp-planner  (bank)
   1 of 4  02-architecture/index.html#classifier                        211  The classifier                        comp-classifier  (bank)
   1 of 4  02-architecture/index.html#table:2.7                         334  Table 2.7                             res-07-08  (legal)
   1 of 4  02-architecture/index.html#ai-executor                       347  The ai executor                       res-07-05  (legal)
   1 of 4  02-architecture/index.html#managed-browser                   354  The managed browser                   comp-browser-masker, res-07-06  (custody)
   1 of 4  02-architecture/index.html#device-surface                    371  The device surface                    comp-device-surface  (bank)
   1 of 4  02-architecture/index.html#table:2.8                         511  Table 2.8                             res-07-04  (legal)
   1 of 4  02-architecture/index.html#step-states                       531  Step states and the event log         res-07-15, vocab-committing-actions  (legal)
   1 of 4  02-architecture/index.html#closing                           653  Closing a step                        comp-fired-marker, res-07-04  (legal)
   1 of 4  02-architecture/index.html#evidence-pipeline                 718  The evidence pipeline                 comp-evidence-pipeline  (custody)
   1 of 4  02-architecture/index.html#fig-evidence                      720  Only an artefact that has been redac  comp-verifier  (custody)
   1 of 4  02-architecture/index.html#intake-gateway                    810  The intake gateway                    comp-intake-gateway  (custody)
   1 of 4  02-architecture/worker-console.html#alias-only               139  The alias-only rule                   inv-alias-only-outside-zone  (legal)
   1 of 4  03-trust-and-data/index.html#redaction                       334  Artefact redaction                    comp-evidence-pipeline  (custody)
   1 of 4  03-trust-and-data/index.html#redaction-pipeline              336  Boundary five: capture, redact, veri  comp-verifier  (custody)
   1 of 4  03-trust-and-data/index.html#bounce-back                     359  The universal device bounce-back      comp-device-surface  (bank)
   1 of 4  03-trust-and-data/index.html#india-stack                     361  India Stack: DigiLocker, Account Agg  comp-adapter-in  (geography)
   1 of 4  03-trust-and-data/index.html#uk-rails                        363  United Kingdom: Open Banking and the  comp-adapter-uk  (geography)
   1 of 4  03-trust-and-data/index.html#us-rails                        365  United States: bank-data aggregation  comp-adapter-us  (geography)
   1 of 4  04-operations/index.html#handover                            204  The three shifts and the handover     res-07-04  (legal)
   1 of 4  04-operations/index.html#dual-control                        302  Dual control on the floor             comp-fired-marker, res-07-04, res-07-08, res-07-15, vocab-committing-actions  (legal)
   1 of 4  06-roadmap/index.html#pilot-identity                         168  Delegated identity acts               vocab-flag-values  (bank)
   1 of 4  07-open/index.html#objections                                105  Objections formed against fixed deci  res-07-14  (bank)
   1 of 4  decisions/dr-004-authority-envelope.html#decision             61  Decision                              dr-004  (legal)
   1 of 4  decisions/dr-004-authority-envelope.html#fields               63  The five fields                       vocab-committable-acts, vocab-committing-actions  (legal)
   1 of 4  decisions/dr-004-authority-envelope.html#closes-off           97  What this closes off                  inv-no-step-before-envelope, inv-nothing-past-validity-window, res-07-04  (legal)
   1 of 4  decisions/dr-007-universal-core-adapters.html#decision        61  Decision                              dr-007, vocab-core-components  (geography)
   1 of 4  decisions/dr-007-universal-core-adapters.html#closes-off      87  What this closes off                  inv-adapter-never-raw, inv-core-country-agnostic, inv-one-text-per-core-rule  (geography)
   1 of 4  decisions/dr-014-substitution-framing.html#decision           61  Decision                              dr-014  (legal)
```

## The endgame position, which has no node

`impact --at` seeded by the locus nearest to the position, the moat's eight properties, at depth 1, and `at` on the business stub, which nothing in the map carries:

```
impact premise-moat, comp-substitutor, comp-envelope, comp-access-ledger, comp-evidence-pipeline, comp-site-controls, inv-alias-only-outside-zone, inv-system-forgetting-forbidden, vocab-moat-properties (down 1)
REOPENS      dr-004  The authority envelope and the point-of-no-return test [fixed]; closes off inv-no-step-before-envelope, inv-no-irreversible-outside-envelope, inv-irreversible-inside-dual-control, inv-at-most-once, inv-nothing-past-validity-window  <- comp-envelope
             dr-006  Office-mandatory 24/7 operation with site controls [fixed]; closes off inv-no-step-off-site, inv-site-controls-are-trust-controls, inv-never-a-closure  <- comp-site-controls
             dr-009  Evidence redaction as part of the harness [fixed]; closes off inv-no-raw-artefact, inv-verify-before-view, inv-no-export-path  <- comp-evidence-pipeline
             dr-014  The substitution framing: boundary sequence over ledger spine [fixed]; closes off inv-boundary-sequence-fixed  <- comp-substitutor
             ledger-1.1.2  The trust story is visible through a per-task access ledger in plain words [fixed]  <- comp-access-ledger
             ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]  <- inv-alias-only-outside-zone
             ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]  <- comp-substitutor
             ledger-1.4.1  User abandonment is legitimate; system forgetting is forbidden as an invariant [fixed]  <- inv-system-forgetting-forbidden
             ledger-1.7.2  Universal core, one build, country-agnostic [fixed]  <- comp-substitutor
             ledger-1.8.1  Office mandatory 24/7, site controls in the trust guarantee, remote-safe later [fixed]  <- comp-site-controls
             dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]; closes off inv-missing-row-is-bounce, inv-otp-never-ours, inv-flag-filters-envelope, inv-no-design-constraint-from-jurisdiction  <- comp-policy-layer
             dr-008  Tokenisation vault bought, not built [fixed]; closes off inv-no-real-value-at-rest, inv-vault-sdk-two-places, inv-no-raw-byte-in-our-process, inv-region-per-market  <- comp-vault
             ledger-1.3.4  Evidence redaction is part of the harness; the evidence system is a leak path [fixed]  <- dr-009
             ledger-1.3.5  The threat model is organised as paths by which a human could see a real value [fixed]  <- comp-threat-model
             ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]  <- dr-004
             ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]  <- dr-004
             ledger-1.8.2  Workforce tiers L1, L2, L3, with QA and escalation standalone [fixed]  <- dr-006
             ledger-1.8.3  Task cards are AI-generated and need-to-know [fixed]  <- dr-006
             ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]  <- dr-003
             ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]  <- dr-003
             ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]  <- dr-003
             ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]  <- dr-008
ALTERNATIVES alt-dr-014-framing-b-ledger-led-what  Framing B, ledger-led: what it did better  (rejected by dr-014)
             alt-dr-014-the-cost-a-read-back  The cost: a read-back path left open  (rejected by dr-014)
             alt-dr-014-the-cost-its-figures  The cost: its figures  (rejected by dr-014)
             alt-dr-014-the-cost-drift-from-the  The cost: drift from the canon  (rejected by dr-014)
             alt-dr-004-a-standing-mandate-at-account  A standing mandate at account level  (rejected by dr-004)
             alt-dr-004-a-spend-cap-alone  A spend cap alone  (rejected by dr-004)
             alt-dr-004-confirm-every-step  Confirm every step  (rejected by dr-004)
             alt-dr-004-reversibility-judged-by-the-executor  Reversibility judged by the executor at the moment of acting  (rejected by dr-004)
             alt-dr-009-redaction-as-an-operational-policy  Redaction as an operational policy  (rejected by dr-009)
             alt-dr-009-redact-at-display-time  Redact at display time  (rejected by dr-009)
             alt-dr-009-keep-no-evidence-at-all  Keep no evidence at all  (rejected by dr-009)
             alt-dr-009-one-redaction-pass-no-independent  One redaction pass, no independent verification  (rejected by dr-009)
             alt-dr-009-artefacts-as-customer-facing-proof  Artefacts as customer-facing proof  (rejected by dr-009)
             alt-dr-006-a-remote-workforce  A remote workforce  (rejected by dr-006)
             alt-dr-006-a-hybrid-floor-sensitive-steps  A hybrid floor: sensitive steps in the office, the rest remote  (rejected by dr-006)
             alt-dr-006-a-day-shift-only-with  A day shift only, with western tasks queued to the next Indian morning  (rejected by dr-006)
             alt-dr-006-three-offices-one-per-market  Three offices, one per market  (rejected by dr-006)

at 05-business/index.html#when-it-reopens
  no node carries this locus; 2 inbound links from 2 pages
             06-roadmap/index.html:174
             decisions/dr-015-economics-deferred.html:62
```
