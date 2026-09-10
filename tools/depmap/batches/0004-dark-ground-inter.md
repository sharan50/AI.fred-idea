# Batch 0004: a dark ground and Inter

Recorded 2026-09-10, the founder's direction after the first deploy of the
merged record: the paper look read as generic and unengaging, so the
publication moves to a dark theme, Inter as the prose face, and the diagrams
inverted with the ground. Two fixed decisions state the palette and the face,
so the change is run through the map.

## The change, as seeds, with the decision taken

| Change | The founder's decision | Seeds |
|--------|------------------------|-------|
| dark-theme | A dark ground: light ink on a near-black paper, the six token roles kept with new values, Inter for prose as one variable face, IBM Plex Mono kept for the data voice, and the diagrams inverted with the ground. DR-012 had rejected "A dark theme" as a second palette for no reader the brief names; the founder reverses that, and the publication has one look again, dark on screen, with print keeping the paper values so a PDF is still ink on white. | `dr-011`, `dr-012` |

## What was edited, by node

- `dr-012`: the standfirst, the decision, section 1.1 and Table D.1 (new
  values and the contrast each achieves), section 1.2 (Inter for prose), the
  rejected alternative "A dark theme" recording its reversal and the cost paid,
  and the status. `alt-dr-012-a-dark-theme` stays in the map as rejected in
  its own terms and reversed by the founder.
- `dr-011`: the decision's sentence on the six colours now names the founder's
  values of 2026-09-10; the status confirms the system held, since the change
  was new token values and new font files with no page touched for its look.
- `ledger-3`, the brief's binding visual section, is reopened by the change
  and left as the instruction set that produced the first edition, as with
  DR-017; DR-012 carries the revision.
- `obj-07-b`, the objection that amber fails AA as text, is overtaken: on the
  dark ground amber reads 9.6:1, and the rule that it is never text stands.
- Not a node, but the mechanism: `tokens.css` holds the dark values in the
  screen block the harness reads and the paper values in a print block that
  wins by specificity; `base.css` declares Inter as a variable face for latin
  and latin-ext, upright and italic, from `docs/assets/fonts` (OFL, licence
  beside the files), and IBM Plex Sans is removed; every page declares
  `color-scheme` dark and preloads Inter; the harness checks for the dark
  declaration; the served map view takes Inter and opens dark.
- The diagrams needed no edit: every figure colour is a token, so the
  inversion is the token file's.

## Contrast on the new ground (the harness's own formula)

| Token | Value | On paper | On paper-2 |
|-------|-------|----------|------------|
| ink | #EDE9E0 | 15.5:1 | 14.2:1 |
| ink-soft | #B5AE9F | 8.5:1 | 7.8:1 |
| accent | #F0785A | 6.7:1 | 6.2:1 |
| amber | #E2B347 | 9.6:1 | 8.8:1 |
| verified | #7CC48A | 9.0:1 | 8.3:1 |

Paper is #13120E, the second ground #1D1B16, the hairline #3B3831.

## Checks on the edited record

`check --warnings`: clean, 341 nodes, 574 edges, one warning (the
`refused-policy` near-collision, still open). `verify`: clean, 31 pages plus
the served view. `selftest`: clean. Headless renders of the index, a figure, a
decision record, the map page and a print-media page were inspected: the
fonts load from the assets directory, the diagrams read inverted with the
accent stroke intact, and print is ink on paper.

## The change, as the tool returned it before the edit

