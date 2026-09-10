# Batch 0002: the first changes from the Jash exchange

Recorded 2026-09-10 as the first batch that edits the record. Batch 0001
proposed and changed nothing; this one changes pages. Three of the five
divergences are carried here, each with the founder's decision; the other two
go to batch 0003. The tool was run before any edit with the seeds below, the
edits were made against its list of loci, the graph was updated for what moved,
and the tool was run again on the edited record. Both outputs are at the end.

## The changes, as seeds, with the decision taken

| Change | The founder's decision | Seeds |
|--------|------------------------|-------|
| bank-reading-b | Reading B. The design ceiling stays: a delegated debit under the cap is a placement like any other (DR-003; 03 section 2.1). The record now says plainly what the pilot does: we hold no bank login, card PIN or payment-app passcode, the pilot loads the flag for "make a payment under the cap" as bounce in every market, and we do every step up to the tap that moves money, which is the user's own act on their own device until a rail admits a registered agent. NPCI's Unified Agent Protocol (Reuters, 1 September 2026) is recorded in Table 3.4 as the first candidate. | `vocab-refusal-codes/refused-credential`, `flag-pay-under-cap`, and the new `inv-no-financial-credential` |
| custody-key-release | The porter-with-OTP model (sensitive data left in a third-party container, AI.fred handing the user a code) is rejected: an OTP is never ours (DR-003) and the substitutor is the only detokenise principal (DR-008). What the record lacked, and now carries, is the user-side key: no detokenisation except against an envelope version the user's own device signed, and a withdrawal or the window's close revokes it. The vault's credential and the user's key are two locks; neither opens the other. | `dr-008`, `comp-substitutor`, `comp-envelope`, and the new `inv-envelope-bound-detokenise` |
| geography-abroad | Reconciled, not changed. A country-agnostic core with per-country flags that only ever detract is DR-003 and DR-007 as written. One clause is added so a user abroad is the same two-lookup case, and a country with no legal pack has no rows and reads bounce. | `dr-003` |

