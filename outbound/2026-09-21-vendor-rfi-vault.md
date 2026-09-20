# Request for information: tokenisation vault and tokenising edge proxy

**To:** [vendor], solutions engineering
**From:** Dhruv Sharan, founder, AI.fred (working title)
**Date:** 21 September 2026
**Reply by:** Friday 25 September 2026 if you can. If you cannot, tell us when you can and we
will wait rather than drop you.

**Send to:** Skyflow, Very Good Security, Basis Theory, Evervault, Piiano. One each, unchanged.

## 1. Why you are receiving this

We are building a consumer service in India in which no employee of ours ever sees a customer's
real value: an identity number, a card, an account, a date of birth, a balance, a health fact.
Values live in a vault; everything we run handles typed aliases. We are choosing that vault now,
before we write the one component that talks to it, because the component's interface is
determined by what you can do.

We will shortlist on the written answers below, by 30 September, and run a paid two-week proof of
concept with one or two vendors in October. This is a purchase with a date on it.

Please answer each question yes, no, or yes with conditions, and point us at documentation. A
clear no is worth more to us than a yes we discover later to be a no. If something we describe is
not a thing you sell, the useful answer is "we do not do that", and, if you know, who does.

## 2. Volumes, for pricing

These are planning figures, not commitments.

| | Pilot (first 6 months) | Month 12 to 18 |
|---|---|---|
| Households | 50 to 200 | 3,000 to 10,000 |
| Stored values per household | 20 to 60 | 20 to 60 |
| Tasks a month | 300 to 2,000 | 10,000 to 60,000 |
| Detokenise calls per task | 1 to 15 | 1 to 15 |
| Inbound payloads a month through the proxy | 2,000 to 10,000 | 60,000 to 300,000 |

Payloads are messaging webhooks, our own device forms, and responses from third-party
interfaces. A payload is typically a small JSON body; perhaps one in ten carries an image or a
document, and a few carry audio.

## 3. Region

- **A1.** Do you hold data in an Indian region? Is it generally available rather than in preview,
  and which city?
- **A2.** Is your tokenising proxy available in that same Indian region, or is the proxy served
  from elsewhere while only storage is local?
- **A3.** Do you hold data in a United Kingdom region? If not, is an European Union region your
  answer for United Kingdom residents' data, and are you willing to say so in writing?
- **A4.** Does your Indian region meet the Unique Identification Authority of India's
  requirements for an Aadhaar Data Vault and its associated hardware security module, as revised
  by Circular 8 of 2025? Have you been assessed against them, by whom, and when?
- **A5.** Which of your entities would contract with us, under which governing law, and do you
  have an Indian entity that can contract locally?

## 4. The proxy

Our design puts your proxy in front of us, so that no process of ours ever holds a raw byte.
Three kinds of traffic terminate at it: a messaging webhook, our own device form, and every
response from a third-party interface.

- **B1.** Can your proxy terminate all three and forward each payload onward with sensitive
  values already replaced by tokens?
- **B2.** Can it run our detection policy over the whole body of free text, or does it only
  tokenise fields we name by path or by JSON pointer? We need four things, over the whole body:
  - pattern detection for Indian identifier formats, including a permanent account number, an
    Aadhaar number, and a card number by its check digit;
  - pattern detection for monetary amounts, including Indian number words such as lakh and
    crore, in written and spoken form;
  - matching against a set of keyed digests that we supply and refresh, so that a value already
    in the vault is recognised wherever it reappears;
  - typing of an ambiguous format under the broader of the two candidate classes, with the
    ambiguity flagged in the forwarded payload.
  If the honest answer is that your proxy maps named fields and nothing more, say so. It is the
  single most important answer in this document.
- **B3.** Can it transcribe an audio attachment inside that same boundary and tokenise the
  transcript, so that the audio never reaches us?
- **B4.** Can it resolve an address token, a telephone number or a messaging handle, solely in
  order to hand an outbound message to a channel provider, returning the resolved address to
  nobody, including us?
- **B5.** How long does the proxy hold a payload, and where? Can we configure that window?
- **B6.** Are request and response bodies excluded from your logs? Can that be a contractual
  term rather than a configuration setting? Is there any debugging or support view in which your
  staff can see a body?
- **B7.** What round-trip latency should we expect at the proxy for a 10 kilobyte JSON body, and
  for a 2 megabyte image? Our proxy sits in the critical path of a customer-visible step.

## 5. Detokenisation and access

- **C1.** Can detokenisation be restricted to exactly one service credential, such that no human
  role, no console, and no support process can reveal a value?
- **C2.** Can the reveal or unmask function be removed from your dashboard entirely? If your
  account owner can always grant themselves the ability to reveal, say so plainly; we will then
  ask you to accept a contractual bar instead, and we would like to know now whether you would.
- **C3.** Do you export access logs in a form we can reconcile, line by line, against our own
  record of every detokenisation? What is the delay before an event appears?
- **C4.** What is your process when one of our own employees contacts your support team and asks
  for a value to be revealed?

## 6. Digests

This is the requirement most likely to be a no, so please answer it precisely rather than
generally. We run a service whose only job is to detect whether a value has leaked onto a
screen, into a transcript or into a document. It must be able to do that without ever holding the
value.

- **D1.** Can your vault compute a keyed digest of a stored value and return the digest without
  returning the value?
- **D2.** Can it do so for several normalised forms of the same value: spaced, unspaced,
  hyphenated, case-folded, spoken digit by digit, and partial forms such as the last four digits?
- **D3.** Can it issue two digest sets under two different keys, to two different consumers, and
  rotate both on a schedule, with neither key ever leaving your boundary?
- **D4.** If D1 is no: is your deterministic token or fingerprint computable at query time from a
  candidate string we supply, so that we can compare it against a stored token without your
  system retaining the candidate? What is the rate limit, and what does it cost per call?

## 7. Leaving

- **E1.** Can we export every token together with its value, under a key we control, in order to
  re-tokenise into another provider?
- **E2.** What does that cost, how long does it take, and has a customer actually done it?

## 8. Attestations and terms

- **F1.** Which attestations do you hold: SOC 2 Type II, ISO 27001, PCI DSS and at which level
  and in which role, any health-data assessment? Please attach the current reports, or tell us
  what is required for us to receive them.
- **F2.** Do those attestations cover the proxy as well as the vault?
- **F3.** Your sub-processor list, and the regions in which each operates.
- **F4.** Your position on lawful access requests: do you notify the customer, do you challenge,
  and have you received any?
- **F5.** Do you accept a contractual commitment that bodies are never logged and that no
  employee of yours may reveal a customer value?

## 9. Price

- **G1.** Price at each of the two volumes in part 2, with the proxy included and excluded.
- **G2.** What do you meter: stored values, calls, payloads, or a combination? What happens when
  a month spikes to three times the plan?
- **G3.** Do you run a programme for pre-revenue companies, and what does it require?

## 10. What happens next

We shortlist on 30 September. The proof of concept in October is one task, end to end: a payload
tokenised at the proxy, a value detokenised into a web form through a single credential, and a
digest match run against a screenshot of the result. Two weeks, paid, with a named engineer on
each side.

## 11. What we are not asking

We are not asking you to price a multi-year commitment, and we would rather read your answers
before we see a demonstration. We are not asking for a call this week; if you would like one,
send the answers first and we will book it the same day.
