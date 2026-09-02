# AI.fred: Repository Build Brief

This file is the complete instruction set for populating this repository as the
central design-and-planning vault for AI.fred. It is written to be executed by
Claude Code as a capped, self-verifying loop. Everything binding is in this
file; nothing depends on conversation history.

## How to run

1. Create the GitHub repo (private), commit this file at the root as
   `BUILD_BRIEF.md`, and open Claude Code in the repo root.
2. Paste the line below. Model choice is yours; the brief runs the same on any.

```
/goal Populate this repo per BUILD_BRIEF.md: meet both acceptance bars in §8, follow the loop in §9 exactly, and honour every fixed decision in §1. stop after 40 turns
```

3. If `/goal` is unavailable in your build, paste this instead as the opening
   prompt: "Read BUILD_BRIEF.md in full, then execute it. The loop rules in §9,
   including the 40-turn cap and the early exits, are binding." The loop rules
   inside this brief govern either way.

After the loop surfaces: connect the repo to Netlify (publish directory is
already pinned in `netlify.toml`; no build command), then resolve the access
item in `07-open/` before sharing any URL.

---

## 0. Mission and role

AI.fred is a high-trust, high-reliability, human-in-the-gap, AI-first personal
assistant. The AI is the brain and the humans are hands: every request becomes
an ordered plan; the AI executes what it can; where it cannot, it hands a
human a precise, low-judgement instruction. The promise is reliability on
tasks that carry real consequence (money, identity, institutions), made safe
by one property: nobody on the operator side ever sees the sensitive data they
are placing.

Your job is to produce the venture's design-and-planning publication: a set of
static HTML documents under `/docs`, served straight from GitHub by Netlify,
visually coherent enough that any single URL can stand alone in front of an
investor, and technically complete enough that an engineer could start
building the harness from them. You are the writer, designer, researcher and
verifier. You are not the strategist: every strategic decision is already
taken and recorded in §1. If you believe a fixed decision is wrong, record the
objection in `07-open/` and comply; do not reopen it.

"The founder" throughout means Dhruv Sharan. The venture name AI.fred is a
working title; use it consistently everywhere so a later rename is one
find-and-replace pass.

## 1. Fixed decisions: the ledger (do not reopen)

### 1.1 Promise and wedge
- The wedge is high-consequence tasks: banking, identity, legal, health,
  institutional admin. The flat-fee errand players cannot safely touch these;
  the trust architecture is the moat.
- The trust story is made visible to the customer through a per-task access
  ledger, in plain words, e.g. "your PAN was used at 14:32 to fill HDFC's
  application; no person saw it."