Carried to batch 0003: sending mail as the user (touches `comp-mail-relay`,
DR-001's proxy termination, threat path 3 and the mailbox-credential question)
and the endgame position (a new premise and a decision record; collides with
DR-015, DR-016, 01 section 7 and the trust story).

## What was edited, by node

- `inv-no-financial-credential` (new): canonical at `01#refusals`, restated in the
  trust story's "What we never do" and mentioned at `06#pilot-identity`.
  Justified by fatal failure two, closed off by DR-003, depended on by the
  passport adapters.
- `inv-envelope-bound-detokenise` (new): canonical as a new bullet of DR-008's
  "What this closes off", with DR-008's status paragraph recording the
  confirmation; restated at `03#substitutor-interface` (the device-signed
  confirmation becomes a field of the signed step context and one more ordered
  check) and at `01#envelope-setup`; mentioned in the trust story's promise.
  Closed off by DR-008 and DR-004; depended on by the substitutor, the envelope
  and the step context.
- `flag-pay-under-cap`: the pilot's runtime value, bounce in every market, is now
  stated at `03#policy-flags`, `06#pilot-identity` and in Table 7.1's
  identity-acts row; the designed cells in Table 3.5 are unchanged, so the
  node's `cells` are unchanged and a note records the pilot value.
- `premise-why-now`: Table 3.4 gains the Unified Agent Protocol row, verified
  against a new `src-16` on 03 (the same Reuters report as 00's `src-3`).
- `dr-003`: section 1.2 gains the user-abroad clause.
- Drift from batch 0001, fixed: finding 1, Table 7.1's caption now says nineteen
  and the `open-07-19` waiver is removed from `vocab-open-items`; finding 2, the
  two lists are now "the five stream masks" (the browser masker: `03#managed-browser`,
  `02#managed-browser`) and "the five artefact masks" (the evidence pipeline:
  `03#redaction-pipeline`, `02#stages`, Figure 2.4, DR-009), and the two vocab
  nodes are relabelled with their shared-name notes dropped.
- Reopened by the batch and confirmed unchanged: DR-003, DR-004, DR-008, DR-014
  and ledger bullets 1.2.1 to 1.2.3, 1.3.1, 1.3.2, 1.3.6, 1.3.7, 1.7.2 and 1.7.3.
- Dates: nine pages revised 2026-09-10 (01, 02, 03, the trust story, 06, 07,
  DR-003, DR-008, DR-009), with their rows in the two index tables and the
  manifest.

## Checks on the edited record

`check --warnings`: clean, 323 nodes, 550 edges, one warning (the
`refused-policy` near-collision, batch 0001 finding 3, still open).
`verify`: clean. `selftest`: clean.

Still open from batch 0001's drift list: 3 (the near-collision), 4 (the
committing-actions list interrupted at `03#substitutor-interface`, carried as a
members check), 5 (the point-of-no-return question absent from 01 and 02) and 6
(DR-010, DR-011 and DR-012 cited from no numbered document).

## The batch, as the tool returned it before the edit

```
batch of 3 changes: bank-reading-b, custody-key-release, geography-abroad

bank-reading-b: seeds vocab-refusal-codes, flag-pay-under-cap
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  alternative alt-dr-003-the-a-b-c-capability  The A/B/C capability tiers (superseded)
  alternative alt-dr-003-design-to-the-most-restrictive  Design to the most restrictive jurisdiction
  alternative alt-dr-003-no-policy-layer-a-fork  No policy layer; a fork of the core per country
  alternative alt-dr-003-the-full-ceiling-as-launch  The full ceiling as launch scope, with no flags
  residual res-07-14  Objection A's every-cell-delegated against Table 3.5's sign row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-17  Delegation by a family member

custody-key-release: seeds dr-008, comp-substitutor, comp-envelope
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  alternative alt-dr-008-build-the-vault-ourselves  Build the vault ourselves
  alternative alt-dr-008-encrypt-fields-in-place-in  Encrypt fields in place in our own database
  alternative alt-dr-008-rely-on-the-rails-own  Rely on the rails' own tokens
  alternative alt-dr-008-choose-the-vendor-now  Choose the vendor now
  alternative alt-dr-014-framing-b-ledger-led-what  Framing B, ledger-led: what it did better
  alternative alt-dr-014-the-cost-a-read-back  The cost: a read-back path left open
  alternative alt-dr-014-the-cost-its-figures  The cost: its figures
  alternative alt-dr-014-the-cost-drift-from-the  The cost: drift from the canon
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
  residual res-07-07  A reversible phone booking cannot close ok under the outbound gate as specified
  open open-07-11  Vault vendor choice
  open open-07-17  Delegation by a family member
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-12  Telephony, browser sandbox and model vendors

geography-abroad: seeds dr-003
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  alternative alt-dr-003-the-a-b-c-capability  The A/B/C capability tiers (superseded)
  alternative alt-dr-003-design-to-the-most-restrictive  Design to the most restrictive jurisdiction
  alternative alt-dr-003-no-policy-layer-a-fork  No policy layer; a fork of the core per country
  alternative alt-dr-003-the-full-ceiling-as-launch  The full ceiling as launch scope, with no flags
  residual res-07-14  Objection A's every-cell-delegated against Table 3.5's sign row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-17  Delegation by a family member

shared upstream (reopened by two or more changes)
  dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags  (bank-reading-b, custody-key-release, geography-abroad)
  ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime  (bank-reading-b, custody-key-release, geography-abroad)
  ledger-1.2.2  The per-country flag table doubles as the lobbying agenda  (bank-reading-b, custody-key-release, geography-abroad)
  ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints  (bank-reading-b, custody-key-release, geography-abroad)

loci: 90 sections on 17 pages; "touched by" counts the changes whose closure reaches the section
   3 of 3  00-thesis/index.html#why-now                                 146  Why now                               premise-why-now  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  01-product/index.html#refusals                               398  What we refuse to do                  vocab-refusal-codes, fatal-1, fatal-2, inv-otp-never-ours, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  02-architecture/index.html#class-selection                   226  Choosing between the three classes    comp-policy-layer, res-07-14, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  03-trust-and-data/index.html#alias-types                      62  Alias types, classes and their polic  inv-missing-row-is-bounce, comp-vault, vocab-alias-classes  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  03-trust-and-data/index.html#policy-flags                    396  The policy flag table and the lobbyi  comp-policy-layer, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  03-trust-and-data/index.html#table:3.5                       399  Table 3.5                             flag-pay-under-cap, res-07-14, vocab-identity-acts, flag-answer-security-questions, flag-attest-fact, flag-basis-speak-as-customer, flag-book-or-cancel, flag-complete-kyc-form, flag-present-document, flag-share-health-record, flag-sign, flag-state-identity-number, flag-undergo-identification, flag-use-delegated-login  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  06-roadmap/index.html#table:6.1                              180  Table 6.1                             comp-policy-layer, comp-task-service, comp-access-ledger, comp-classifier, comp-device-surface, comp-envelope, comp-hash-service, comp-managed-browser, comp-planner, comp-substitutor, comp-task-cards, comp-telephony, comp-vault  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/dr-003-full-delegation-ceiling.html#decision        61  Decision                              dr-003  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/dr-003-full-delegation-ceiling.html#policy-layer    65  The policy layer                      comp-policy-layer, inv-missing-row-is-bounce, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/dr-003-full-delegation-ceiling.html#closes-off      85  What this closes off                  inv-flag-filters-envelope, inv-missing-row-is-bounce, inv-no-design-constraint-from-jurisdiction, inv-otp-never-ours  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/index.html#ledger                                   60  The ledger                            dr-003, dr-004, dr-008, dr-014  (bank-reading-b, custody-key-release, geography-abroad)
   2 of 3  01-product/index.html#envelope-setup                         197  Set-up at task start                  res-07-02, vocab-committable-acts, vocab-committing-actions, vocab-identity-acts  (custody-key-release, geography-abroad)
   2 of 3  02-architecture/index.html#table:2.5                         280  Table 2.5                             vocab-committable-acts, vocab-identity-acts  (custody-key-release, geography-abroad)
   2 of 3  02-architecture/index.html#surface-controllers               366  The surface controllers and the step  comp-task-service, comp-surface-controllers, res-07-03, res-07-05, res-07-08, vocab-committing-actions  (bank-reading-b, custody-key-release)
   2 of 3  02-architecture/index.html#timers                            508  Timers, nudges and the watchdog       comp-task-service, res-07-04  (bank-reading-b, custody-key-release)
   2 of 3  03-trust-and-data/index.html#table:3.1                        65  Table 3.1                             res-07-01, inv-otp-never-ours  (custody-key-release, geography-abroad)
   2 of 3  04-operations/index.html#three-tiers                         222  The three tiers                       vocab-identity-acts  (custody-key-release, geography-abroad)
   2 of 3  06-roadmap/index.html#expansion-legal                        219  The legal pack                        comp-legal-pack, vocab-flag-values  (bank-reading-b, geography-abroad)
   2 of 3  07-open/index.html#items                                      60  Every open item, with an owner and a  res-07-14  (bank-reading-b, geography-abroad)
   2 of 3  07-open/index.html#objections                                105  Objections formed against fixed deci  res-07-14  (bank-reading-b, geography-abroad)
   2 of 3  decisions/dr-003-full-delegation-ceiling.html#ceiling         63  The ceiling                           vocab-identity-acts, inv-otp-never-ours  (custody-key-release, geography-abroad)
   1 of 3  index.html#fatal-one                                         129  A worker sees something they should   fatal-1  (custody-key-release)
   1 of 3  index.html#fatal-two                                         131  An irreversible act the user did not  fatal-2  (custody-key-release)
   1 of 3  00-thesis/index.html#what-consequence-means                   64  What consequence means                fatal-1, fatal-2  (custody-key-release)
   1 of 3  00-thesis/index.html#how-we-cross-it                         135  How we cross it                       comp-threat-model  (custody-key-release)
   1 of 3  00-thesis/index.html#trust-layer-bought                      154  The trust layer can be bought         comp-vault  (custody-key-release)
   1 of 3  00-thesis/index.html#markets                                 183  Markets                               premise-india-build-base  (custody-key-release)
   1 of 3  00-thesis/index.html#india-build-base                        185  India as the build base               premise-india-build-base  (custody-key-release)
   1 of 3  00-thesis/index.html#us-uk-commercial                        187  The US and the UK as commercial grou  inv-otp-never-ours  (geography-abroad)
   1 of 3  00-thesis/index.html#moat-made-of                            245  What the moat is made of              comp-access-ledger, comp-envelope, comp-substitutor, inv-alias-only-outside-zone  (custody-key-release)
   1 of 3  01-product/index.html#journey-health                         105  Health and medical: a specialist app  res-07-07  (custody-key-release)
   1 of 3  01-product/index.html#journey-family                         117  Family affairs: a parent's repeat pr  res-07-05, res-07-08  (custody-key-release)
   1 of 3  01-product/index.html#envelope                               193  The authority envelope from the user  comp-approval-token, comp-envelope  (custody-key-release)
   1 of 3  01-product/index.html#envelope-edits                         210  Edits mid-task: extend and narrow     comp-classifier, res-07-03  (custody-key-release)
   1 of 3  02-architecture/index.html#overview                           60  Overview                              inv-alias-only-outside-zone  (custody-key-release)
   1 of 3  02-architecture/index.html#fig-components                     63  One component can detokenise, the va  comp-substitutor  (custody-key-release)
   1 of 3  02-architecture/index.html#planner                           176  The planner                           comp-planner  (custody-key-release)
   1 of 3  02-architecture/index.html#classifier                        211  The classifier                        comp-classifier  (custody-key-release)
   1 of 3  02-architecture/index.html#step-record                       231  The step record                       res-07-07, res-07-16  (custody-key-release)
   1 of 3  02-architecture/index.html#step-catalogue                    277  The step-type catalogue and the act   res-07-02  (custody-key-release)
   1 of 3  02-architecture/index.html#table:2.6                         301  Table 2.6                             res-07-05, vocab-alias-classes  (custody-key-release)
   1 of 3  02-architecture/index.html#table:2.7                         334  Table 2.7                             res-07-08  (custody-key-release)
   1 of 3  02-architecture/index.html#ai-executor                       347  The ai executor                       res-07-05  (custody-key-release)
   1 of 3  02-architecture/index.html#managed-browser                   354  The managed browser                   comp-managed-browser  (custody-key-release)
   1 of 3  02-architecture/index.html#telephony                         359  Telephony                             comp-telephony, res-07-02, res-07-07  (custody-key-release)
   1 of 3  02-architecture/index.html#mail-relay                        363  The mail relay                        comp-mail-relay  (custody-key-release)
   1 of 3  02-architecture/index.html#step-context                      369  The signed step context               comp-step-context, res-07-03  (custody-key-release)
   1 of 3  02-architecture/index.html#device-surface                    371  The device surface                    comp-device-surface  (custody-key-release)
   1 of 3  02-architecture/index.html#table:2.8                         511  Table 2.8                             res-07-04  (custody-key-release)
   1 of 3  02-architecture/index.html#step-states                       531  Step states and the event log         res-07-15, vocab-committing-actions  (custody-key-release)
   1 of 3  02-architecture/index.html#legal-pack                        646  The legal pack and the shift          comp-legal-pack, vocab-refusal-codes  (bank-reading-b)
   1 of 3  02-architecture/index.html#closing                           653  Closing a step                        comp-fired-marker, res-07-04  (custody-key-release)
   1 of 3  02-architecture/index.html#dual-control-mechanics            670  Dual control                          comp-approval-token  (custody-key-release)
   1 of 3  02-architecture/index.html#envelope-record                   673  The envelope record and the ledger e  comp-access-ledger, comp-envelope, res-07-16  (custody-key-release)
   1 of 3  02-architecture/index.html#hash-service                      775  The hash service                      comp-hash-service, vocab-detectors, vocab-doors  (custody-key-release)
   1 of 3  02-architecture/index.html#context-store                     780  The context store                     res-07-02  (custody-key-release)
   1 of 3  02-architecture/index.html#who-reads                         803  Who reads and writes it               vocab-detectors  (custody-key-release)
   1 of 3  02-architecture/index.html#edge-tokenisation                 812  Tokenisation at the edge              comp-channel-connector, comp-edge-proxy, vocab-detectors, vocab-doors  (custody-key-release)
   1 of 3  02-architecture/worker-console.html#task-card                 60  The task card                         comp-task-cards  (custody-key-release)
   1 of 3  02-architecture/worker-console.html#alias-only               139  The alias-only rule                   inv-alias-only-outside-zone  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#entry-routes                     82  Boundary one: the three doors a real  comp-edge-proxy, comp-hash-service, vocab-doors  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#substitution                    194  The substitution component            comp-substitutor  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#substitutor-interface           196  Boundary three: the interface and th  comp-step-context, comp-surface-controllers, res-07-03, vocab-committing-actions  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#managed-browser                 305  The managed browser                   comp-managed-browser, res-07-08  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#telephony                       308  Telephony                             comp-telephony, res-07-01, res-07-07, vocab-committing-actions  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#mail-relay                      310  The mail relay                        comp-mail-relay  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#bounce-back                     359  The universal device bounce-back      comp-device-surface  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#threat-model                    420  The threat model: paths by which a h  comp-threat-model, fatal-1  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#table:3.6                       556  Table 3.6                             inv-no-real-value-at-rest, res-07-01  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#access-ledger                   591  The access ledger                     comp-access-ledger  (custody-key-release)
   1 of 3  03-trust-and-data/trust-story.html#ledger-example            114  What your ledger looks like           comp-access-ledger  (custody-key-release)
   1 of 3  04-operations/index.html#task-cards                           60  Task cards and pseudonymisation       comp-task-cards  (custody-key-release)
   1 of 3  04-operations/index.html#card-generation                      62  How a card is generated               comp-task-cards, res-07-01  (custody-key-release)
   1 of 3  04-operations/index.html#need-to-know                         64  Need-to-know and Client 4471          vocab-detectors  (custody-key-release)
   1 of 3  04-operations/index.html#card-script                          83  The script and the result             res-07-07, res-07-16  (custody-key-release)
   1 of 3  04-operations/index.html#handover                            204  The three shifts and the handover     res-07-04  (custody-key-release)
   1 of 3  04-operations/index.html#dual-control                        302  Dual control on the floor             comp-fired-marker, res-07-04, res-07-08, res-07-15, vocab-committing-actions  (custody-key-release)
   1 of 3  06-roadmap/index.html#sequence                                60  The harness-first build sequence      fatal-1, fatal-2, inv-vault-sdk-two-places, stage-1, stage-2  (custody-key-release)
   1 of 3  06-roadmap/index.html#fig-sequence                            63  Eight stages in a fixed order, each   stage-1, stage-2  (custody-key-release)
   1 of 3  06-roadmap/index.html#pilot-identity                         168  Delegated identity acts               vocab-flag-values  (geography-abroad)
   1 of 3  decisions/dr-004-authority-envelope.html#decision             61  Decision                              dr-004  (custody-key-release)
   1 of 3  decisions/dr-004-authority-envelope.html#fields               63  The five fields                       vocab-committable-acts, vocab-committing-actions  (custody-key-release)
   1 of 3  decisions/dr-004-authority-envelope.html#test                 76  The test and the rule                 comp-approval-token, comp-fired-marker, res-07-05, res-07-07, res-07-08, vocab-committing-actions  (custody-key-release)
   1 of 3  decisions/dr-004-authority-envelope.html#closes-off           97  What this closes off                  inv-no-step-before-envelope, inv-nothing-past-validity-window, res-07-04  (custody-key-release)
   1 of 3  decisions/dr-007-universal-core-adapters.html#legal-pack      68  The legal pack and the residency map  comp-legal-pack  (bank-reading-b)
   1 of 3  decisions/dr-008-vault-bought.html#decision                   61  Decision                              dr-008  (custody-key-release)
   1 of 3  decisions/dr-008-vault-bought.html#not-delegated              65  What buying does not delegate         comp-channel-connector, comp-edge-proxy  (custody-key-release)
   1 of 3  decisions/dr-008-vault-bought.html#closes-off                 84  What this closes off                  inv-no-raw-byte-in-our-process, inv-no-real-value-at-rest, inv-region-per-market, inv-vault-sdk-two-places  (custody-key-release)
   1 of 3  decisions/dr-014-substitution-framing.html#decision           61  Decision                              dr-014  (custody-key-release)
   1 of 3  decisions/dr-016-context-store.html#decision                  61  Decision                              vocab-detectors  (custody-key-release)
```

## The batch, as the tool returned it after the edit

The two new invariants were added to their changes' seeds, so the closure now
carries the loci that restate them.

```
batch of 3 changes: bank-reading-b, custody-key-release, geography-abroad

bank-reading-b: seeds vocab-refusal-codes, flag-pay-under-cap, inv-no-financial-credential
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  alternative alt-dr-003-the-a-b-c-capability  The A/B/C capability tiers (superseded)
  alternative alt-dr-003-design-to-the-most-restrictive  Design to the most restrictive jurisdiction
  alternative alt-dr-003-no-policy-layer-a-fork  No policy layer; a fork of the core per country
  alternative alt-dr-003-the-full-ceiling-as-launch  The full ceiling as launch scope, with no flags
  residual res-07-14  Objection A's every-cell-delegated against Table 3.5's sign row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-17  Delegation by a family member

custody-key-release: seeds dr-008, comp-substitutor, comp-envelope, inv-envelope-bound-detokenise
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  alternative alt-dr-008-build-the-vault-ourselves  Build the vault ourselves
  alternative alt-dr-008-encrypt-fields-in-place-in  Encrypt fields in place in our own database
  alternative alt-dr-008-rely-on-the-rails-own  Rely on the rails' own tokens
  alternative alt-dr-008-choose-the-vendor-now  Choose the vendor now
  alternative alt-dr-014-framing-b-ledger-led-what  Framing B, ledger-led: what it did better
  alternative alt-dr-014-the-cost-a-read-back  The cost: a read-back path left open
  alternative alt-dr-014-the-cost-its-figures  The cost: its figures
  alternative alt-dr-014-the-cost-drift-from-the  The cost: drift from the canon
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
  residual res-07-07  A reversible phone booking cannot close ok under the outbound gate as specified
  open open-07-11  Vault vendor choice
  open open-07-17  Delegation by a family member
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-12  Telephony, browser sandbox and model vendors

geography-abroad: seeds dr-003
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  alternative alt-dr-003-the-a-b-c-capability  The A/B/C capability tiers (superseded)
  alternative alt-dr-003-design-to-the-most-restrictive  Design to the most restrictive jurisdiction
  alternative alt-dr-003-no-policy-layer-a-fork  No policy layer; a fork of the core per country
  alternative alt-dr-003-the-full-ceiling-as-launch  The full ceiling as launch scope, with no flags
  residual res-07-14  Objection A's every-cell-delegated against Table 3.5's sign row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-17  Delegation by a family member

shared upstream (reopened by two or more changes)
  dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags  (bank-reading-b, custody-key-release, geography-abroad)
  ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime  (bank-reading-b, custody-key-release, geography-abroad)
  ledger-1.2.2  The per-country flag table doubles as the lobbying agenda  (bank-reading-b, custody-key-release, geography-abroad)
  ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints  (bank-reading-b, custody-key-release, geography-abroad)

loci: 96 sections on 17 pages; "touched by" counts the changes whose closure reaches the section
   3 of 3  00-thesis/index.html#why-now                                 146  Why now                               premise-why-now  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  01-product/index.html#refusals                               398  What we refuse to do                  fatal-2, inv-no-financial-credential, vocab-refusal-codes, fatal-1, inv-otp-never-ours, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  02-architecture/index.html#class-selection                   226  Choosing between the three classes    comp-policy-layer, res-07-14, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  03-trust-and-data/index.html#alias-types                      62  Alias types, classes and their polic  inv-missing-row-is-bounce, comp-vault, vocab-alias-classes  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  03-trust-and-data/index.html#table:3.4                       368  Table 3.4                             premise-why-now  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  03-trust-and-data/index.html#policy-flags                    397  The policy flag table and the lobbyi  comp-policy-layer, flag-pay-under-cap, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  03-trust-and-data/index.html#table:3.5                       400  Table 3.5                             flag-pay-under-cap, res-07-14, vocab-identity-acts, flag-answer-security-questions, flag-attest-fact, flag-basis-speak-as-customer, flag-book-or-cancel, flag-complete-kyc-form, flag-present-document, flag-share-health-record, flag-sign, flag-state-identity-number, flag-undergo-identification, flag-use-delegated-login  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  06-roadmap/index.html#table:6.1                              180  Table 6.1                             comp-adapters, comp-policy-layer, comp-task-service, comp-access-ledger, comp-classifier, comp-device-surface, comp-envelope, comp-hash-service, comp-managed-browser, comp-planner, comp-substitutor, comp-task-cards, comp-telephony, comp-vault  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/dr-003-full-delegation-ceiling.html#decision        61  Decision                              dr-003  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/dr-003-full-delegation-ceiling.html#policy-layer    65  The policy layer                      comp-policy-layer, inv-missing-row-is-bounce, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/dr-003-full-delegation-ceiling.html#closes-off      85  What this closes off                  inv-flag-filters-envelope, inv-missing-row-is-bounce, inv-no-design-constraint-from-jurisdiction, inv-otp-never-ours  (bank-reading-b, custody-key-release, geography-abroad)
   3 of 3  decisions/index.html#ledger                                   60  The ledger                            dr-003, dr-004, dr-008, dr-014  (bank-reading-b, custody-key-release, geography-abroad)
   2 of 3  index.html#fatal-two                                         131  An irreversible act the user did not  fatal-2  (bank-reading-b, custody-key-release)
   2 of 3  00-thesis/index.html#what-consequence-means                   64  What consequence means                fatal-2, fatal-1  (bank-reading-b, custody-key-release)
   2 of 3  01-product/index.html#envelope-setup                         197  Set-up at task start                  inv-envelope-bound-detokenise, res-07-02, vocab-committable-acts, vocab-committing-actions, vocab-identity-acts  (custody-key-release, geography-abroad)
   2 of 3  02-architecture/index.html#table:2.5                         280  Table 2.5                             vocab-committable-acts, vocab-identity-acts  (custody-key-release, geography-abroad)
   2 of 3  02-architecture/index.html#surface-controllers               366  The surface controllers and the step  comp-task-service, comp-surface-controllers, res-07-03, res-07-05, res-07-08, vocab-committing-actions  (bank-reading-b, custody-key-release)
   2 of 3  02-architecture/index.html#timers                            508  Timers, nudges and the watchdog       comp-task-service, res-07-04  (bank-reading-b, custody-key-release)
   2 of 3  03-trust-and-data/index.html#table:3.1                        65  Table 3.1                             res-07-01, inv-otp-never-ours  (custody-key-release, geography-abroad)
   2 of 3  03-trust-and-data/trust-story.html#what-we-never-do          125  What we never do                      inv-no-financial-credential  (bank-reading-b, geography-abroad)
   2 of 3  04-operations/index.html#three-tiers                         222  The three tiers                       vocab-identity-acts  (custody-key-release, geography-abroad)
   2 of 3  06-roadmap/index.html#sequence                                60  The harness-first build sequence      fatal-2, fatal-1, inv-vault-sdk-two-places, stage-1, stage-2  (bank-reading-b, custody-key-release)
   2 of 3  06-roadmap/index.html#pilot-identity                         168  Delegated identity acts               flag-pay-under-cap, inv-no-financial-credential, vocab-flag-values  (bank-reading-b, geography-abroad)
   2 of 3  06-roadmap/index.html#expansion-legal                        219  The legal pack                        comp-legal-pack, vocab-flag-values  (bank-reading-b, geography-abroad)
   2 of 3  07-open/index.html#items                                      60  Every open item, with an owner and a  flag-pay-under-cap, res-07-14  (bank-reading-b, geography-abroad)
   2 of 3  07-open/index.html#objections                                105  Objections formed against fixed deci  res-07-14  (bank-reading-b, geography-abroad)
   2 of 3  decisions/dr-003-full-delegation-ceiling.html#ceiling         63  The ceiling                           vocab-identity-acts, inv-otp-never-ours  (custody-key-release, geography-abroad)
   1 of 3  index.html#fatal-one                                         129  A worker sees something they should   fatal-1  (custody-key-release)
   1 of 3  00-thesis/index.html#how-we-cross-it                         135  How we cross it                       comp-threat-model  (custody-key-release)
   1 of 3  00-thesis/index.html#trust-layer-bought                      154  The trust layer can be bought         comp-vault  (custody-key-release)
   1 of 3  00-thesis/index.html#markets                                 183  Markets                               premise-india-build-base  (custody-key-release)
   1 of 3  00-thesis/index.html#india-build-base                        185  India as the build base               premise-india-build-base  (custody-key-release)
   1 of 3  00-thesis/index.html#us-uk-commercial                        187  The US and the UK as commercial grou  inv-otp-never-ours  (geography-abroad)
   1 of 3  00-thesis/index.html#one-core                                189  One core, three adapters              comp-adapters  (bank-reading-b)
   1 of 3  00-thesis/index.html#moat-made-of                            245  What the moat is made of              comp-access-ledger, comp-envelope, comp-substitutor, inv-alias-only-outside-zone  (custody-key-release)
   1 of 3  01-product/index.html#journey-health                         105  Health and medical: a specialist app  res-07-07  (custody-key-release)
   1 of 3  01-product/index.html#journey-family                         117  Family affairs: a parent's repeat pr  res-07-05, res-07-08  (custody-key-release)
   1 of 3  01-product/index.html#envelope                               193  The authority envelope from the user  comp-approval-token, comp-envelope  (custody-key-release)
   1 of 3  01-product/index.html#envelope-edits                         210  Edits mid-task: extend and narrow     comp-classifier, res-07-03  (custody-key-release)
   1 of 3  02-architecture/index.html#overview                           60  Overview                              inv-alias-only-outside-zone  (custody-key-release)
   1 of 3  02-architecture/index.html#fig-components                     63  One component can detokenise, the va  comp-substitutor  (custody-key-release)
   1 of 3  02-architecture/index.html#planner                           176  The planner                           comp-planner  (custody-key-release)
   1 of 3  02-architecture/index.html#classifier                        211  The classifier                        comp-classifier  (custody-key-release)
   1 of 3  02-architecture/index.html#step-record                       231  The step record                       res-07-07, res-07-16  (custody-key-release)
   1 of 3  02-architecture/index.html#step-catalogue                    277  The step-type catalogue and the act   res-07-02  (custody-key-release)
   1 of 3  02-architecture/index.html#table:2.6                         301  Table 2.6                             res-07-05, vocab-alias-classes  (custody-key-release)
   1 of 3  02-architecture/index.html#table:2.7                         334  Table 2.7                             res-07-08  (custody-key-release)
   1 of 3  02-architecture/index.html#ai-executor                       347  The ai executor                       res-07-05  (custody-key-release)
   1 of 3  02-architecture/index.html#managed-browser                   354  The managed browser                   comp-managed-browser  (custody-key-release)
   1 of 3  02-architecture/index.html#telephony                         359  Telephony                             comp-telephony, res-07-02, res-07-07  (custody-key-release)
   1 of 3  02-architecture/index.html#mail-relay                        363  The mail relay                        comp-mail-relay  (custody-key-release)
   1 of 3  02-architecture/index.html#step-context                      369  The signed step context               comp-step-context, res-07-03  (custody-key-release)
   1 of 3  02-architecture/index.html#device-surface                    371  The device surface                    comp-device-surface  (custody-key-release)
   1 of 3  02-architecture/index.html#table:2.8                         511  Table 2.8                             res-07-04  (custody-key-release)
   1 of 3  02-architecture/index.html#step-states                       531  Step states and the event log         res-07-15, vocab-committing-actions  (custody-key-release)
   1 of 3  02-architecture/index.html#adapters                          570  The market adapter model              comp-adapters  (bank-reading-b)
   1 of 3  02-architecture/index.html#legal-pack                        646  The legal pack and the shift          comp-legal-pack, vocab-refusal-codes  (bank-reading-b)
   1 of 3  02-architecture/index.html#closing                           653  Closing a step                        comp-fired-marker, res-07-04  (custody-key-release)
   1 of 3  02-architecture/index.html#dual-control-mechanics            670  Dual control                          comp-approval-token  (custody-key-release)
   1 of 3  02-architecture/index.html#envelope-record                   673  The envelope record and the ledger e  comp-access-ledger, comp-envelope, res-07-16  (custody-key-release)
   1 of 3  02-architecture/index.html#hash-service                      775  The hash service                      comp-hash-service, vocab-detectors, vocab-doors  (custody-key-release)
   1 of 3  02-architecture/index.html#context-store                     780  The context store                     res-07-02  (custody-key-release)
   1 of 3  02-architecture/index.html#who-reads                         803  Who reads and writes it               vocab-detectors  (custody-key-release)
   1 of 3  02-architecture/index.html#edge-tokenisation                 812  Tokenisation at the edge              comp-channel-connector, comp-edge-proxy, vocab-detectors, vocab-doors  (custody-key-release)
   1 of 3  02-architecture/worker-console.html#task-card                 60  The task card                         comp-task-cards  (custody-key-release)
   1 of 3  02-architecture/worker-console.html#alias-only               139  The alias-only rule                   inv-alias-only-outside-zone  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#entry-routes                     82  Boundary one: the three doors a real  comp-edge-proxy, comp-hash-service, vocab-doors  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#substitution                    194  The substitution component            comp-substitutor  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#substitutor-interface           196  Boundary three: the interface and th  comp-step-context, comp-surface-controllers, inv-envelope-bound-detokenise, res-07-03, vocab-committing-actions  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#managed-browser                 305  The managed browser                   comp-managed-browser, res-07-08  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#telephony                       308  Telephony                             comp-telephony, res-07-01, res-07-07, vocab-committing-actions  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#mail-relay                      310  The mail relay                        comp-mail-relay  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#passports                       357  The passports                         comp-adapters  (bank-reading-b)
   1 of 3  03-trust-and-data/index.html#bounce-back                     359  The universal device bounce-back      comp-device-surface  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#threat-model                    421  The threat model: paths by which a h  comp-threat-model, fatal-1  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#table:3.6                       557  Table 3.6                             inv-no-real-value-at-rest, res-07-01  (custody-key-release)
   1 of 3  03-trust-and-data/index.html#access-ledger                   592  The access ledger                     comp-access-ledger  (custody-key-release)
   1 of 3  03-trust-and-data/trust-story.html#promise                    60  The promise                           inv-envelope-bound-detokenise  (custody-key-release)
   1 of 3  03-trust-and-data/trust-story.html#ledger-example            114  What your ledger looks like           comp-access-ledger  (custody-key-release)
   1 of 3  04-operations/index.html#task-cards                           60  Task cards and pseudonymisation       comp-task-cards  (custody-key-release)
   1 of 3  04-operations/index.html#card-generation                      62  How a card is generated               comp-task-cards, res-07-01  (custody-key-release)
   1 of 3  04-operations/index.html#need-to-know                         64  Need-to-know and Client 4471          vocab-detectors  (custody-key-release)
   1 of 3  04-operations/index.html#card-script                          83  The script and the result             res-07-07, res-07-16  (custody-key-release)
   1 of 3  04-operations/index.html#handover                            204  The three shifts and the handover     res-07-04  (custody-key-release)
   1 of 3  04-operations/index.html#dual-control                        302  Dual control on the floor             comp-fired-marker, res-07-04, res-07-08, res-07-15, vocab-committing-actions  (custody-key-release)
   1 of 3  06-roadmap/index.html#fig-sequence                            63  Eight stages in a fixed order, each   stage-1, stage-2  (custody-key-release)
   1 of 3  decisions/dr-004-authority-envelope.html#decision             61  Decision                              dr-004  (custody-key-release)
   1 of 3  decisions/dr-004-authority-envelope.html#fields               63  The five fields                       vocab-committable-acts, vocab-committing-actions  (custody-key-release)
   1 of 3  decisions/dr-004-authority-envelope.html#test                 76  The test and the rule                 comp-approval-token, comp-fired-marker, res-07-05, res-07-07, res-07-08, vocab-committing-actions  (custody-key-release)
   1 of 3  decisions/dr-004-authority-envelope.html#closes-off           97  What this closes off                  inv-no-step-before-envelope, inv-nothing-past-validity-window, res-07-04  (custody-key-release)
   1 of 3  decisions/dr-007-universal-core-adapters.html#legal-pack      68  The legal pack and the residency map  comp-legal-pack  (bank-reading-b)
   1 of 3  decisions/dr-008-vault-bought.html#decision                   61  Decision                              dr-008  (custody-key-release)
   1 of 3  decisions/dr-008-vault-bought.html#not-delegated              65  What buying does not delegate         comp-channel-connector, comp-edge-proxy  (custody-key-release)
   1 of 3  decisions/dr-008-vault-bought.html#closes-off                 84  What this closes off                  inv-envelope-bound-detokenise, inv-no-raw-byte-in-our-process, inv-no-real-value-at-rest, inv-region-per-market, inv-vault-sdk-two-places  (custody-key-release)
   1 of 3  decisions/dr-014-substitution-framing.html#decision           61  Decision                              dr-014  (custody-key-release)
   1 of 3  decisions/dr-016-context-store.html#decision                  61  Decision                              vocab-detectors  (custody-key-release)
```
