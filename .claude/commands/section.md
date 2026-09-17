---
description: Print a page's manifest summary and open only the fragment that holds one section
---
The argument is `<page>#<anchor>`, with the page written as `manifest.json` writes it, for example `03-trust-and-data/index.html#threat-model`: $ARGUMENTS

1. Print the page's entry from `manifest.json`: title, status, summary, updated. Read only that entry.
2. Find the fragment. If `src/pages/<page minus .html>/` exists, run `grep -l 'id="<anchor>"' src/pages/<page minus .html>/*.html` and take the fragment named for the `h2`; an `h3` anchor sits inside its `h2`'s fragment. Otherwise the page is one file, `src/pages/<page>`, and the section is the `<section>` whose `h2` carries the id.
3. Print the fragment's path and its prose word count: `node -e "import('./tools/build.mjs').then(b => console.log(b.words(require('fs').readFileSync('<fragment>', 'utf8'))))"`.
4. Open that fragment and nothing else. Do not open `docs/`, and do not open a neighbouring fragment unless the task names it.
