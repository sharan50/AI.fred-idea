# Batch 0008: finishing DR-021, and what the review passes found with it

Recorded 2026-09-13, after batch 0007. This batch exists because the coherence
pass and the adversarial pass of BUILD_BRIEF.md section 9 were run for the
first time since the revision, and both returned the same finding
independently: **DR-021 was taken and not propagated.** The founder dropped
telephony masking on 2026-09-13; four passages were updated and the mechanism
was left standing everywhere else, still specified, still reachable and still
cited as the closure for the second fatal failure.

Nothing here is a new position. Every edit either finishes a decision the
founder already took, corrects a count against the thing it counts, or records
as open a hole the deletion opened. Where the deletion left a question that
only the founder can answer, the question is an open item and not an answer.

## What the two passes found

Both agents were given only `docs/` and none of the session's reasoning, as
section 9 requires. The adversarial pass reported a live path by which a worker
would hear a vaulted value spoken on a call, built entirely from surviving
specification: the substitutor's telephony target descriptor, Table 3.1's
admitted surfaces, the catalogue's `spoken_format` and `tts_voice` columns, and
a console card carrying Place controls on a phone step, with DR-021 having
removed the mute, the delay line and the re-voicing that had been the closure.
The coherence pass reported the same cluster as twenty-five contradicting pairs
and added nineteen more elsewhere in the publication. Every quotation in both
reports was checked against the files before anything was edited.

## The changes, as seeds

| Change | Seeds |
|--------|-------|
| `dr-021-propagated` | `dr-021`, `comp-telephony`, `comp-substitutor`, `dr-004`, `dr-009` |
| `counts-reconciled` | `vocab-open-items`, `vocab-decision-records` |
| `holes-recorded` | `open-07-31`, `open-07-32`, `open-07-33`, `open-07-34`, `open-07-35` |

## What was edited

1. **The placement interface.** The substitutor accepts placements from two
   controllers, the browser and the relay; the telephony controller is not one
   of them and its privilege is the navigation keys of a dial map. The
   telephony target descriptor is gone, the fired marker is written before the
   first character rather than the first tone, and the network position lists no
   media gateway. Table 3.1 admits browser and relay for every class and a call
   for none.
2. **The worked example.** Task 12's third step is a booking call that places
   nothing; its field list is empty and its script says a value cannot be given
   on a call. The ledger record for the date of birth belongs to the browser
   step that types it, which is what its own surface field always said. Figure
   2.5 moves to that browser step, where a Place control is real.
3. **The catalogue.** The spoken-format and voice columns are withdrawn with
   the media path and marked as withdrawn rather than deleted, because a reader
   of the previous edition will look for them. The outbound gate's two lists go
   the same way. The telephony delay buffer leaves the surface settings.
4. **The console.** No re-voicing, no masked leg, no tones: a worker hears the
   far party directly, which the page now says in the two places that said the
   opposite. A reference the desk reads out is heard and typed, and tokenised by
   the screening call on the way to the result.
5. **The gate, where it is now a script.** DR-004 no longer claims a media
   server's outbound gate, 04's dual control no longer claims that an off-script
   utterance is held or cut, and both say what DR-021 says instead: the closure
   is the check before the release, which is narrower than a component that cut
   the words.
6. **The evidence pipeline.** The audio mask and the verifier's fail-closed
   audio test cited an allowlist in 3.2 that DR-021 removed. The allowlist now
   lives with the relay's renderer in 3.3 and the pipeline runs it over its own
   batch transcript; the stored recording carries less than the headset did
   rather than no more; and the span no detector names and no worker flags is
   named as the residue 07 declares. DR-009 carries the same correction.
7. **The completeness claims.** The threat model says the list is closed except
   the two paths 07 declares; the front page and the trust story say the same,
   and the trust story names both in plain words, because a customer-facing
   absolute that the open register contradicts is the worst kind of drift.
8. **Counts and numbers.** 02's section 4 had two sections numbered 4.5, two
   numbered 4.6 and none numbered 4.4, with ten pointers aimed at the missing
   one; section 4 is renumbered in reading order and every reference moved with
   it. The decisions ledger's DR-006 row reads amber, as the record itself
   does. The publication is numbered 00 to 08. The limits on the model page are
   seven, the measurements five, Table 5.5 carries three of four scenarios, and
   the commerce threshold reads the same in DR-019 and in 05. DR-017 lists the
   commands the tool has, `view` included.
9. **Stale positions.** 07 no longer calls 05 a stub, 04 no longer says 05
   defers the economics, the thesis no longer cites a withdrawn record as
   authority, and 06 no longer settles the pilot market that 07 holds amber.
10. **Two errors of batch 0007's own.** Figure 5.1's caption claimed the whole
    cost base and showed four blocks of it, payment fees and make-goods being
    charged on revenue; and the $149 in section 6 was attributed to the previous
    edition's economics when it is the review's own estimate.

## The holes, recorded rather than filled

Five open items, each a question DR-021 opened and none of them ours to answer:
a given name on a card, where the need-to-know filter and the worked cards
disagree; a fee quoted on a call, which has no comparator now that there is no
masker on that surface; at-most-once on a call step, which never receives a
fired marker and can therefore be retried after a worker has already agreed
something; a dependant's aliases, placed under an envelope that person never
signed; and three findings of the review that the record contradicts rather
than answers. Table 7.1 holds thirty-five.

## What this batch did not do

It did not design a replacement for the deleted mechanism, and it did not
soften what DR-021 costs. The record now says plainly that on a call the
closure for the second fatal failure is a procedure and not a component
property, which is the thing 03 says a closed path may never rest on. That is
the founder's trade to keep or to revisit, and it is written down as a trade
rather than as a closure. It did not edit batch 0006's record, which states the
decision as it was given that day. And the number-word table in `depmap.mjs`
was extended past thirty so the open register could be counted at all, which is
the first time the tool has had to grow for the record rather than the reverse.
