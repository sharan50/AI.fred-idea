# AI.fred task cost measurement protocol

**Purpose.** To replace three estimated numbers with three measured ones, at a cost of about a week of one person's time and a few hundred dollars of API spend, before any floor is leased or any engine is chosen.

The three numbers are:

1. **AI-only completion rate**, by task type, scored on real attempts rather than predicted from a description.
2. **Human minutes per assisted task**, including wrap, with hold and IVR time recorded separately.
3. **Average handling time on human-led tasks**, which is the number that dominates headcount despite being the smallest share of volume.

Everything else in the unit model is an assumption you already hold. These three are the ones that decide whether the ratio is 1:30 or 1:14.

---

## 1. Why the rubric is built this way

The failure mode this protocol exists to avoid is classification by plausibility. A task described as "book a restaurant" looks automatable, so it gets counted as automatable, and the AI-executable share comes out inflated. The correction is positive evidence: a task counts as AI-only when an agent actually completed it and the output passed a stated acceptance test, and not otherwise.

Two consequences follow. First, no task is scored before it has been attempted. Second, the acceptance artifact is defined in advance, in the task row, and it is external. A confirmation number, a booking reference, an institutional acknowledgement. A model asserting that it has finished is not evidence that it has.

---

## 2. Tiers

Every run resolves to exactly one of five outcomes.

| Tier | Definition | Human time |
|---|---|---|
| **AI-only** | Agent reached the acceptance artifact with no human action of any kind | Zero |
| **Assisted** | Agent did the bulk; a human executed one or more bounded steps it could not | Recorded |
| **Human-led** | A human owned the task from planning through completion, with the AI supporting | Recorded |
| **Bounced** | Completion required an act only the user can perform (OTP, biometric, wet signature, in-person identification) | Recorded, usually small |
| **Failed** | No acceptance artifact, and not because of a bounce | Recorded |

**Bounced is deliberately separate from Human-led.** A bounce costs almost no labour and therefore barely moves headcount, but it is the outcome that spends the product promise, because the user is handed the task back. Modelling it inside Human-led hides the cost in the wrong place; modelling it inside AI-only flatters the automation share. Keep it in its own column and watch it as a product metric, not a cost metric.

A run that bounces once and then completes is scored on the work that surrounded the bounce, with the bounce logged in the bounce column. Bounce count and tier are independent fields.

---

## 3. Timing definitions

These definitions are the whole of the measurement, so they need to be applied identically on every run.

- **Human active minutes.** Time the worker is doing the step: talking, typing, deciding.
- **Wrap minutes.** Time loading context before the step and verifying, recording and closing after it. Typically one to three minutes and routinely omitted from estimates, which is why it is a separate column.
- **Hold and IVR minutes.** Time spent waiting: menu navigation, queue, transfer. Recorded separately because it is the segment most cheaply removed by engineering. If the system dials, navigates the tree, waits and hands over a connected call, this column drops out of the labour model entirely. The workbook has a switch to model both cases.

Start and stop a timer per segment. Do not reconstruct times afterwards from memory; reconstructed times are consistently short.

---

## 4. The task set

Thirty tasks, stratified across the mix you intend to serve, ten in each expected tier. Expected tier is a prediction recorded before the run; observed tier is the result. The gap between the two columns is itself a finding.

**Expected AI-only:** restaurant shortlist with reasons; mobile plan comparison; spend categorisation and anomalies; purchase research within a budget; gift options for an occasion; complaint letter to an airline; a costed outing plan; visa requirements and document checklist; insurance policy explained with exclusions; flight and hotel shortlist.

**Expected assisted:** phone-only table reservation; dentist appointment in a stated window; return with home pickup; delivery reschedule; refund chase past its window; airport transfer for a specific flight; three rental viewings scheduled; subscription cancellation with a retention flow; repeat grocery order with substitutions; booking confirmation with dietary requirements.

**Expected human-led:** bank KYC refresh; passport renewal form and appointment; visa application pack and slot; health insurance claim and first follow-up; hospital admission coordination; rent agreement registration; income tax notice response; pension life certificate or deposit renewal; lost SIM replacement or number port; change of address across five institutions.

The full list with acceptance artifacts is pre-loaded in the workbook's Capture sheet.

---

## 5. Run protocol

**Runs per task.** Three, on three different counterparties where the task allows it. One run tells you nothing about variance, and variance across counterparties is the thing that decides whether a workflow generalises. Record the average and note the spread where it is wide.

**Harness.** Any off-the-shelf agent with browser access. The point is to measure the shape of the work, not to evaluate a specific engine. Hold the harness constant across all thirty tasks so the comparison between task types is clean.

**Instrumentation.** Capture input tokens, output tokens, tool call count and wall clock per run. Most harnesses report the first three; if yours does not, proxy tokens from the transcript length and say so.

**Who runs it.** You, for the first pass. A second operator on a subset of ten tasks tells you how much of the measured time is operator skill rather than task difficulty.

---

## 6. The learning curve sub-test

The claim that human handling time falls with practice is central to the operating model and is testable cheaply. Pick the four highest-volume assisted task types. Have one operator run each twenty times against different counterparties, recording handling time on every run.

Compare the mean of runs one to five with the mean of runs sixteen to twenty. Two outcomes matter:

- Handling time roughly halves and is still falling at run twenty. The practice argument holds, and the operating model can lean on it.
- Handling time flattens at sixty to seventy per cent of the first attempt by run ten. Practice is real but bounded, and the model must assume the floor rather than the slope.

Whichever it is, the workflows discovered during those twenty runs are the specification for what to encode. That is the real output of this sub-test.

---

## 7. Decision thresholds

Set these before you see the data, so the result is read rather than negotiated.

| Measured result | What it means | What changes |
|---|---|---|
| AI-only share below 25 per cent | The cheap tier is thinner than assumed; the assisted tier absorbs the difference | Headcount rises; re-price or reduce the task promise |
| Assisted minutes above 10 including wrap | The two-to-ten-minute band does not hold in practice | Automate hold and IVR first; re-run the model with the switch off |
| Human-led AHT above 45 minutes | The tail dominates labour | Meter complex tasks explicitly rather than bundling them |
| Bounce rate above 25 per cent on human-led tasks | The promise is not delegation, it is preparation | Rewrite the positioning before the raise, not after |
| Users per generalist below 15 | The 1:30 ratio is wrong by a factor of two | The seed narrative and the pricing both need rebuilding |

---

## 8. Practical and legal cautions

Run the measurement set against **your own accounts and your own identity only**. Speaking to an institution as another person, even a consenting friend, is the exact exposure flagged in the review under Indian, UK and US law, and it is not worth incurring for a measurement exercise.

Where a task involves a live institutional line, be straightforward about who is calling. Where it involves recording, note that several jurisdictions require all-party consent, and the measurement does not need recordings; timestamps are enough.

Do not use task data, task taxonomies or automation classifications drawn from any other company's systems in this exercise. The findings need to be yours, both because a diligence process will ask and because a borrowed benchmark from a differently-shaped service would mislead you anyway.

---

## 9. What comes out of it

A filled Capture sheet gives you, per task type and in aggregate: automation share on positive evidence, human minutes split into active, wrap and hold, token cost per task, and bounce rate. The model turns those into required headcount, users per generalist, cost per task and gross margin, and the sensitivity grid shows how far the answer moves when the two dominant variables move.

That is the evidence base for the engine research you wanted to run, because it tells you which capability differences between candidate engines are worth paying for, in rupees per task, rather than in the abstract.
