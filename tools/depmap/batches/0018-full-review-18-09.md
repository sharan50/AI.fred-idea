# Batch 0018: Full Review 18/09

Recorded 2026-09-18. A second partner-level review of the record, written
against the edition of 15 September 2026 (commit 7f2f6d9, merged as fa2aaa8
on 17 September) after the revision of 13 September answered the review of
11 September. Like batch 0005 it is a review of the record and not a revision
of it: it takes no decision and edits no page of the record, so the map's
nodes and edges are unchanged. It is recorded here because it names the
changes it asks the record to make, and those are the founder's to decide,
one batch at a time.

## What the review is

`docs/08-review/full-review-18-09.html`: eighteen sections, eight figures in
the record's diagram language (8.19 to 8.26, continuing the section's
numbering), fourteen tables (8.13 to 8.26) and 113 sources. The spine is the
brief's: the verdict, the idea at its strongest, the technology today, the
horizon, the regulatory position in India, the United Kingdom and the United
States, the market and the comparables, the economics, the team, a red-team
read, product and go-to-market, a ranked pre-mortem, the gates, the questions
for the founder, and what the record should change. One section is added and
says why: what changed since 11 September, and what the change costs, because
a reader who cannot tell which of the first review's findings were answered in
substance, which in wording and which stand will misjudge the rest. A closing
section is the evidence ledger.

Its verdict is "not yet", again, with the conditions under which the
India-only company the first review described would be funded, and a
falsifiable statement of what would prove the verdict wrong by 31 December
2026.

Its evidence carries the record's chips under a stricter reading than the
record's own DR-013: `verified` only where a primary text was read in full or
in its operative part, through a dated mirror where the regulator's own host
was blocked, and the source entry says which mirror; `to-verify` where a
claim was seen as an excerpt, in a secondary source, or is a vendor's claim
about itself; `[EST]` where a number is the review's own, with the inputs
named. The counts are in its section 18: 103 verified, 192 to-verify, 34
estimates. The page status is `to-verify` by the ordinary precedence.

## What the review asks the record to change

The review's Table 8.26 lists fourteen changes by page and marks each as
wording or substance. The ones that touch a fixed decision or a mapped
component are named here so the next batch can seed the map from them:

| Recommendation | Nodes it would reopen |
|----------------|-----------------------|
| Make the United Kingdom a demand test inside the seed and an entity only after the Indian gates; re-strike the 400 and 600 gates against a rostered shift and the scaled standing cost | `dr-023`, the geography section of 05 |
| Choose the plan of record; re-base 05 on the net-of-tax run; add step terms for the floor, the entity and the night crew; retire the $1,291 figure | `dr-015`, `dr-024`, `dr-025`, the model page |
| Say that the hash service holds every vault value at every refresh, or move the digest computation into the vault and add it to DR-008's tests | `dr-008`, `comp-hash-service`, `comp-vault` |
| Redraw the bought boundary: a venture-owned detector ingress in front of a bought key-value vault, since no vendor sells the tokenising proxy with the customer's detectors in region | `dr-008`, `comp-edge-proxy`, `comp-vault` |
| Add an attacker-centric table beside Table 3.6 and an injection gate with a residual rate beside the canary | the threat model of 03, `comp-ai-executor` |
| Give a reversible call step a fired marker and a quoted fee a comparator | `dr-021`, `comp-fired-marker`, `comp-substitutor` |
| Reword the basis row "speak to an institution as the customer" to "on behalf of", since the personation, pretexting and fraud statutes read turn on that word | `flag-basis-speak-as-customer` |
| Correct the Regulation E claim: 12 CFR 1005.2(m)(1) is a rule for a standing authorisation and it runs against the user | the US rows of 03 |
| Move NPCI's Unified Agent Protocol from why-now to the horizon and date it "none"; add the closed-group, merchant-only and PSP-onboarding conditions of UPI Circle's software profiles | the why-now table of 00, the India rows of 03 |
| Add the UK licence lines (immigration advice, claims management, the Article 27 representative, Ofcom's rule on overseas calls) and India's card-storage rule and consent-manager conditions | the UK and India rows of 03, `dr-018` for the mail route |
| State the pilot's product as the journeys count it; add an assisted binding and a proxy binder for a dependant | `comp-device-surface`, the onboarding of 01 |
| Say "no worker" where the promise page says "nobody", and name the hash service and the call as the exceptions | the trust story, `ledger-1.3.1` |

None of these is taken by this batch. Each, if the founder takes it, is a
seed for `impact` and a batch of its own.

## What was edited

The record moved to fragments and a build between the edition reviewed and
this batch (DR-028, DR-029, batches of 17 September); this batch was rebased
onto that regime, and the review checked that the `.doc` text of every page
it quotes is byte-identical across the move (only DR-010, revised as the
brief required, and the decision ledger's index differ).

- `src/pages/08-review/full-review-18-09/`: the page as fragments, `000-head`,
  one `NNN-<h2 id>` per section, `999-foot`, generated from the review's memo
  by the session's builder into the record's page floor (the head and foot
  taken from the 11/09 review's own fragments so the rail is the record's
  current rail; figures with title, description and one accent; tables with
  captions; sources numbered by first citation; every quotation of the
  record naming the page and its revision date). `docs/08-review/full-review-18-09.html`
  is what `node tools/build.mjs` writes from them.
- `src/pages/08-review/index/000-head.html`: one sentence added to the dated
  "Since this review" note linking the new page, and the revision date moved
  to 2026-09-18; the review of 11 September is otherwise left as it was
  written.
- `src/pages/contents/index.html`: a row in Table i.2. `manifest.json`: the
  page entry (the build fills its sections and the section count).
  `roles.json`: the page added to the chief executive's `owns`, beside the
  review of 11 September, so every section has an owner.
- `tools/depmap/refs.json` regenerated by `extract`; `docs/depmap/index.html`
  and `docs/depmap/architecture.html` regenerated by `view --site`; the
  generated views and `.github/CODEOWNERS` rewritten by the build; the graph
  is unchanged.

## The checks

- `node tools/depmap.mjs check --warnings`: clean, 405 nodes, 636 edges, the
  known `refused-policy` warning only.
- `node tools/verify.mjs`: clean, ten sections, and `node tools/build.mjs --check` clean.
- `node --test 'spec/test/*.test.mjs'`: 101 passing, as the review's
  section 4.5 reports. At the remote tip before this batch two vocabulary
  tests failed because the move of the index to `contents/` changed two
  loci in the map after the copies under `spec/vocab/` were derived; this
  batch re-ran `node spec/vocab/derive.mjs`, as `spec/README.md` prescribes
  after a map change, and the copies and the enum schema follow the map again.
- Every figure of the new page rendered in headless Chromium in the dark
  theme and read for label collisions.

## What the review could not do

The session's search budget ran out part-way through the research and the
outbound proxy blocked nearly every regulator, vendor and press host, so the
review reads primary texts through dated GitHub mirrors where they exist and
marks everything else to-verify. Its section 18 lists the hosts and the
rows it could not fill. A later session with open egress should re-run the
market-sizing, income-distribution and labour-cost queries its section 9
marks not found, and read at source the texts its source list marks as
mirrors.