```
batch of 1 change: dark-theme

dark-theme: seeds dr-011, dr-012
  reopens dr-011  A visual token-and-component system [fixed]
  reopens dr-012  The design plan: an engineering dossier [fixed]
  alternative alt-dr-011-a-css-framework-utility-library  A CSS framework, utility library or UI kit
  alternative alt-dr-011-per-page-styling  Per-page styling
  alternative alt-dr-011-colours-defined-where-they-are  Colours defined where they are used, without a token file
  alternative alt-dr-011-a-design-tool-export  A design-tool export
  alternative alt-dr-012-the-first-draft-a-documentation  The first draft: a documentation-site skeleton
  alternative alt-dr-012-a-framework-a-ui-kit  A framework, a UI kit or a CSS library
  alternative alt-dr-012-heading-numbers-by-css-counters  Heading numbers by CSS counters
  alternative alt-dr-012-source-and-date-in-a  Source and date in a hover title only
  alternative alt-dr-012-a-dark-theme  A dark theme
  alternative alt-dr-012-the-one-permitted-moment-of  The one permitted moment of motion
  residual res-07-12  HM Treasury's consultation is verified in 00 and to-verify in 03
  open obj-07-b  Objection B: amber fails AA contrast as text
  open obj-07-c  Objection C: a stamp, not a chip, for document status

shared upstream (reopened by two or more changes)
  none

loci: 10 sections on 6 pages; "touched by" counts the changes whose closure reaches the section
   1 of 1  index.html#how-to-read                                       144  How to read this publication          vocab-status-words  (dark-theme)
   1 of 1  00-thesis/index.html#table:0.1                               157  Table 0.1                             res-07-12  (dark-theme)
   1 of 1  03-trust-and-data/index.html#uk-rails                        363  United Kingdom: Open Banking and the  res-07-12  (dark-theme)
   1 of 1  03-trust-and-data/index.html#table:3.4                       368  Table 3.4                             res-07-12  (dark-theme)
   1 of 1  decisions/dr-011-token-and-component-system.html#decision     61  Decision                              dr-011  (dark-theme)
   1 of 1  decisions/dr-011-token-and-component-system.html#closes-off    84  What this closes off                  inv-colours-only-in-tokens  (dark-theme)
   1 of 1  decisions/dr-012-design-plan.html#decision                    61  Decision                              dr-012  (dark-theme)
   1 of 1  decisions/dr-012-design-plan.html#status                     146  Status vocabulary at two levels       res-07-12, vocab-status-words  (dark-theme)
   1 of 1  decisions/dr-012-design-plan.html#closes-off                 171  What this closes off                  inv-status-agree  (dark-theme)
   1 of 1  decisions/index.html#ledger                                   60  The ledger                            dr-011, dr-012  (dark-theme)
```

## The change, as the tool returned it after the edit

```
batch of 1 change: dark-theme

dark-theme: seeds dr-011, dr-012
  reopens dr-011  A visual token-and-component system [fixed]
  reopens dr-012  The design plan: an engineering dossier [fixed]
  alternative alt-dr-011-a-css-framework-utility-library  A CSS framework, utility library or UI kit
  alternative alt-dr-011-per-page-styling  Per-page styling
  alternative alt-dr-011-colours-defined-where-they-are  Colours defined where they are used, without a token file
  alternative alt-dr-011-a-design-tool-export  A design-tool export
  alternative alt-dr-012-the-first-draft-a-documentation  The first draft: a documentation-site skeleton
  alternative alt-dr-012-a-framework-a-ui-kit  A framework, a UI kit or a CSS library
  alternative alt-dr-012-heading-numbers-by-css-counters  Heading numbers by CSS counters
  alternative alt-dr-012-source-and-date-in-a  Source and date in a hover title only
  alternative alt-dr-012-a-dark-theme  A dark theme
  alternative alt-dr-012-the-one-permitted-moment-of  The one permitted moment of motion
  residual res-07-12  HM Treasury's consultation is verified in 00 and to-verify in 03
  open obj-07-b  Objection B: amber fails AA contrast as text
  open obj-07-c  Objection C: a stamp, not a chip, for document status

shared upstream (reopened by two or more changes)
  none

loci: 10 sections on 6 pages; "touched by" counts the changes whose closure reaches the section
   1 of 1  index.html#how-to-read                                       144  How to read this publication          vocab-status-words  (dark-theme)
   1 of 1  00-thesis/index.html#table:0.1                               157  Table 0.1                             res-07-12  (dark-theme)
   1 of 1  03-trust-and-data/index.html#uk-rails                        363  United Kingdom: Open Banking and the  res-07-12  (dark-theme)
   1 of 1  03-trust-and-data/index.html#table:3.4                       368  Table 3.4                             res-07-12  (dark-theme)
   1 of 1  decisions/dr-011-token-and-component-system.html#decision     61  Decision                              dr-011  (dark-theme)
   1 of 1  decisions/dr-011-token-and-component-system.html#closes-off    84  What this closes off                  inv-colours-only-in-tokens  (dark-theme)
   1 of 1  decisions/dr-012-design-plan.html#decision                    61  Decision                              dr-012  (dark-theme)
   1 of 1  decisions/dr-012-design-plan.html#status                     146  Status vocabulary at two levels       res-07-12, vocab-status-words  (dark-theme)
   1 of 1  decisions/dr-012-design-plan.html#closes-off                 171  What this closes off                  inv-status-agree  (dark-theme)
   1 of 1  decisions/index.html#ledger                                   60  The ledger                            dr-011, dr-012  (dark-theme)
```
