# Batch 0002: the five positions from the Jash exchange

Recorded 2026-09-10 as the first batch that edits the record. A batch is the
changes of one session of ideation and iteration, whatever their number or
kind; that is the founder's definition, now in `SCHEMA.md`, and this session's
changes were the five positions the founder took in the exchange with Jash,
plus the drift the map found while it was built. Batch 0001 proposed and
changed nothing; this one changes pages, in two passes: items 2, 3 and 4 with
the drift fixes first, then items 1 and 5, each with a new decision record.
Before each pass the tool was run with the seeds below, the edits were made
against its list of loci, the graph was updated for what moved, and the tool
was run again on the edited record. The three outputs are at the end.

## The changes, as seeds, with the decision taken

| Change | The founder's decision | Seeds |
|--------|------------------------|-------|
| mail-as-user (item 1) | Every email a third party receives for a user comes from the user's own address: sent by the relay through the user's provider under the mailbox's send scope where the user grants it, or written by the harness and pasted and sent by the user from their own mail app where they do not. Replies land in the user's inbox and reach us by the read connector or the user's forward; the per-task address at our domain is inbound only. Help to the extent the user lets us; nobody migrates their mail. Recorded as DR-018. | `comp-mail-relay`, `dr-001`, `comp-channel-connector`, and the new `dr-018` |
| bank-reading-b (item 2) | Reading B. The design ceiling stays: a delegated debit under the cap is a placement like any other (DR-003; 03 section 2.1). The record now says plainly what the pilot does: we hold no bank login, card PIN or payment-app passcode, the pilot loads the flag for "make a payment under the cap" as bounce in every market, and we do every step up to the tap that moves money, which is the user's own act on their own device until a rail admits a registered agent. NPCI's Unified Agent Protocol (Reuters, 1 September 2026) is recorded in Table 3.4 as the first candidate. | `vocab-refusal-codes/refused-credential`, `flag-pay-under-cap`, and the new `inv-no-financial-credential` |
| geography-abroad (item 3) | Reconciled, not changed. A country-agnostic core with per-country flags that only ever detract is DR-003 and DR-007 as written. One clause is added so a user abroad is the same two-lookup case, and a country with no legal pack has no rows and reads bounce. | `dr-003` |
| custody-key-release (item 4) | The porter-with-OTP model is rejected: an OTP is never ours (DR-003) and the substitutor is the only detokenise principal (DR-008). What the record lacked, and now carries, is the user-side key: no detokenisation except against an envelope version the user's own device signed, and a withdrawal or the window's close revokes it. The vault's credential and the user's key are two locks; neither opens the other. | `dr-008`, `comp-substitutor`, `comp-envelope`, and the new `inv-envelope-bound-detokenise` |
| endgame (item 5) | The wedge is the entry; the destination is the first port of call for everything personal: an AI that builds the user's context, task by task, to do in their personal life what the general assistants do, and that can be trusted with the high-value, low-volume tasks they dread a few times a year. Everyday tasks run on the same harness once a market's legal pack opens them. The context store is the asset, held for the user; its upside beyond the user's own tasks is named as the hook for investment and left open beside the economics deferral, to be decided only by a later record. Recorded as DR-019 and as section 6 of the thesis. | `premise-wedge`, `premise-moat`, `dr-015`, `dr-016`, `comp-context-store`, and the new `dr-019` and `premise-endgame` |

## What was edited, by node

Pass one (items 2, 3, 4 and the drift):

- `inv-no-financial-credential` (new): canonical at `01#refusals`, restated in the
  trust story's "What we never do" and mentioned at `06#pilot-identity`.
- `inv-envelope-bound-detokenise` (new): canonical as a new bullet of DR-008's
  "What this closes off", with DR-008's status recording the confirmation;
  restated at `03#substitutor-interface` (the device-signed confirmation is a
  field of the signed step context and one more ordered check) and at
  `01#envelope-setup`; mentioned in the trust story's promise.
- `flag-pay-under-cap`: the pilot's runtime value, bounce in every market, at
  `03#policy-flags`, `06#pilot-identity` and Table 7.1's identity-acts row; the
  designed cells in Table 3.5 unchanged.
- `premise-why-now`: Table 3.4 gains the Unified Agent Protocol row, verified
  against a new `src-16` on 03.
- `dr-003`: section 1.2 gains the user-abroad clause.
- Drift from batch 0001 fixed: Table 7.1's caption counts its rows and the
  `open-07-19` waiver is gone; "the five masks" is now "the five stream masks"
  (`03#managed-browser`, `02#managed-browser`) and "the five artefact masks"
  (`03#redaction-pipeline`, `02#stages`, Figure 2.4, DR-009).

Pass two (items 1 and 5):

- `dr-018` (new page) with five rejected alternatives; `inv-mail-from-users-own-address`
  and `inv-send-scope-not-a-connector` as its closures, restated at
  `02#mail-relay`, `03#mail-relay` and `01#connectors`. The relay's two routes
  are written into 02 section 4.3 and 03 section 3.3; the classifier in 02
  section 3 reads the send scope as it reads the scope block; "to the task
  address" becomes "on the task's thread" in the eleven sentences where a worker
  asks a party for a masked span (02, 03, 04, the worker console); Table 3.5's
  caption and basis row cover a message in the user's name; Table 3.6 path 3
  names the two inbound routes; 01 sections 3, 5 and 7 and journey 1.6, the
  trust story, the stage 5 gate in 06 and the status notes of DR-001 and DR-016
  follow. `open-07-20` (the providers' send scopes) lands in the relay.
- `dr-019` (new page) with four rejected alternatives; `premise-endgame` as the
  new section 6 of 00; `inv-everyday-same-harness` and
  `inv-data-story-by-record-only` as its closures, restated at `01#taxonomy`
  and `00#endgame-sequence`. 01 gains the everyday-tasks paragraph after Table
  1.1, a line in `refused-not-offered` and a line in learning; 05 section 3, 06
  section 4.2, the trust story and the status notes of DR-015 and DR-016
  follow. `open-07-21` (the data story) lands in the context store and DR-015.
- The footer line on every page is amended to the founder's framing: an AI that
  builds the user's context to do in their personal life what the general
  assistants do, trusted with the high-value, low-volume tasks they dread. The
  masthead tagline is left as the edition's original one-liner.
- The index's sentence naming the founder's decisions had omitted DR-017; it
  now names DR-017 to DR-019.
- Counts: nineteen records, eighteen fixed; Table 7.1 has twenty-one rows;
  the manifest has 31 pages; `vocab-open-items` counts 21.
- Reopened by the batch and confirmed unchanged: DR-001, DR-003, DR-004,
  DR-008, DR-014, DR-015 and DR-016, and ledger bullets 1.2.1 to 1.2.3, 1.3.1
  to 1.3.3, 1.3.6, 1.3.7, 1.7.2, 1.7.3, 1.9.1, 1.9.2 and 1.10.1. `BUILD_BRIEF.md`
  is untouched, as with DR-017: the ledger nodes point at it as source.

## Checks on the edited record

`check --warnings`: clean, 341 nodes, 574 edges, one warning (the
`refused-policy` near-collision, batch 0001 finding 3, still open).
`verify`: clean, 31 pages. `selftest`: clean.

Still open from batch 0001's drift list: 3 (the near-collision), 4 (the
committing-actions list interrupted at `03#substitutor-interface`, carried as a
members check), 5 (the point-of-no-return question absent from 01 and 02) and 6
(DR-010, DR-011 and DR-012 cited from no numbered document).

