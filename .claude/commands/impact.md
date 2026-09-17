---
description: Run the dependency map's impact query and turn the closure into an edit plan over src/pages/
---
Run `node tools/depmap.mjs impact $ARGUMENTS` from the repository root and read its output in full. Do not open any page yet.

Then write the edit plan:

1. The header first. If REOPENS lists a ledger item or a decision record, say so at the top of the plan: reopening a fixed decision is the founder's call, and the plan stops there unless the task says the founder has taken it.
2. For every locus in the LOCI list, name the fragment that holds it. A locus `<page>#<anchor>` lives in `src/pages/<page minus .html>/NNN-<h2 id>.html` when the page is split (list the directory to find `NNN`; an `h3` anchor lives in the fragment of its parent `h2`, found with `grep -l 'id="<anchor>"' src/pages/<dir>/*.html`), or in `src/pages/<page>` when the page is one file.
3. Order the fragments: canonical loci first, then restates and partial, then mentions; within a role, publication order, which is manifest order and then line number.
4. Print the plan as a checklist, one line per locus: fragment path, the locus and its role, the node, and the edge path that put it in the cone.
5. Save the closure under `tools/depmap/batches/NNNN-<slug>.md`, using the next free number, with the seeds that produced it.

When the edit begins, open only the fragments on the plan, one at a time. Never open a page under `docs/`; the build writes those.
