---
description: Scope the session to one owner: their fragments under src/pages/, their decisions and their open items
---
The argument is a role id from `roles.json`, one of `ceo`, `cto`, `coo`, `cfo`, `counsel`: $ARGUMENTS

1. Run `node tools/build.mjs --role $ARGUMENTS` from the repository root and print its output verbatim. It lists the sections the role owns with the fragment under `src/pages/` that holds each, the decision records the role owns, the open items it owns with their triggers, and the sections it reads.
2. Scope the session to that list. Open only fragments on it, one at a time and only when the task needs them; a section outside it belongs to another owner, and a change there is discussed with that owner, named in `roles.json`, before it is made.
3. Ownership is changed only in `roles.json`; the role's page under `docs/roles/` is generated and is never edited. After any edit to `roles.json` or to a fragment: `node tools/build.mjs`, then `node tools/verify.mjs`.
