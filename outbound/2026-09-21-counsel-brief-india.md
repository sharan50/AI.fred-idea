# Brief to counsel: delegated personal administration in India

**To:** [firm], for the attention of [partner]
**From:** Dhruv Sharan, founder, AI.fred (working title)
**Date:** 21 September 2026
**Subject:** Written opinion on delegated identity acts, Aadhaar custody, card data, and where the loss falls

Not for circulation. This brief describes a design, not a live service.

## 1. What we are asking for, and by when

A written opinion on the five questions in part 4, within ten working days, and on the six in
part 5, within thirty days. The five in part 4 decide what we build; we would rather change a
design than a quarter of engineering. Please quote a fixed fee for part 4 and an estimate for
part 5, and tell us who in the firm would do the work.

Each question below carries what we have already read and how far we read it, so that you are
paid for judgement rather than for research. Where our own reading has produced a view, we say
so, and we would rather be told plainly that it is wrong.

## 2. Who we are

One founder, no employees, no customers, no software in production. We intend a subscription
service in India that takes on the personal administration a household dreads: a bank form, an
insurance claim, a hospital appointment, a government portal, a document that must be produced
before a deadline. Software plans the work; a salaried employee in Bengaluru performs one
bounded step at a time. The company is not yet incorporated; we will tell you the vehicle before
the engagement begins.

## 3. What the system does, precisely

Every answer below turns on these facts, so please treat this part as the specification.

1. **Values.** Sensitive values, meaning identity numbers, card and account numbers, dates of
   birth, balances, health facts and documents, enter a bought tokenisation vault hosted in
   India at the instant they arrive, and are replaced by typed aliases. Every other part of our
   system handles aliases only.
2. **Staff.** An employee works from a task card that names the customer by a number and every
   value by an alias. They never see a value. Since a recent design decision they never see the
   customer's name either.
3. **Placement.** A single component, acting under a per-task authority the customer signs on
   their own device, places a real value into a form field or an email body. It writes a line in
   a per-task ledger, in plain words, that the customer can read.
4. **Calls.** An employee telephones an institution from our number. No value is spoken in
   either direction. The employee states that they are calling on behalf of the customer, who
   has authorised them, and never says or implies that they are the customer. Where the
   institution requires the customer's own voice or a one-time code, the customer joins.
5. **Never held.** One-time passwords, card and payment personal identification numbers, bank
   and payment application logins, and biometrics never enter the system at all. Every payment
   is performed by the customer on their own device. We never appear on a video identification
   session.
6. **Mandate.** Every customer signs a standing authority naming what we may do for them, and
   confirms each task's limits on their device before it starts.

## 4. Part one: the five questions that decide the build

### Q1. What makes our act the customer's act

Which instrument makes our acts the customer's acts in the eyes of a bank, an insurer, a
hospital or a government department? Is a signed standing authority, together with a per-task
confirmation from the customer's registered device, sufficient? Or is a power of attorney
needed, and if so for which classes of act? Does the answer differ between a regulated
counterparty and an ordinary service provider?

*Why it matters.* Everything else rests on this. If nothing short of a registered power of
attorney will do, our onboarding, our cost per customer and our addressable set of tasks all
change.

*What we have read.* Nothing at source. We have assumed a contractual mandate suffices and have
not tested that assumption anywhere.

### Q2. Identity acts at an institution's own form

May a delegate that is not itself a regulated entity, acting under the mandate in Q1:

- (a) state the customer's identity number to an institution;
- (b) complete a know-your-customer or account-opening form on the customer's behalf; and
- (c) answer knowledge-based security questions from a record the customer gave us?

In particular: where the institution performs its own customer due diligence on the data
submitted, is data entry by a delegate "reliance on a third party" for the purposes of the
Master Direction on Know Your Customer, or does that concept simply not reach it? If the
institution's own policy refuses third-party callers, does anything in law change that, or is it
purely a commercial matter between the institution and its customer?