- Six marquee verticals (carried in from the founder's prior work): banking
  and wealth; legal and administrative; identity and security; health and
  medical; family affairs; travel.

### 1.2 Delegation model
- Full delegation, identity acts included, is the designed capability
  ceiling. A per-jurisdiction policy layer decides at runtime which step
  types are delegated and which bounce to the user's own device as a one-tap
  approval. Detracting is a flag; adding would be a rebuild.
- The per-country flag table doubles as the lobbying agenda: line by line,
  what to ask a regulator to permit and the end-user benefit of each.
- Country-specific KYC constraints are recorded as to-verify legal items, not
  as design constraints. Design carries the ceiling.

### 1.3 The two fatal failures and their mitigations
Fatal one: a worker on the operator side sees something they should not.
- Sensitive values live in a bought tokenisation vault (Skyflow, VGS,
  Basis Theory class of provider; research current offerings). Humans, the
  AI and almost all of our software handle aliases only, e.g. `{{pan}}`.
- One small isolated substitution component swaps the real value in at the
  last boundary: into a form field in a browser we run (rendered as dots in
  what the worker sees); onto a phone line as synthesised speech or keypad
  tones while the worker's audio is muted; into an email through our relay.
- Every execution surface is ours: managed browser, our telephony, our mail
  relay. A worker never uses their own tools.
- Evidence redaction is part of the harness: screenshots, recordings and
  transcripts are masked before storage; no raw artefact is ever
  human-viewable. The evidence system is itself a leak path and the threat
  model must treat it as one.
- The threat model in 03 is organised as "paths by which a human could see a
  real value", each path named and closed.

Fatal two: an irreversible act the user did not want.
- Every task carries an authority envelope: spend cap, contactable parties,
  committable acts, delegated identity acts. Delegation is total within the
  envelope and impossible outside it.
- Every step is classified against a point-of-no-return test. Irreversible
  and outside the envelope: bounce to the user's device. Irreversible and
  inside it: dual control, whichever party executes, the other checks before
  it fires.

### 1.4 The grey zone: task state machine
- User abandonment is legitimate; system forgetting is forbidden, as an
  architectural invariant, not a procedure.
- Every task lives in an explicit state machine. No task reaches a terminal
  state without an explicit transition. A task the user goes quiet on moves
  through visible nudges into `lapsed`, which is distinct from `withdrawn`.
  A watchdog surfaces any task without a live timer on an exceptions board.
- The state-machine invariant must appear identically in 02-architecture and
  in the worker console specification.

### 1.5 Verdict system (two loops, different jobs)
- Control loop, before "done" is shown: each step closes with a structured
  outcome code from a fixed vocabulary; artefacts attach for audit and
  dispute only; dual control only on irreversible steps. Not ground truth of
  quality.
- Improvement loop, owned by the user: a one-tap verdict closes every task.
  Five user-facing options: done, satisfied; done, but rough; wrong outcome,
  needs redoing; we couldn't complete it; withdrawn by me. `lapsed` is
  system-assigned and never a button, so the five-option ceiling holds.
- Verdict joined to step trace is the improvement measurement; every product
  change is judged against verdict rates per task type.
- Incentive mechanics are an assumption to mark as such: a verdict is needed
  to close a task; full-coverage months earn a small credit; the two bad
  verdicts trigger an automatic make-good. Make-good policy is the founder's
  open decision (07).

### 1.6 Channel
- Amber. Underneath it, the fixed decision: a channel-agnostic intake gateway
  normalising every channel (WhatsApp, native app, SMS/iMessage, web) into
  one internal request format for text, voice and attachments. The front door
  is a per-market launch choice, not an architecture commitment.
- Amber trigger: resolve when the first US/UK cohort is scoped.

### 1.7 Markets
- India is the home base for build economics (high technical ability,
  low-cost geography, large English-speaking population). US and UK are
  where commercial viability lies. Build for all three.
- Universal core, one build, country-agnostic: planner, classifier, task
  cards, alias vault and substitution, authority envelopes, state machine,
  verification, worker console, access ledger, intake gateway.
- Per country: passport adapters (India Stack: DigiLocker, Account
  Aggregator, UPI Autopay; UK: Open Banking plus current identity rails; US:
  bank-data aggregation and card tokenisation; research all at write time),
  a legal pack, and a data-residency map. Bengaluru staff processing UK/EU
  data is a restricted cross-border transfer needing contractual safeguards;
  the vault provider's regional hosting is part of why that layer is bought.
- Expansion is a repeatable playbook: adapter plus legal pack plus shift.

### 1.8 Operations
- Office mandatory, 24/7: day shift covers India, two night shifts cover the
  west. Site controls (device policy, clean floor, monitored substitution
  stations) are part of the trust guarantee. Remote-safe operation is a
  designed-later programme parked in 07, not a maybe.
- Workforce tiers carried in from prior work: L1 generalist pool; L2
  specialist pods per vertical; L3 super-trust; QA and escalation standalone.
- Task cards are AI-generated and need-to-know: pseudonymised customer
  ("Client 4471"), only the fields the step needs, the script, the expected
  outcome, a structured result to fill in.

### 1.9 Scope exclusion: economics
- Task economics, pricing and unit costs are deferred; the founder has ruled
  them a post-Series A/B problem. `05-business/` is a deliberate one-page
  stub stating the deferral and its trigger. The 24/7 shift design and site
  controls stay in 04 as operational design with no cost model attached.
- Consequence for the thesis: 00-thesis must carry the argument with no
  economics in it.

### 1.10 Context store
- A profile where every fact carries source, date, confidence, and whether
  the user confirmed it; learned mostly as a by-product of doing tasks,
  topped up by an onboarding interview and read-only connectors the user
  chooses. Graphiti-style temporal knowledge graph. Sensitive fields live in
  the vault; everything else with us. Data-quality problems become visible
  rather than silently wrong.

### 1.11 Publishing decisions
- Repo as vault: design docs now, application code later in the same repo,
  professional setup after the raise.
- `/docs` is plain static HTML. No build step, no frameworks, no CDNs, no
  external asset loads. Netlify serves straight from GitHub; publish
  directory pinned in `netlify.toml`. Vanilla JS for navigation only.
- HTML is the single canonical source (rejected: static site generator;
  rejected: Markdown-canonical with HTML generation, because two
  representations drift). Semantic HTML so the site stays machine-readable.
- Diagrams are inline SVG. Every page exports cleanly to PDF via a print
  stylesheet. `manifest.json` maps the site for humans and machines.
- A Netlify URL is public by default; access control is a to-verify in 07
  with the interim mitigation of an unguessable URL plus a no-index
  directive.

## 2. Repository structure (exact)

```
BUILD_BRIEF.md             this file
README.md                  repo orientation for humans: what this is, how to run the brief, where the site lives
netlify.toml               [build] publish = "docs", no build command
manifest.json              machine-readable site map (path, title, section, status, summary, updated)
tools/verify.mjs           the verification harness (§9.2); never published
docs/
  index.html               the venture in two pages; links the trust one-pager prominently
  assets/
    tokens.css             every colour, type, spacing token; the only place colours are defined
    base.css               reset, typography, layout, components
    print.css              print/PDF stylesheet
    fonts/                 self-hosted IBM Plex woff2 (OFL); fallback rule in §3
    nav.js                 vanilla JS navigation only
  00-thesis/index.html
  01-product/index.html
  02-architecture/index.html
  02-architecture/worker-console.html
  03-trust-and-data/index.html
  03-trust-and-data/trust-story.html      the one-pager a customer could read
  04-operations/index.html
  05-business/index.html                  the deliberate stub
  06-roadmap/index.html
  07-open/index.html
  decisions/index.html                    ledger of decision records
  decisions/dr-001-*.html …               one page per decision record
```

Sections may add further pages where a topic earns its own URL; every page
must be reachable from its section index and listed in `manifest.json`.

## 3. Visual system (binding)

Direction, already agreed with the founder: an engineering dossier. Paper
ground, ink text, one accent used as a stamp, a fixed status vocabulary, and
diagrams as the memorable element. Spend boldness in the diagrams and the
status system; keep everything else quiet and disciplined.

- Tokens (define in `tokens.css`; refine values only if AA contrast demands,
  and never source a colour anywhere else):
  `--paper:#FBFAF7; --ink:#17150E; --line:#D8D4C8; --accent:#A8321A;
  --amber:#946A00; --verified:#2F5D3A;`
- Type: IBM Plex Sans for prose; IBM Plex Mono for data, figure labels,
  status chips and the ledger voice only, never for body text. Self-host
  woff2 in `docs/assets/fonts` (IBM Plex is OFL; fetch from the official IBM
  Plex GitHub releases). If the network blocks the fetch, fall back to a
  system stack, record a to-verify in 07, and carry on.
- Type scale: set deliberately (Elements of Typographic Style defaults),
  line length under 80 characters, sentence case headings.
- Status chips, identical everywhere, sentence case: `verified` (with source
  and date on hover or adjacent), `to-verify`, `amber`, `decision`,
  `assumption`. Outline chips in ink with a small coloured dot; the accent
  is reserved for stamps and key diagram strokes.
- Component set, defined once in `base.css` and composed everywhere: page
  header with document status; decision-record card; figure block with a
  one-line caption stating what to take from it; data table; callout. A new
  layout on a future page means extending tokens and components first.
- Diagram language: one visual language across every SVG; consistent stroke
  weights; palette from tokens only; Plex Mono labels; a caption under each.
- Mandated diagrams (verify.mjs checks these ids exist): the task state
  machine (`fig-state-machine`); the alias substitution sequence
  (`fig-substitution`); the authority envelope (`fig-envelope`); the trust
  architecture end to end (`fig-trust-e2e`); the 24/7 shift wheel
  (`fig-shift-wheel`); the market adapter model (`fig-adapters`). Add more
  wherever prose alone would strain.
- Floor: semantic HTML, `lang="en-GB"`, AA contrast, honest rendering at
  mobile widths, visible keyboard focus, reduced motion respected, print
  clean. No non-user-triggered motion beyond at most one deliberate moment.
- Anti-defaults, banned: ALL-CAPS eyebrow labels; tracked-out caps; middle
  dots joining meta strings; arrows glued to link text; identical rounded
  cards with the same soft shadow on everything; gradient washes; terracotta
  on cream; per-section fade-in entrances.
- Process: before writing any CSS, write a short design plan (palette
  as named hex, type roles, layout concept with an ASCII wireframe,
  principles), critique it against the generic defaults above, revise, and
  record the plan as a decision record. Only then build.

## 4. Writing rules (every document)

- British English throughout. `lang="en-GB"` on every page.
- No em-dashes anywhere, in prose, headings, captions or code comments; use
  commas, semicolons or colons. verify.mjs enforces this.
- Conclusions before reasoning. Conviction-forward, plainly argued, no
  corporate filler, no hedging padding. Venture voice is first person
  plural; the reader is an investor, an engineer or a customer as the
  section demands.
- No invented numbers. If a number is illustrative, label it illustrative.
  No fabricated testimonials, users or quotes. Economics nowhere except the
  05 stub's statement of deferral.
- Banned phrases (verify.mjs enforces): "In today's", "fast-paced world",
  "game-changer", "cutting-edge", "seamless", "leverage synergies", "It's
  important to note", "In conclusion". Vary sentence rhythm; never open
  consecutive sections with the same construction.

## 5. Research rules

- Use web search and fetch for every vendor, competitor, regulatory and
  product claim. It is September 2026; the AI-concierge field and the
  regulatory picture move fast, so nothing external is asserted from memory.
- Every external claim carries a chip: `verified` with source name and date,
  or `to-verify`. If web access is unavailable, everything external becomes
  `to-verify` and the loop notes the downgrade; that is a re-aim, not an
  exit.
- Competitive landscape (00-thesis): research the current Indian AI
  concierge field (Faff and peers, including newer entrants and any
  incumbent moves) and the US/UK human-assisted assistant field. Cover
  pricing models and what none of them can safely do.
- Rails and vendors (03): current state of DigiLocker, Account Aggregator,
  UPI Autopay; UK Open Banking and identity rails; US aggregation and card
  tokenisation; the tokenisation-vault vendor class. Jurisdictional KYC
  last-mile constraints are researched and filed as legal to-verifies.
- Privacy law mapping (03): India DPDP Act and current rules status; UK
  GDPR; applicable US state law. Skeleton mapping with to-verify chips, not
  legal advice.

## 6. Content requirements by section

**index.html** is the venture in two pages: the promise, the human-in-the-gap
model, the two fatal failures and how the design makes them structurally
impossible, the three-market shape, what exists today and what this
publication is. Links the trust one-pager prominently. No economics.

**00-thesis**: customer and wedge; why now; why India as build base and
US/UK as commercial ground; the researched competitive landscape; why the
flat-fee players cannot follow into high-consequence tasks (the trust
architecture as moat). Must carry the argument with no economics in it.

**01-product**: user journeys across the six verticals; task taxonomy;
intake and the channel-agnostic gateway (channel amber stated, trigger
stated); the verdict system and its assumed incentive mechanics (chipped
`assumption`); the authority envelope from the user's point of view, set-up
and edits; onboarding and context capture; what we refuse to do. If a prior
AIfred PRD exists in the repo, reconcile per §7.

**02-architecture**: planner; classifier (AI-runnable, human-runnable,
user-only); execution surfaces (managed browser, telephony with system-side
injection and worker audio-mute, mail relay); the state machine with the
invariant verbatim; verification and the evidence-redaction pipeline; the
context store (provenance and confidence profile, temporal graph); the
intake gateway. `worker-console.html`: the operator's task-card view, the
alias-only rule, structured outcome codes, the exceptions board, and the
state-machine invariant appearing identically to 02's.

**03-trust-and-data**: the alias and vault model; the substitution
component and its isolation; the passports (device bounce-backs; India Stack;
UK; US); the per-jurisdiction policy flag table doubling as the lobbying
agenda; the threat model organised as named-and-closed paths by which a human
could see a real value, the evidence system included; artefact redaction; the
access ledger specification; the data-residency map; the privacy-law skeleton
mapping. `trust-story.html`: one page a customer could read, plain words, the
ledger example included, printable.

**04-operations**: task cards and pseudonymisation; L1/L2/L3 tiers with QA
and escalation; the 24/7 shift design (day India, two night shifts west, with
`fig-shift-wheel`); site controls as part of the trust guarantee; QA and the
exceptions board as an operational duty; SLAs stated qualitatively. No cost
model.

**05-business**: one page: economics is deferred as a post-Series A/B
problem by the founder's decision; the trigger for reopening; what will be
needed when it reopens (price points, minutes-per-task, pool sizing against
the 24/7 floor). Nothing else.

**06-roadmap**: harness-first build sequence; pilot scope in capability
terms; build-versus-buy table (vault, telephony, browser sandbox, models:
buy; planner, task cards, substitution, envelopes, state machine, console,
ledger: build); the country-expansion playbook (adapter, legal pack, shift).

**07-open**: every open item, each with an owner and a trigger: channel
amber; first-cohort market sequencing; legal to-verifies including
KYC last-mile per jurisdiction; Netlify access control with the interim
mitigation; naming, domain and trademark (the dot makes `ai.fred`
unregistrable as a domain; list candidate forms); make-good policy (owner:
founder); remote-safe operations as a designed-later programme; any
objection you formed against a fixed decision during the build.

**decisions/**: one page per record: the decision, the rejected
alternative(s) and their cost, what the decision closes off, status, trigger
if amber. Seed set, then add every decision you take during the build that
shapes the result: channel gateway with WhatsApp amber; verdict two-loop
split; full-delegation ceiling with policy flags (noting it supersedes the
earlier A/B/C capability-tier framing); authority envelope; state machine
with lapsed; office-mandatory 24/7; universal core with country adapters;
vault bought not built; evidence redaction; HTML-no-build-step publishing
(rejected SSG and Markdown-canonical); visual token-and-component system
(rejected framework and per-page styling); your design plan from §3.

**manifest.json**: every page: path, title, section, status, one-line
summary, updated date. verify.mjs checks it against the filesystem.

## 7. Reconciliation rule

The repo may be empty or may already contain the earlier AIfred PRD or notes.
If present: reconcile into 01-product; any conflict between the PRD and this
brief surfaces as a decision record naming both positions, and this brief
governs. The known conflict is channel choice; the amber governs it. Never
silently overwrite prior material; never let it silently override the ledger.

## 8. Acceptance bars (the stop condition)

### 8.1 The founder's bar, verbatim ("you" is the founder)

"A sceptical reader gets from index plus 00-thesis why this wins where the
flat-fee players can't follow, with no economics needed to carry it. An
engineer who has never met you can start building the harness from 01 to 03
without asking a question the repo doesn't answer. Every open item is visible
with a trigger: channel amber, first-cohort sequencing, legal to-verifies,
Netlify access, naming; nothing silently assumed. The trust story fits on one
page a customer could read. Nowhere does a path exist for a human to see a
real value or for an irreversible act outside an envelope, and any document
touching either says how the path is closed. And now the visual clause: every
page reads as one designed publication, any single URL can stand alone in
front of an investor, and a diagram exists wherever prose alone would strain."

Restate this bar verbatim at every checkpoint and in the surfacing report.
Never paraphrase it into something the build happens to satisfy.

### 8.2 The technical bar

- No two documents contradict each other, established by the fresh-context
  coherence pass (§9.3), not by the writer.
- Every decision record carries a rejected alternative and what it closes
  off.
- Every external claim is chipped `verified` (source, date) or `to-verify`;
  nothing external asserted bare.
- The state-machine invariant appears identically in 02-architecture and
  worker-console.html.
- verify.mjs passes clean (§9.2), including the visual checks: token-only
  colours, AA contrast, mobile-honest, print-clean, one diagram language,
  mandated figure ids present.
- The adversarial review (§9.4) reports no unclosed finding on either fatal.

## 9. The build loop

### 9.1 Order
1. Skeleton, tokens.css, base.css, print.css, fonts, nav.js, verify.mjs,
   manifest scaffold, netlify.toml, README.md. Commit.
2. Design plan per §3, critiqued against the anti-defaults, recorded as a
   decision record. Commit.
3. Research sprint per §5; keep notes with sources and dates.
4. Content in this order, diagrams built with their host pages, decision
   records as you go: 00, 03, 02 (+ worker console), 01, 04, 06, 07,
   05 stub, trust-story, index last. Commit per section.
5. Full verify.mjs run; fix everything.
6. Coherence pass (§9.3); fix; re-verify.
7. Adversarial review (§9.4); fix; re-run until clean or an exit fires.
8. Final verify.mjs; surfacing report (§9.6). Commit.

Concentrate multi-angle work where the risk is: the substitution and
redaction specification in 03 and its two figures, because an error there is
the expensive one. Draft two genuinely different framings (boundary-sequence
led versus ledger-led), pick against the bars, record the loser as a decision
record. Everywhere else, choose once and move.

### 9.2 verify.mjs (write it in step 1; run it every pass)
Node, no dependencies. Non-zero exit on any failure; print each failure with
file and line. Checks:
- every internal link and asset path resolves; no external asset loads
  (script/link/img/font from the network); external citation links in prose
  are allowed;
- every page: doctype, `lang="en-GB"`, tokens.css and base.css linked, page
  header component present, document status chip present;
- colours appear only in tokens.css (scan for hex/rgb/hsl elsewhere);
- AA contrast holds for ink-on-paper, accent-on-paper, chip text;
- mandated figure ids of §3 all exist;
- U+2014 absent from /docs; §4 banned phrases absent;
- manifest.json lists exactly the pages on disk;
- 05-business contains the deferral and trigger text; every decisions/ page
  contains a rejected-alternative and a closes-off section;
- print.css present and linked.

### 9.3 Fresh-context coherence pass
Spawn a subagent given only `/docs` and bar item "an engineer who has never
met the founder can start building the harness from 01 to 03 without asking a
question the repo doesn't answer", with none of your reasoning. It returns
(a) every contradiction between any two pages, (b) every question an
implementing engineer would still have to ask. Fix both lists.

### 9.4 Adversarial review
Spawn a separate subagent given only `/docs` and this exact hunting brief,
with none of your reasoning: "Hunt three things and report numbered findings
with page references. One: any path by which a human on the operator side
could see a real sensitive value, including via evidence artefacts,
screenshots, recordings, transcripts, logs, the worker console, telephony
audio, or the access ledger itself. Two: any path by which an irreversible
act could occur outside a task's authority envelope, including lapsed and
nudge edge cases, envelope edits mid-task, and per-jurisdiction delegation
flags. Three: any pair of statements in the publication that cannot both be
true." Fix findings, re-run until clean. A stance switch inside your own
context is not review; only the subagent's clean report counts.

### 9.5 Early exits and re-aim
Re-aim without exiting when the risk turns out to live elsewhere than
predicted, or when a missing capability has a stated downgrade (no network:
external claims become to-verify; no subagents: run §9.3 and §9.4 in fresh
Claude Code sessions given only /docs, and say so in the report).
Exit early only on: (1) two clauses of this brief genuinely contradict;
(2) a required input does not exist and has no stated downgrade;
(3) genuinely different approaches to one component all fail at the same
point for the same reason; (4) two consecutive passes with zero movement on
the same failing bar item. Before any exit, name the blocker in one sentence
the founder could act on. Every exit reports: what was built that works; the
blocker as a consequence; which constraint, relaxed, would unblock it and at
what cost; the reduced version achievable now. Difficulty is not blockage.

### 9.6 Cap and surfacing
Cap: 40 turns. Hitting the cap is a fifth exit, reported the same way; never
declare victory at the cap and never redefine a bar downward to reach it.
The surfacing report contains: the founder's bar verbatim and item-by-item
whether it is met; what verify.mjs and the two subagent passes actually ran
and returned; every decision taken during the build that shaped the result;
what was deliberately left alone; the open-items list from 07.

## 10. Forbidden moves

Reopening a §1 decision. Inventing numbers, users, quotes or economics.
Asserting an external claim without a chip. Lowering or paraphrasing the
founder's bar. Declaring done without the subagent passes. Publishing or
deploying anywhere; this loop touches the repo only. Em-dashes. Adding a
build step, a framework, a CDN, or an external asset load. Letting a page
exist outside manifest.json. Silence about anything you could not verify.