## Pass one, as the tool returned it before the edit

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

## Pass two, as the tool returned it before the edit

```
batch of 2 changes: mail-as-user, endgame

mail-as-user: seeds comp-mail-relay, dr-001, comp-channel-connector
  reopens dr-001  Channel-agnostic intake gateway; WhatsApp front door amber [amber]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.3  Every execution surface is ours: managed browser, our telephony, our mail relay [fixed]
  reopens ledger-1.6.1  Amber front door over a channel-agnostic intake gateway and one request format [fixed]
  reopens ledger-1.6.2  Amber trigger: resolve when the first US or UK cohort is scoped [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  alternative alt-dr-001-a-whatsapp-native-product  A WhatsApp-native product
  alternative alt-dr-001-a-native-app-only  A native app only
  alternative alt-dr-001-per-channel-intake-built-as  Per-channel intake, built as each channel arrives
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
  open open-07-01  The front door per market (the channel amber)
  open open-07-11  Vault vendor choice
  open open-07-17  Delegation by a family member
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long

endgame: seeds premise-wedge, premise-moat, dr-015, dr-016, comp-context-store
  reopens dr-015  Economics deferred to post-Series A/B [fixed]
  reopens dr-016  The context store as a temporal knowledge graph [fixed]
  reopens ledger-1.10.1  A temporal knowledge graph of facts with source, date, confidence, confirmation [fixed]
  reopens ledger-1.9.1  Economics, pricing and unit costs deferred to post-Series A or B; 05 is a stub [fixed]
  reopens ledger-1.9.2  The thesis carries its argument with no economics in it [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  alternative alt-dr-015-model-the-economics-now  Model the economics now
  alternative alt-dr-015-use-the-flat-fee-players  Use the flat-fee players' prices as a proxy for ours
  alternative alt-dr-015-a-placeholder-model-labelled-illustrative  A placeholder model labelled illustrative
  alternative alt-dr-015-omit-the-business-section-altogether  Omit the business section altogether
  alternative alt-dr-016-a-flat-profile-table  A flat profile table
  alternative alt-dr-016-a-document-store-without-temporal  A document store without temporal validity
  alternative alt-dr-016-the-model-s-memory-as  The model's memory as the profile
  alternative alt-dr-016-a-complete-profile-built-at  A complete profile built at onboarding
  alternative alt-dr-016-real-values-in-the-store  Real values in the store for convenience
  alternative alt-dr-008-build-the-vault-ourselves  Build the vault ourselves
  alternative alt-dr-008-encrypt-fields-in-place-in  Encrypt fields in place in our own database
  alternative alt-dr-008-rely-on-the-rails-own  Rely on the rails' own tokens
  alternative alt-dr-008-choose-the-vendor-now  Choose the vendor now
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  open open-07-11  Vault vendor choice

shared upstream (reopened by two or more changes)
  dr-008  Tokenisation vault bought, not built  (mail-as-user, endgame)
  ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases  (mail-as-user, endgame)
  ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map  (mail-as-user, endgame)

loci: 87 sections on 17 pages; "touched by" counts the changes whose closure reaches the section
   2 of 2  index.html#fatal-one                                         129  A worker sees something they should   fatal-1  (mail-as-user, endgame)
   2 of 2  00-thesis/index.html#what-consequence-means                   64  What consequence means                fatal-1, fatal-2  (mail-as-user, endgame)
   2 of 2  00-thesis/index.html#trust-layer-bought                      154  The trust layer can be bought         comp-vault  (mail-as-user, endgame)
   2 of 2  00-thesis/index.html#markets                                 183  Markets                               premise-india-build-base  (mail-as-user, endgame)
   2 of 2  00-thesis/index.html#india-build-base                        185  India as the build base               premise-india-build-base  (mail-as-user, endgame)
   2 of 2  00-thesis/index.html#moat-made-of                            245  What the moat is made of              comp-envelope, comp-substitutor, inv-alias-only-outside-zone, premise-moat, vocab-moat-properties  (mail-as-user, endgame)
   2 of 2  01-product/index.html#envelope-setup                         197  Set-up at task start                  inv-envelope-bound-detokenise, res-07-02, vocab-committable-acts, vocab-committing-actions, vocab-identity-acts  (mail-as-user, endgame)
   2 of 2  01-product/index.html#refusals                               398  What we refuse to do                  fatal-1, fatal-2  (mail-as-user, endgame)
   2 of 2  02-architecture/index.html#step-catalogue                    277  The step-type catalogue and the act   res-07-02  (mail-as-user, endgame)
   2 of 2  02-architecture/index.html#telephony                         359  Telephony                             res-07-02  (mail-as-user, endgame)
   2 of 2  02-architecture/index.html#hash-service                      775  The hash service                      vocab-detectors, comp-hash-service  (mail-as-user, endgame)
   2 of 2  02-architecture/index.html#context-store                     780  The context store                     res-07-02, comp-context-store  (mail-as-user, endgame)
   2 of 2  02-architecture/index.html#who-reads                         803  Who reads and writes it               vocab-detectors  (mail-as-user, endgame)
   2 of 2  02-architecture/index.html#edge-tokenisation                 812  Tokenisation at the edge              comp-channel-connector, comp-edge-proxy, vocab-detectors  (mail-as-user, endgame)
   2 of 2  03-trust-and-data/index.html#alias-types                      62  Alias types, classes and their polic  comp-vault, inv-missing-row-is-bounce, vocab-alias-classes  (mail-as-user, endgame)
   2 of 2  03-trust-and-data/index.html#entry-routes                     82  Boundary one: the three doors a real  comp-edge-proxy, comp-hash-service  (mail-as-user, endgame)
   2 of 2  03-trust-and-data/index.html#threat-model                    421  The threat model: paths by which a h  fatal-1  (mail-as-user, endgame)
   2 of 2  03-trust-and-data/index.html#table:3.6                       557  Table 3.6                             inv-no-real-value-at-rest, res-07-01  (mail-as-user, endgame)
   2 of 2  04-operations/index.html#need-to-know                         64  Need-to-know and Client 4471          vocab-detectors  (mail-as-user, endgame)
   2 of 2  06-roadmap/index.html#sequence                                60  The harness-first build sequence      fatal-1, fatal-2, inv-approval-needs-authenticated-device, inv-vault-sdk-two-places, stage-5, stage-3  (mail-as-user, endgame)
   2 of 2  06-roadmap/index.html#fig-sequence                            63  Eight stages in a fixed order, each   stage-5, stage-3  (mail-as-user, endgame)
   2 of 2  06-roadmap/index.html#table:6.1                              180  Table 6.1                             comp-envelope, comp-intake-gateway, comp-policy-layer, comp-substitutor, comp-vault, comp-context-store, comp-hash-service, comp-planner  (mail-as-user, endgame)
   2 of 2  decisions/dr-008-vault-bought.html#decision                   61  Decision                              dr-008  (mail-as-user, endgame)
   2 of 2  decisions/dr-008-vault-bought.html#closes-off                 84  What this closes off                  inv-envelope-bound-detokenise, inv-no-raw-byte-in-our-process, inv-no-real-value-at-rest, inv-region-per-market, inv-vault-sdk-two-places  (mail-as-user, endgame)
   2 of 2  decisions/dr-016-context-store.html#decision                  61  Decision                              vocab-detectors, comp-context-store, dr-016  (mail-as-user, endgame)
   2 of 2  decisions/index.html#ledger                                   60  The ledger                            dr-001, dr-003, dr-004, dr-008, dr-014, dr-015, dr-016  (mail-as-user, endgame)
   1 of 2  index.html#fatal-two                                         131  An irreversible act the user did not  fatal-2  (mail-as-user)
   1 of 2  00-thesis/index.html#customer-and-wedge                       60  Customer and wedge                    premise-wedge  (endgame)
   1 of 2  00-thesis/index.html#why-now                                 146  Why now                               premise-why-now  (mail-as-user)
   1 of 2  00-thesis/index.html#moat                                    239  The moat                              premise-moat  (endgame)
   1 of 2  00-thesis/index.html#flat-fee-stops                          241  Why the flat-fee model stops at the   premise-wedge  (endgame)
   1 of 2  00-thesis/index.html#moat-is-not                             258  What the moat is not                  premise-moat  (endgame)
   1 of 2  01-product/index.html#journey-family                         117  Family affairs: a parent's repeat pr  res-07-05, res-07-08  (mail-as-user)
   1 of 2  01-product/index.html#intake                                 169  Intake and the channel-agnostic gate  comp-intake-gateway  (mail-as-user)
   1 of 2  01-product/index.html#envelope                               193  The authority envelope from the user  comp-approval-token, comp-envelope  (mail-as-user)
   1 of 2  01-product/index.html#envelope-edits                         210  Edits mid-task: extend and narrow     res-07-03  (mail-as-user)
   1 of 2  01-product/index.html#learning                               375  Learning as a by-product of tasks     comp-context-store  (endgame)
   1 of 2  02-architecture/index.html#overview                           60  Overview                              inv-alias-only-outside-zone  (mail-as-user)
   1 of 2  02-architecture/index.html#fig-components                     63  One component can detokenise, the va  comp-substitutor  (mail-as-user)
   1 of 2  02-architecture/index.html#planner                           176  The planner                           comp-planner  (endgame)
   1 of 2  02-architecture/index.html#class-selection                   226  Choosing between the three classes    comp-policy-layer  (mail-as-user)
   1 of 2  02-architecture/index.html#step-record                       231  The step record                       res-07-16  (mail-as-user)
   1 of 2  02-architecture/index.html#table:2.5                         280  Table 2.5                             vocab-committable-acts, vocab-identity-acts  (mail-as-user)
   1 of 2  02-architecture/index.html#table:2.6                         301  Table 2.6                             res-07-05, vocab-alias-classes  (mail-as-user)
   1 of 2  02-architecture/index.html#table:2.7                         334  Table 2.7                             res-07-08  (mail-as-user)
   1 of 2  02-architecture/index.html#ai-executor                       347  The ai executor                       res-07-05  (mail-as-user)
   1 of 2  02-architecture/index.html#mail-relay                        363  The mail relay                        comp-mail-relay  (mail-as-user)
   1 of 2  02-architecture/index.html#surface-controllers               366  The surface controllers and the step  comp-surface-controllers, res-07-03, res-07-05, res-07-08, vocab-committing-actions  (mail-as-user)
   1 of 2  02-architecture/index.html#step-context                      369  The signed step context               comp-step-context, res-07-03  (mail-as-user)
   1 of 2  02-architecture/index.html#timers                            508  Timers, nudges and the watchdog       res-07-04  (mail-as-user)
   1 of 2  02-architecture/index.html#table:2.8                         511  Table 2.8                             res-07-04  (mail-as-user)
   1 of 2  02-architecture/index.html#step-states                       531  Step states and the event log         res-07-15, vocab-committing-actions  (mail-as-user)
   1 of 2  02-architecture/index.html#closing                           653  Closing a step                        comp-fired-marker, res-07-04  (mail-as-user)
   1 of 2  02-architecture/index.html#dual-control-mechanics            670  Dual control                          comp-approval-token  (mail-as-user)
   1 of 2  02-architecture/index.html#envelope-record                   673  The envelope record and the ledger e  comp-envelope, res-07-16  (mail-as-user)
   1 of 2  02-architecture/index.html#intake-gateway                    810  The intake gateway                    comp-intake-gateway  (mail-as-user)
   1 of 2  02-architecture/worker-console.html#alias-only               139  The alias-only rule                   inv-alias-only-outside-zone  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#table:3.1                        65  Table 3.1                             res-07-01  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#substitution                    194  The substitution component            comp-substitutor  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#substitutor-interface           196  Boundary three: the interface and th  comp-step-context, comp-surface-controllers, inv-envelope-bound-detokenise, res-07-03, vocab-committing-actions  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#managed-browser                 305  The managed browser                   res-07-08  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#telephony                       308  Telephony                             res-07-01, vocab-committing-actions  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#mail-relay                      310  The mail relay                        comp-mail-relay  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#table:3.4                       368  Table 3.4                             premise-why-now  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#policy-flags                    397  The policy flag table and the lobbyi  comp-policy-layer  (mail-as-user)
   1 of 2  03-trust-and-data/index.html#table:3.5                       400  Table 3.5                             vocab-identity-acts  (mail-as-user)
   1 of 2  03-trust-and-data/trust-story.html#promise                    60  The promise                           inv-envelope-bound-detokenise  (mail-as-user)
   1 of 2  04-operations/index.html#card-generation                      62  How a card is generated               res-07-01  (mail-as-user)
   1 of 2  04-operations/index.html#card-script                          83  The script and the result             res-07-16  (mail-as-user)
   1 of 2  04-operations/index.html#handover                            204  The three shifts and the handover     res-07-04  (mail-as-user)
   1 of 2  04-operations/index.html#three-tiers                         222  The three tiers                       vocab-identity-acts  (mail-as-user)
   1 of 2  04-operations/index.html#dual-control                        302  Dual control on the floor             comp-fired-marker, res-07-04, res-07-08, res-07-15, vocab-committing-actions  (mail-as-user)
   1 of 2  decisions/dr-001-channel-gateway.html#decision                61  Decision                              dr-001  (mail-as-user)
   1 of 2  decisions/dr-001-channel-gateway.html#closes-off              83  What this closes off                  inv-approval-needs-authenticated-device, inv-no-channel-branch, inv-one-request-format  (mail-as-user)
   1 of 2  decisions/dr-003-full-delegation-ceiling.html#decision        61  Decision                              dr-003  (mail-as-user)
   1 of 2  decisions/dr-003-full-delegation-ceiling.html#ceiling         63  The ceiling                           vocab-identity-acts  (mail-as-user)
   1 of 2  decisions/dr-003-full-delegation-ceiling.html#policy-layer    65  The policy layer                      comp-policy-layer, inv-missing-row-is-bounce  (mail-as-user)
   1 of 2  decisions/dr-003-full-delegation-ceiling.html#closes-off      85  What this closes off                  inv-flag-filters-envelope, inv-missing-row-is-bounce, inv-no-design-constraint-from-jurisdiction  (mail-as-user)
   1 of 2  decisions/dr-004-authority-envelope.html#decision             61  Decision                              dr-004  (mail-as-user)
   1 of 2  decisions/dr-004-authority-envelope.html#fields               63  The five fields                       vocab-committable-acts, vocab-committing-actions  (mail-as-user)
   1 of 2  decisions/dr-004-authority-envelope.html#test                 76  The test and the rule                 comp-approval-token, comp-fired-marker, res-07-05, res-07-08, vocab-committing-actions  (mail-as-user)
   1 of 2  decisions/dr-004-authority-envelope.html#closes-off           97  What this closes off                  inv-no-step-before-envelope, inv-nothing-past-validity-window, res-07-04  (mail-as-user)
   1 of 2  decisions/dr-008-vault-bought.html#not-delegated              65  What buying does not delegate         comp-channel-connector, comp-edge-proxy  (mail-as-user)
   1 of 2  decisions/dr-014-substitution-framing.html#decision           61  Decision                              dr-014  (mail-as-user)
   1 of 2  decisions/dr-015-economics-deferred.html#decision             61  Decision                              dr-015  (endgame)
   1 of 2  decisions/dr-015-economics-deferred.html#closes-off           82  What this closes off                  inv-no-economics-anywhere  (endgame)
   1 of 2  decisions/dr-016-context-store.html#closes-off                86  What this closes off                  inv-connectors-read-only, inv-fact-provenance, inv-no-real-value-in-store  (endgame)
```