Please also confirm our reading that video-based customer identification is closed to us
entirely: paragraph 18(b)(i) requires the process to be "operated only by officials of the RE",
18(b)(iv) provides that "any prompting observed at end of customer shall lead to rejection", and
18(b)(xi) permits assistance only from the bank's own business correspondent, at the customer's
end.

*Why it matters.* These three acts are the difference between a service that performs the
dreaded task and a service that prepares a checklist for the customer to perform. If they are
closed, our product is a different product and we would rather know now.

*What we have read.* The Master Direction on Know Your Customer, 2016, as updated on 14 August
2025: the definitions and the whole of paragraph 18, read through a mirror of the Reserve Bank's
page. We have not read the reliance provisions, the Prevention of Money Laundering rules, or any
authority on delegated data entry.

### Q3. Holding an Aadhaar number

May a private company that is neither a requesting entity nor an offline verification-seeking
entity hold a customer's full Aadhaar number, given voluntarily by that customer, in a
tokenisation vault? Does the Unique Identification Authority's Circular 8 of 2025 on the Aadhaar
Data Vault and hardware security modules bind such a company? If it does, what does compliance
require of a bought vault hosted in India, and is a vendor's own attestation enough?

Would you advise holding the virtual identifier or a masked form instead? If so, does anything
we need break: specifically, can a customer's bank or insurer accept a virtual identifier where
we present a document on the customer's behalf?

*Why it matters.* The vault we buy, and the region we buy it in, follow directly from this
answer. We would rather buy the right thing once.

*What we have read.* The Aadhaar Act 2016, sections 8, 29, 37, 38 and 47, and the Authentication
and Offline Verification Regulations 2021, regulations 17, 20 and 20A, all read through mirrors.
Our reading is that section 37 attaches to identity information collected in the course of
enrolment or authentication, neither of which we perform, and that nothing we found forbids
voluntary custody by a third party. We note separately that the Master Direction on Know Your
Customer requires regulated entities to redact the number, so a bank will not accept a full
number from us in any event. We have **not** read Circular 8 of 2025; we have it only through a
press report of it.

### Q4. Card data and the payment chain

Is an entity that holds a customer's card number in a vault, and injects it into a merchant's
checkout form at that customer's instruction, "in the card transaction / payment chain" for the
purposes of paragraph 4(a) of Reserve Bank circular RBI/2021-22/96 of 7 September 2021? We are
not an issuer, a network, a payment aggregator, a payment gateway or a merchant.

If we are in the chain, is there any route other than card-network tokens? And does the
networks' responsibility for compliance "by all entities involved" in paragraph 4(c) reach us
through our acquirer, our vault vendor, or not at all?

*Why it matters.* If we are inside the chain, the stored card comes out of the design, and a
class of task goes with it.

*What we have read.* The circular in full, through two independent mirrors, including paragraph
4(a) and the responsibility provision. We found no text addressing a form-filling agent in
either direction.

### Q5. Where the loss falls

Where a customer has mandated us, and an unauthorised or unintended electronic transaction
follows from something we did or failed to do, how does the Reserve Bank's circular of 6 July
2017 on customer liability in unauthorised electronic banking transactions allocate the loss
between the customer, the bank and us?

Specifically: is an act of ours a "third party breach where the deficiency lies neither with the
bank nor with the customer", so that the customer's liability turns on how quickly they report
it? Or does the customer's grant of access to us fall within the limb where the customer bears
the entire loss? Does it matter that we never hold a credential, and that every payment is
performed by the customer on their own device?

Then: what may our customer terms lawfully provide about indemnity and a liability cap, and what
would be unenforceable against a consumer?

*Why it matters.* This is the commercial question underneath the whole product. We would like to
know what we are selling before we sell it, and our terms cannot be drafted until it is answered.

*What we have read.* The circular of 6 July 2017, paragraphs 6 and 7 and the limited-liability
table, through a mirror. We have found no authority applying it to a delegate the customer chose.

