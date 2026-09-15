# Seams

What the pages leave open, say twice in two ways, or say in a way the code
could not take literally, met while turning the prose into the executable
specification. For each: where the pages say it, what the code does, and what
the record needs to settle. Nothing here edits a page; the batch record
`tools/depmap/batches/0017-executable-spec.md` carries these as proposed
changes for the change protocol of DR-017.

A seam is not a defect in the code. The code takes one reading and says so,
so that a founding engineer inherits a decision to confirm rather than a
choice to discover.

## Seams the code had to decide

1. **A step that commits nothing has no act type.** Table 2.5 in 02 is a
   closed list of sixteen act types, and every step type carries exactly one.
   A chase-the-party step (02, 5.3), a status enquiry (02, 7.1) and a lookup
   of availability commit nothing and attest nothing. The catalogue fixture
   keys them on `attest-fact`, the act the mandate-basis row of Table 3.5
   points to for speaking to a party as the customer. The record should add an
   act type for a non-committing enquiry, or say that `attest-fact` covers it.

2. **A party that responds while a user step is waiting.** 02, 5.2 says the
   response "produces nothing, because the task is awaiting-user and the
   responding step's window was its own timer"; 02, 5.4 says any step that is
   ready keeps the task active. If the response re-opened the blocked step,
   the projection rule would move the task. `TaskService.partyResponded`
   records the response on the step and re-opens it only when the task next
   returns to active. The record should say which it means.

3. **The projection mismatch has no board column.** 02, 5.4 makes a task whose
   state disagrees with the projection rule "an exception the watchdog
   raises", but the watchdog's four questions (02, 5.3) and the board's four
   columns (console, section 5) do not name it. The code raises it in the
   no-live-timer column, "the invariant's own condition".

4. **The column limit's escalation is "a recorded board-action"** (Table 2.8),
   and "the actor of a board-action is always a person" (Table 2.9). The
   watchdog is not a person. The code records the escalation as a
   `board-entry` event and leaves `board-action` to people.

5. **No route after failed-final or refused-policy.** 02, 2.2 says the planner
   "finds another, or reports that none exists", and 5.4 gives the task no
   state for steps that depended on the failed one. The code cancels those
   steps `superseded` by nothing and lets the projection rule report, so the
   task reaches the user rather than sitting active with nothing live.

6. **The user step a blocked-needs-user closure created has closed ok.** The
   eighth re-plan trigger calls it "the common case" of a fact arriving. The
   code re-plans where a planner is present and otherwise re-issues the
   blocked step on the same route.

7. **Every payment-instrument placement is a committing placement** (03, 2.1;
   02, 4.5), yet the ledger's own afternoon (03, 8.4) places `{{account.hdfc}}`
   through the relay in an email with no token in sight, and Table 3.1 puts an
   account number, a sort code and an IFSC in the payment-instrument class.
   The code reads the rule narrowly: a card, or a step the catalogue marks
   consumed on placement, is committing; an account number in a message is
   not. The record should say whether the class rule or the example stands.

8. **The signed step context has fixed fields and no route to the catalogue,
   but the substitutor must know whether a placement is consumed on
   placement.** The code adds `committing_placement` to the context, set by the
   task service from the catalogue entry, and the schema lists it. The record
   should add the field to 03, 2.1's list.

9. **Revocation of a dependant's delegation inside a placement window.** 03,
   2.1 says her revocation voids the context "as an envelope edit does", and
   the substitutor "has no route to the task service". The code's context dies
   at her delegation's end by construction, and the substitutor accepts an
   optional revocation feed for the minutes in between; how that feed reaches
   a component with no route is the record's to say.

10. **Where the digest keys meet the values.** 02, 8.3 has the hash service
    compute a keyed digest of every value in the vault, and 03, 1.3 says it
    holds a real value "only in memory while it screens a text". Computing
    the sets means holding every value in memory on every refresh and every
    rotation. The code does exactly that, through a digest-only credential,
    and keeps nothing; the record should say so, or move the computation to
    the vault under keys the vault never keeps.

11. **"Tokenised under the broader class."** 02, 10.1 gives the rule for a
    sixteen-digit number that may be a card or an account, which Table 3.1
    puts in one class. The code tokenises under the first pattern that claims
    the span and marks the alias ambiguous whenever more than one type claims
    it, card or account included.

12. **The redo child's first event.** "The same event creates a linked child
    task that opens in planning" (02, 5.2). The code writes that event on the
    child's log as a transition from awaiting-verdict to planning, which is
    the parent's row of Table 2.2 and not one the child could take. A child's
    opening needs a row, or a rule that its log starts with the parent's.