## The whole batch, as the tool returned it after both passes

The new records, invariants and premise were added to their changes' seeds, so
the closure now carries the loci that restate them.

```
batch of 5 changes: bank-reading-b, custody-key-release, geography-abroad, mail-as-user, endgame

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
  open open-07-20  Mail providers' delegated send scope

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

mail-as-user: seeds comp-mail-relay, dr-001, comp-channel-connector, dr-018
  reopens dr-001  Channel-agnostic intake gateway; WhatsApp front door amber [amber]
  reopens dr-018  Mail sent from the user's own address [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.3  Every execution surface is ours: managed browser, our telephony, our mail relay [fixed]
  reopens ledger-1.6.1  Amber front door over a channel-agnostic intake gateway and one request format [fixed]
  reopens ledger-1.6.2  Amber trigger: resolve when the first US or UK cohort is scoped [fixed]
  reopens dr-014  The substitution framing: boundary sequence over ledger spine [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary [fixed]
  reopens ledger-1.7.2  Universal core, one build, country-agnostic [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  reopens dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags [fixed]
  reopens dr-004  The authority envelope and the point-of-no-return test [fixed]
  reopens ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime [fixed]
  reopens ledger-1.2.2  The per-country flag table doubles as the lobbying agenda [fixed]
  reopens ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints [fixed]
  reopens ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside [fixed]
  reopens ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control [fixed]
  alternative alt-dr-001-a-whatsapp-native-product  A WhatsApp-native product
  alternative alt-dr-001-a-native-app-only  A native app only
  alternative alt-dr-001-per-channel-intake-built-as  Per-channel intake, built as each channel arrives
  alternative alt-dr-018-a-per-task-address-at  A per-task address at our domain
  alternative alt-dr-018-an-ai-fred-mailbox-per  An AI.fred mailbox per user
  alternative alt-dr-018-forwarding-rules-in-the-user  Forwarding rules in the user's mailbox
  alternative alt-dr-018-the-user-s-mail-credentials  The user's mail credentials held by us
  alternative alt-dr-018-a-bounce-with-no-draft  A bounce with no draft
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
  open open-07-20  Mail providers' delegated send scope
  open open-07-01  The front door per market (the channel amber)
  open open-07-11  Vault vendor choice
  open open-07-17  Delegation by a family member
  open open-07-04  Legal to-verifies: the KYC last mile and every flag-table row
  open open-07-18  Identity acts outside India: the ceiling against the pilot flag
  open obj-07-a  Objection A: the lobbying agenda for identity acts is long

endgame: seeds premise-wedge, premise-moat, dr-015, dr-016, comp-context-store, dr-019, premise-endgame
  reopens dr-015  Economics deferred to post-Series A/B [fixed]
  reopens dr-016  The context store as a temporal knowledge graph [fixed]
  reopens dr-019  The endgame: first port of call for everything personal [fixed]
  reopens ledger-1.10.1  A temporal knowledge graph of facts with source, date, confidence, confirmation [fixed]
  reopens ledger-1.9.1  Economics, pricing and unit costs deferred to post-Series A or B; 05 is a stub [fixed]
  reopens ledger-1.9.2  The thesis carries its argument with no economics in it [fixed]
  reopens dr-008  Tokenisation vault bought, not built [fixed]
  reopens ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases [fixed]
  reopens ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map [fixed]
  alternative alt-dr-015-model-the-economics-now  Model the economics now
  alternative alt-dr-015-use-the-flat-fee-players  Use the flat-fee players' prices as a proxy for ours
  alternative alt-dr-015-a-placeholder-model-labelled-illustrative  A placeholder model labelled illustrative
  alternative alt-dr-015-omit-the-business-section-altogether  Omit the business section altogether
  alternative alt-dr-016-a-flat-profile-table  A flat profile table
  alternative alt-dr-016-a-document-store-without-temporal  A document store without temporal validity
  alternative alt-dr-016-the-model-s-memory-as  The model's memory as the profile
  alternative alt-dr-016-a-complete-profile-built-at  A complete profile built at onboarding
  alternative alt-dr-016-real-values-in-the-store  Real values in the store for convenience
  alternative alt-dr-019-staying-a-high-consequence-specialist  Staying a high-consequence specialist
  alternative alt-dr-019-launching-as-a-general-assistant  Launching as a general assistant first
  alternative alt-dr-019-deciding-the-data-story-now  Deciding the data story now, either way
  alternative alt-dr-019-a-separate-everyday-product-or  A separate everyday product or brand
  alternative alt-dr-008-build-the-vault-ourselves  Build the vault ourselves
  alternative alt-dr-008-encrypt-fields-in-place-in  Encrypt fields in place in our own database
  alternative alt-dr-008-rely-on-the-rails-own  Rely on the rails' own tokens
  alternative alt-dr-008-choose-the-vendor-now  Choose the vendor now
  residual res-07-02  A contactable person's name and number sit in clear in the party directory
  open open-07-21  The data story: the context store's worth beyond the user's own tasks
  open open-07-11  Vault vendor choice

shared upstream (reopened by two or more changes)
  dr-003  Full delegation as the capability ceiling, with per-jurisdiction policy flags  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
  ledger-1.2.1  Full delegation is the ceiling, a per-jurisdiction policy layer flags at runtime  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
  ledger-1.2.2  The per-country flag table doubles as the lobbying agenda  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
  ledger-1.2.3  KYC constraints per country are to-verify legal items, not design constraints  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
  dr-008  Tokenisation vault bought, not built  (custody-key-release, mail-as-user, endgame)
  ledger-1.3.1  Sensitive values live in a bought tokenisation vault, all else handles aliases  (custody-key-release, mail-as-user, endgame)
  ledger-1.7.3  Per country: passport adapters, a legal pack and a data-residency map  (custody-key-release, mail-as-user, endgame)
  dr-004  The authority envelope and the point-of-no-return test  (custody-key-release, mail-as-user)
  dr-014  The substitution framing: boundary sequence over ledger spine  (custody-key-release, mail-as-user)
  ledger-1.3.2  One isolated substitution component swaps the value in at the last boundary  (custody-key-release, mail-as-user)
  ledger-1.7.2  Universal core, one build, country-agnostic  (custody-key-release, mail-as-user)
  ledger-1.3.6  An authority envelope per task: delegation total within it, impossible outside  (custody-key-release, mail-as-user)
  ledger-1.3.7  Every step meets the point-of-no-return test: bounce or dual control  (custody-key-release, mail-as-user)

loci: 120 sections on 22 pages; "touched by" counts the changes whose closure reaches the section
   5 of 5  01-product/index.html#refusals                               399  What we refuse to do                  fatal-2, inv-no-financial-credential, vocab-refusal-codes, fatal-1, inv-otp-never-ours, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user, endgame)
   5 of 5  03-trust-and-data/index.html#alias-types                      62  Alias types, classes and their polic  inv-missing-row-is-bounce, comp-vault, vocab-alias-classes  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user, endgame)
   5 of 5  06-roadmap/index.html#table:6.1                              180  Table 6.1                             comp-adapters, comp-policy-layer, comp-task-service, comp-access-ledger, comp-classifier, comp-device-surface, comp-envelope, comp-hash-service, comp-managed-browser, comp-planner, comp-substitutor, comp-task-cards, comp-telephony, comp-vault, comp-intake-gateway, comp-context-store  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user, endgame)
   5 of 5  decisions/index.html#ledger                                   60  The ledger                            dr-003, dr-004, dr-008, dr-014, dr-001, dr-018, dr-015, dr-016, dr-019  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user, endgame)
   4 of 5  00-thesis/index.html#what-consequence-means                   64  What consequence means                fatal-2, fatal-1  (bank-reading-b, custody-key-release, mail-as-user, endgame)
   4 of 5  00-thesis/index.html#why-now                                 146  Why now                               premise-why-now  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   4 of 5  01-product/index.html#envelope-setup                         198  Set-up at task start                  inv-envelope-bound-detokenise, res-07-02, vocab-committable-acts, vocab-committing-actions, vocab-identity-acts  (custody-key-release, geography-abroad, mail-as-user, endgame)
   4 of 5  02-architecture/index.html#class-selection                   226  Choosing between the three classes    comp-policy-layer, res-07-14, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   4 of 5  03-trust-and-data/index.html#table:3.4                       368  Table 3.4                             premise-why-now  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   4 of 5  03-trust-and-data/index.html#policy-flags                    397  The policy flag table and the lobbyi  comp-policy-layer, flag-pay-under-cap, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   4 of 5  03-trust-and-data/index.html#table:3.5                       400  Table 3.5                             flag-pay-under-cap, res-07-14, vocab-identity-acts, flag-answer-security-questions, flag-attest-fact, flag-basis-speak-as-customer, flag-book-or-cancel, flag-complete-kyc-form, flag-present-document, flag-share-health-record, flag-sign, flag-state-identity-number, flag-undergo-identification, flag-use-delegated-login  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   4 of 5  06-roadmap/index.html#sequence                                60  The harness-first build sequence      fatal-2, fatal-1, inv-vault-sdk-two-places, stage-1, stage-2, inv-approval-needs-authenticated-device, stage-5, stage-3  (bank-reading-b, custody-key-release, mail-as-user, endgame)
   4 of 5  decisions/dr-003-full-delegation-ceiling.html#decision        61  Decision                              dr-003  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   4 of 5  decisions/dr-003-full-delegation-ceiling.html#policy-layer    65  The policy layer                      comp-policy-layer, inv-missing-row-is-bounce, vocab-flag-values  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   4 of 5  decisions/dr-003-full-delegation-ceiling.html#closes-off      85  What this closes off                  inv-flag-filters-envelope, inv-missing-row-is-bounce, inv-no-design-constraint-from-jurisdiction, inv-otp-never-ours  (bank-reading-b, custody-key-release, geography-abroad, mail-as-user)
   3 of 5  index.html#fatal-one                                         129  A worker sees something they should   fatal-1  (custody-key-release, mail-as-user, endgame)
   3 of 5  index.html#fatal-two                                         131  An irreversible act the user did not  fatal-2  (bank-reading-b, custody-key-release, mail-as-user)
   3 of 5  00-thesis/index.html#trust-layer-bought                      154  The trust layer can be bought         comp-vault  (custody-key-release, mail-as-user, endgame)
   3 of 5  00-thesis/index.html#markets                                 183  Markets                               premise-india-build-base  (custody-key-release, mail-as-user, endgame)
   3 of 5  00-thesis/index.html#india-build-base                        185  India as the build base               premise-india-build-base  (custody-key-release, mail-as-user, endgame)
   3 of 5  00-thesis/index.html#moat-made-of                            245  What the moat is made of              comp-access-ledger, comp-envelope, comp-substitutor, inv-alias-only-outside-zone, premise-moat, vocab-moat-properties  (custody-key-release, mail-as-user, endgame)
   3 of 5  02-architecture/index.html#step-catalogue                    277  The step-type catalogue and the act   res-07-02  (custody-key-release, mail-as-user, endgame)
   3 of 5  02-architecture/index.html#table:2.5                         280  Table 2.5                             vocab-committable-acts, vocab-identity-acts  (custody-key-release, geography-abroad, mail-as-user)
   3 of 5  02-architecture/index.html#telephony                         359  Telephony                             comp-telephony, res-07-02, res-07-07  (custody-key-release, mail-as-user, endgame)
   3 of 5  02-architecture/index.html#surface-controllers               366  The surface controllers and the step  comp-task-service, comp-surface-controllers, res-07-03, res-07-05, res-07-08, vocab-committing-actions  (bank-reading-b, custody-key-release, mail-as-user)
   3 of 5  02-architecture/index.html#timers                            508  Timers, nudges and the watchdog       comp-task-service, res-07-04  (bank-reading-b, custody-key-release, mail-as-user)
   3 of 5  02-architecture/index.html#hash-service                      775  The hash service                      comp-hash-service, vocab-detectors, vocab-doors  (custody-key-release, mail-as-user, endgame)
   3 of 5  02-architecture/index.html#context-store                     780  The context store                     res-07-02, comp-context-store  (custody-key-release, mail-as-user, endgame)
   3 of 5  02-architecture/index.html#who-reads                         803  Who reads and writes it               vocab-detectors  (custody-key-release, mail-as-user, endgame)
   3 of 5  02-architecture/index.html#edge-tokenisation                 812  Tokenisation at the edge              comp-channel-connector, comp-edge-proxy, vocab-detectors, vocab-doors  (custody-key-release, mail-as-user, endgame)
   3 of 5  03-trust-and-data/index.html#table:3.1                        65  Table 3.1                             res-07-01, inv-otp-never-ours  (custody-key-release, geography-abroad, mail-as-user)
   3 of 5  03-trust-and-data/index.html#entry-routes                     82  Boundary one: the three doors a real  comp-edge-proxy, comp-hash-service, vocab-doors  (custody-key-release, mail-as-user, endgame)
   3 of 5  03-trust-and-data/index.html#mail-relay                      310  The mail relay                        comp-mail-relay, flag-basis-speak-as-customer, inv-mail-from-users-own-address  (custody-key-release, geography-abroad, mail-as-user)
   3 of 5  03-trust-and-data/index.html#threat-model                    421  The threat model: paths by which a h  comp-threat-model, fatal-1  (custody-key-release, mail-as-user, endgame)
   3 of 5  03-trust-and-data/index.html#table:3.6                       557  Table 3.6                             inv-no-real-value-at-rest, res-07-01  (custody-key-release, mail-as-user, endgame)
   3 of 5  04-operations/index.html#need-to-know                         64  Need-to-know and Client 4471          vocab-detectors  (custody-key-release, mail-as-user, endgame)
   3 of 5  04-operations/index.html#three-tiers                         222  The three tiers                       vocab-identity-acts  (custody-key-release, geography-abroad, mail-as-user)
   3 of 5  06-roadmap/index.html#fig-sequence                            63  Eight stages in a fixed order, each   stage-1, stage-2, stage-5, stage-3  (custody-key-release, mail-as-user, endgame)
   3 of 5  06-roadmap/index.html#expansion-legal                        219  The legal pack                        comp-legal-pack, vocab-flag-values, inv-everyday-same-harness  (bank-reading-b, geography-abroad, endgame)
   3 of 5  07-open/index.html#items                                      60  Every open item, with an owner and a  flag-pay-under-cap, res-07-14, inv-data-story-by-record-only  (bank-reading-b, geography-abroad, endgame)
   3 of 5  decisions/dr-003-full-delegation-ceiling.html#ceiling         63  The ceiling                           vocab-identity-acts, inv-otp-never-ours  (custody-key-release, geography-abroad, mail-as-user)
   3 of 5  decisions/dr-008-vault-bought.html#decision                   61  Decision                              dr-008  (custody-key-release, mail-as-user, endgame)
   3 of 5  decisions/dr-008-vault-bought.html#closes-off                 84  What this closes off                  inv-envelope-bound-detokenise, inv-no-raw-byte-in-our-process, inv-no-real-value-at-rest, inv-region-per-market, inv-vault-sdk-two-places  (custody-key-release, mail-as-user, endgame)
   3 of 5  decisions/dr-016-context-store.html#decision                  61  Decision                              vocab-detectors, comp-context-store, dr-016  (custody-key-release, mail-as-user, endgame)
   2 of 5  01-product/index.html#journey-family                         117  Family affairs: a parent's repeat pr  res-07-05, res-07-08  (custody-key-release, mail-as-user)
   2 of 5  01-product/index.html#envelope                               194  The authority envelope from the user  comp-approval-token, comp-envelope  (custody-key-release, mail-as-user)
   2 of 5  01-product/index.html#envelope-edits                         211  Edits mid-task: extend and narrow     comp-classifier, res-07-03  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#overview                           60  Overview                              inv-alias-only-outside-zone  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#fig-components                     63  One component can detokenise, the va  comp-substitutor  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#planner                           176  The planner                           comp-planner  (custody-key-release, endgame)
   2 of 5  02-architecture/index.html#classifier                        211  The classifier                        comp-classifier, inv-send-scope-not-a-connector  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#step-record                       231  The step record                       res-07-07, res-07-16  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#table:2.6                         301  Table 2.6                             res-07-05, vocab-alias-classes  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#table:2.7                         334  Table 2.7                             res-07-08  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#ai-executor                       347  The ai executor                       res-07-05  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#mail-relay                        363  The mail relay                        comp-mail-relay, inv-mail-from-users-own-address  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#step-context                      369  The signed step context               comp-step-context, res-07-03  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#table:2.8                         511  Table 2.8                             res-07-04  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#step-states                       531  Step states and the event log         res-07-15, vocab-committing-actions  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#closing                           653  Closing a step                        comp-fired-marker, res-07-04  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#dual-control-mechanics            670  Dual control                          comp-approval-token  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/index.html#envelope-record                   673  The envelope record and the ledger e  comp-access-ledger, comp-envelope, res-07-16  (custody-key-release, mail-as-user)
   2 of 5  02-architecture/worker-console.html#alias-only               139  The alias-only rule                   inv-alias-only-outside-zone  (custody-key-release, mail-as-user)
   2 of 5  03-trust-and-data/index.html#substitution                    194  The substitution component            comp-substitutor  (custody-key-release, mail-as-user)
   2 of 5  03-trust-and-data/index.html#substitutor-interface           196  Boundary three: the interface and th  comp-step-context, comp-surface-controllers, inv-envelope-bound-detokenise, res-07-03, vocab-committing-actions  (custody-key-release, mail-as-user)
   2 of 5  03-trust-and-data/index.html#managed-browser                 305  The managed browser                   comp-managed-browser, res-07-08  (custody-key-release, mail-as-user)
   2 of 5  03-trust-and-data/index.html#telephony                       308  Telephony                             comp-telephony, res-07-01, res-07-07, vocab-committing-actions  (custody-key-release, mail-as-user)
   2 of 5  03-trust-and-data/trust-story.html#promise                    60  The promise                           inv-envelope-bound-detokenise, inv-mail-from-users-own-address  (custody-key-release, mail-as-user)
   2 of 5  03-trust-and-data/trust-story.html#what-we-never-do          125  What we never do                      inv-no-financial-credential  (bank-reading-b, geography-abroad)
   2 of 5  04-operations/index.html#card-generation                      62  How a card is generated               comp-task-cards, res-07-01  (custody-key-release, mail-as-user)
   2 of 5  04-operations/index.html#card-script                          83  The script and the result             res-07-07, res-07-16  (custody-key-release, mail-as-user)
   2 of 5  04-operations/index.html#handover                            204  The three shifts and the handover     res-07-04  (custody-key-release, mail-as-user)
   2 of 5  04-operations/index.html#dual-control                        302  Dual control on the floor             comp-fired-marker, res-07-04, res-07-08, res-07-15, vocab-committing-actions  (custody-key-release, mail-as-user)
   2 of 5  06-roadmap/index.html#pilot-identity                         168  Delegated identity acts               flag-pay-under-cap, inv-no-financial-credential, vocab-flag-values  (bank-reading-b, geography-abroad)
   2 of 5  07-open/index.html#objections                                107  Objections formed against fixed deci  res-07-14  (bank-reading-b, geography-abroad)
   2 of 5  decisions/dr-004-authority-envelope.html#decision             61  Decision                              dr-004  (custody-key-release, mail-as-user)
   2 of 5  decisions/dr-004-authority-envelope.html#fields               63  The five fields                       vocab-committable-acts, vocab-committing-actions  (custody-key-release, mail-as-user)
   2 of 5  decisions/dr-004-authority-envelope.html#test                 76  The test and the rule                 comp-approval-token, comp-fired-marker, res-07-05, res-07-07, res-07-08, vocab-committing-actions  (custody-key-release, mail-as-user)
   2 of 5  decisions/dr-004-authority-envelope.html#closes-off           97  What this closes off                  inv-no-step-before-envelope, inv-nothing-past-validity-window, res-07-04  (custody-key-release, mail-as-user)
   2 of 5  decisions/dr-008-vault-bought.html#not-delegated              65  What buying does not delegate         comp-channel-connector, comp-edge-proxy  (custody-key-release, mail-as-user)
   2 of 5  decisions/dr-014-substitution-framing.html#decision           61  Decision                              dr-014  (custody-key-release, mail-as-user)
   1 of 5  index.html#promise                                            61  The promise                           premise-endgame  (endgame)
   1 of 5  00-thesis/index.html#customer-and-wedge                       60  Customer and wedge                    premise-endgame, premise-wedge  (endgame)
   1 of 5  00-thesis/index.html#how-we-cross-it                         135  How we cross it                       comp-threat-model  (custody-key-release)
   1 of 5  00-thesis/index.html#us-uk-commercial                        187  The US and the UK as commercial grou  inv-otp-never-ours  (geography-abroad)
   1 of 5  00-thesis/index.html#one-core                                189  One core, three adapters              comp-adapters  (bank-reading-b)
   1 of 5  00-thesis/index.html#moat                                    239  The moat                              premise-moat  (endgame)
   1 of 5  00-thesis/index.html#flat-fee-stops                          241  Why the flat-fee model stops at the   premise-wedge  (endgame)
   1 of 5  00-thesis/index.html#moat-is-not                             258  What the moat is not                  premise-moat  (endgame)
   1 of 5  00-thesis/index.html#endgame                                 263  The endgame                           premise-endgame  (endgame)
   1 of 5  00-thesis/index.html#endgame-sequence                        265  The everyday tasks on the same harne  inv-everyday-same-harness  (endgame)
   1 of 5  00-thesis/index.html#endgame-upside                          269  The upside, left open                 inv-data-story-by-record-only  (endgame)
   1 of 5  01-product/index.html#journey-health                         105  Health and medical: a specialist app  res-07-07  (custody-key-release)
   1 of 5  01-product/index.html#taxonomy                               143  The task taxonomy                     inv-everyday-same-harness  (endgame)
   1 of 5  01-product/index.html#intake                                 170  Intake and the channel-agnostic gate  comp-intake-gateway  (mail-as-user)
   1 of 5  01-product/index.html#connectors                             366  Read-only connectors the user choose  inv-send-scope-not-a-connector  (mail-as-user)
   1 of 5  01-product/index.html#learning                               376  Learning as a by-product of tasks     comp-context-store  (endgame)
   1 of 5  02-architecture/index.html#managed-browser                   354  The managed browser                   comp-managed-browser  (custody-key-release)
   1 of 5  02-architecture/index.html#device-surface                    371  The device surface                    comp-device-surface  (custody-key-release)
   1 of 5  02-architecture/index.html#adapters                          570  The market adapter model              comp-adapters  (bank-reading-b)
   1 of 5  02-architecture/index.html#legal-pack                        646  The legal pack and the shift          comp-legal-pack, vocab-refusal-codes  (bank-reading-b)
   1 of 5  02-architecture/index.html#intake-gateway                    810  The intake gateway                    comp-intake-gateway  (mail-as-user)
   1 of 5  02-architecture/worker-console.html#task-card                 60  The task card                         comp-task-cards  (custody-key-release)
   1 of 5  03-trust-and-data/index.html#passports                       357  The passports                         comp-adapters  (bank-reading-b)
   1 of 5  03-trust-and-data/index.html#bounce-back                     359  The universal device bounce-back      comp-device-surface  (custody-key-release)
   1 of 5  03-trust-and-data/index.html#access-ledger                   592  The access ledger                     comp-access-ledger  (custody-key-release)
   1 of 5  03-trust-and-data/trust-story.html#ledger-example            114  What your ledger looks like           comp-access-ledger  (custody-key-release)
   1 of 5  04-operations/index.html#task-cards                           60  Task cards and pseudonymisation       comp-task-cards  (custody-key-release)
   1 of 5  05-business/index.html#when-it-reopens                        70  What will be needed when it reopens   inv-data-story-by-record-only  (endgame)
   1 of 5  decisions/dr-001-channel-gateway.html#decision                61  Decision                              dr-001  (mail-as-user)
   1 of 5  decisions/dr-001-channel-gateway.html#closes-off              83  What this closes off                  inv-approval-needs-authenticated-device, inv-no-channel-branch, inv-one-request-format  (mail-as-user)
   1 of 5  decisions/dr-007-universal-core-adapters.html#legal-pack      68  The legal pack and the residency map  comp-legal-pack  (bank-reading-b)
   1 of 5  decisions/dr-015-economics-deferred.html#decision             61  Decision                              dr-015  (endgame)
   1 of 5  decisions/dr-015-economics-deferred.html#closes-off           82  What this closes off                  inv-no-economics-anywhere  (endgame)
   1 of 5  decisions/dr-016-context-store.html#closes-off                86  What this closes off                  inv-connectors-read-only, inv-fact-provenance, inv-no-real-value-in-store  (endgame)
   1 of 5  decisions/dr-016-context-store.html#record-status             98  Status                                inv-send-scope-not-a-connector  (mail-as-user)
   1 of 5  decisions/dr-018-mail-from-the-users-address.html#decision    61  Decision                              dr-018  (mail-as-user)
   1 of 5  decisions/dr-018-mail-from-the-users-address.html#closes-off    90  What this closes off                  inv-mail-from-users-own-address, inv-send-scope-not-a-connector  (mail-as-user)
   1 of 5  decisions/dr-019-the-endgame.html#decision                    61  Decision                              dr-019  (endgame)
   1 of 5  decisions/dr-019-the-endgame.html#closes-off                  86  What this closes off                  inv-data-story-by-record-only, inv-everyday-same-harness  (endgame)
```