## 5. Part two: before we price the pilot, within thirty days

### Q6. Goods and services tax
The rate on a monthly consumer subscription supplied in India. Whether a supply to a resident of
the United Kingdom or the United States, billed from an Indian entity and paid in convertible
foreign exchange, is a zero-rated export under a letter of undertaking. Whether a service with a
human performing each task falls outside the definition of online information and database
access or retrieval services. *Read:* the Integrated Goods and Services Tax Act, sections 2(6),
2(17), 13(2) and 16, through a mirror. *Urgency:* we must tell a customer a price this month,
and we need to know whether the tax sits inside that number or on top of it.

### Q7. The script
Confirm that an employee who says "I am calling on behalf of Mr X, who has authorised me" and
never claims to be Mr X commits no offence of cheating by personation under section 319 of the
Bharatiya Nyaya Sanhita or section 66D of the Information Technology Act. Both, on our reading,
require cheating, meaning deception together with dishonest inducement. Please tell us the
sentences an employee must never say, and whether answering an institution's security question
on the customer's behalf changes the analysis. *Read:* both sections in full, through mirrors.

### Q8. Data protection
Confirm that we are a data fiduciary, and that we cannot be a consent manager because we read the
data (the First Schedule requires that a consent manager's sharing be "such that the contents
thereof are not readable by it"). What must be in place by the eighteen-month commencement, which
we read as May 2027? How real is the risk of a significant data fiduciary notification for a
consumer company holding this class of data at our scale, and what would it cost us? Confirm the
breach clock: to each affected principal without delay, and to the Board within seventy-two
hours. *Read:* the Act, sections 2, 8, 9, 10, 16, 33 and 44 and the Schedule, and the Rules,
rules 1, 4, 7, 10, 13 and 15 with the First Schedule, through mirrors.

### Q9. Payments
Confirm that a credential stored by us can never be the dynamically created or proven factor
required by the Authentication Mechanisms for Digital Payment Transactions Directions, 2025, so
that every payment must be performed by the customer on their own device. *Read:* the Reserve
Bank's press release of 25 September 2025 through a mirror; the Directions themselves only
through a professional firm's summary quoting the operative clauses.

### Q10. The rails
Whether an assistant that is not regulated has any route to account aggregator data other than
through a regulated financial information user. What onboarding as a DigiLocker requester
requires and how long it takes in practice. Whether the software profiles admitted to UPI Circle
by the addendum of 8 October 2025 are open to an applicant outside the current closed user group,
and what a payment service provider bank requires to sponsor one. *Read:* the Sahamati
redirection guidelines and the DigiLocker Requester API specification version 2.3 through
mirrors; the National Payments Corporation circulars only through secondary summaries quoting
them.

### Q11. The floor
Recording a call to which we are a party, where the other party is an institution's employee and
our customer has consented. And the position on women working night shifts in Karnataka following
the amendment assented on 3 September 2026, which we understand moved the detailed safeguards
into the state occupational safety rules. *Read:* press summaries only.

## 6. What we are not asking

No United Kingdom or United States law; we will come back for that when a cohort exists there.
No advice on the product, the market or the price. No drafting yet: once part 4 is answered we
will ask you to draft the customer mandate, the terms of service and the institution-facing
script, and we would rather do that once, against answers, than twice.

## 7. Practicalities

- Contact: [name], [email], [telephone].
- Entity: not yet incorporated. [Name of proposed vehicle], expected [date].
- Conflicts: please run a check against [Faff Technologies Private Limited] and [others to be
  listed]. We will disclose any prior or current employment of the founder that bears on this
  engagement before it begins.
- Fee: fixed for part 4, estimate for part 5. Please also tell us your hourly rate for follow-up
  questions, which there will be.
- Format: we would rather have five short answers with the reasoning stated than one long
  memorandum. Where the honest answer is that the position is untested, please say so and tell us
  what a regulator or a court would most likely do.