13. **The use "in words" against "nothing in a line is free text".** 03, 8.1
    has every line carry "the use, in words"; 8.2 forbids free text. The code
    closes the verbs (`USE_VERBS` in `lib/ledger.mjs`), builds the use from a
    verb and the party's form, refuses a line whose use starts otherwise, and
    never puts a party's own field label into a line.

14. **The policy block of the printed step record** names `attest-fact` beside
    an act of `schedule` (02, 3.2). Both read delegated. The code names the
    act whose lookup governs and, on a tie, the identity act before the
    committable one; the record should say which act the block names.

15. **`{{dob}}` in the printed request.** The proxy's pattern detector can
    type a date only as a date; the request record prints `{{dob}}`. The code
    reproduces it by the known-value detector against the date of birth the
    device form vaulted at onboarding, and types an unknown date `{{date}}`.

16. **The retry cap.** "The catalogue's retry cap (illustrative: two) bounds
    the closures, after which the task service closes it failed-final" (02,
    7.1). The code closes failed-final on the cap-th failed-retryable closure,
    so a cap of two allows one re-queue.

17. **The renewal re-issues the cancelled steps** "as an approved extension
    does" (02, 5.2). The code returns them to pending on the new version with
    their attempts kept; the record does not say whether attempts reset.

18. **The board's resume action.** "Cleared by resume when the party answers"
    (console, section 5). The code re-opens the step closed
    blocked-third-party to ready on the same route with a fresh deadline.

19. **A question while a step is running.** Table 2.2 has `ask` move the task
    to awaiting-user; the projection rule keeps a task with a running step
    active. The code follows the rule: the question waits beside the running
    step and the task moves when nothing is live.

20. **The map's `vocab-ledger-events` member `exposure-recorded` carries the
    code `read-back-muted`**, the previous edition's name. The pages say
    `exposure-recorded` (03, 8.1). The code keys on the member id everywhere;
    the map should drop the code.

## Seams read from the pages, not decided by the code

These were met in the reading before the code and are listed so the batch
record can carry them; the code takes the pages' newest position where they
disagree.

21. Telephony holds three positions: DR-021 puts no value on a call; DR-026
    leaves the mapping key open; DR-027 presupposes automated identity
    submission. The code has no telephony placement at all (`ALIAS_SURFACES`).
22. A worker hearing the user's name is accepted in 02, 4.2 and excluded by
    DR-027. The code's allowlist paints an out-of-lexicon name in a transcript
    and the known-value mask replaces a vaulted one.
23. 02, section 4 says two controllers write to the substitutor; 06, Table 6.1
    says three controllers are its only writers. The code admits the browser
    controller and the mail relay and refuses the telephony controller.
24. 02 calls the classifier deterministic; 06 speaks of "the classifier's
    model call". The code's classifier is a pure function of the catalogue,
    the envelope and the flag table.
25. Placement per field (02, 4.1; the console) against placement at submit
    (DR-022). The code places per field, one request per alias and target.
26. The five stream masks are deferred (DR-022) while an `ai` step still
    needs a masked text layer. The code implements the artefact masks and the
    card's default paint, not the stream.
27. A fee is tokenised as a financial-fact alias and is also what the
    controller compares against the cap. The code compares the context's
    amount, carried by the task service, against the remaining cap.
28. A refused placement closes `refused-policy` whichever check failed, an
    envelope failure included (03, 2.1). The code does the same and names the
    check in the policy reference.
29. `superseded` is both a cancellation cause and an outcome code. The code
    treats a superseded step as cancelled with the cause, and accepts the
    outcome code as the same thing.
30. The signed context lives two minutes; a step lives a shift. The code
    issues a context when the step is claimed and the controller must obtain a
    fresh one for a later placement.
31. Withdrawal inside a placement window is undecided in 07. The code lets a
    placement already inside its window complete and cancels the rest.

## Illustrative values pinned by the code

`DEFAULT_TIMERS` in `lib/state-machine.mjs` (planning deadline, nudge
offsets, lapse, validity window, check deadlines, placement window, hold
window, column limits, watchdog cycle) and `DEFAULT_SETTINGS` in
`lib/evidence.mjs` (margin, digit-run threshold, hold wait, attempts) carry
the pages' illustrative numbers; the dictionary in `lib/detectors.mjs` and the
common lexicon in `lib/evidence.mjs` are starting sets. Every one is the
pilot's to set, as the pages say.
