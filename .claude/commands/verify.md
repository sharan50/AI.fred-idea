---
description: Build, verify and check the dependency map; print failures verbatim; fix nothing unless asked
---
Run these three commands from the repository root, in this order, and print each command's output verbatim:

    node tools/build.mjs
    node tools/verify.mjs
    node tools/depmap.mjs check

If anything fails, list the failures exactly as printed, `file:line message`, grouped by command, and stop.

Fix nothing unless the task asks for a fix. When it does: edit the source under `src/pages/`, or `tools/depmap/graph.json` for a map failure, never a page under `docs/`; then run the three commands again and print their output.
