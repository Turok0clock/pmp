# PMP Learning Lab

A light, colorful, iPad-friendly learning companion for project management. The first module implements **11 micro-lessons covering the 14 Project Management Terms lectures**, with **66 original scored prompts**. Later course sections are clearly marked as planned.

The public [Udemy course outline](https://www.udemy.com/course/pmp_cram_course/) supplies the instructional spine. The [2026 PMI exam framing](https://www.pmi.org/certifications/project-management-pmp/new-exam) and [PMBOK Guide Eighth Edition](https://www.pmi.org/standards/pmbok) supply separate reference structures. Course mapping was checked on 11 November 2026. Local teaching, examples, diagrams and questions are original and are not official PMI exam items.

## Use

1. Open the hosted site in Safari while connected.
2. Use Share → Add to Home Screen, then open the Home Screen app online.
3. Wait for **Ready offline**, and verify the library in Settings.
4. Turn on Airplane Mode and reopen before traveling.
5. Export progress regularly from Settings, especially before moving devices or browsers.

The entire lesson library, answer keys, feedback and progress run locally. Udemy videos and external sources are not bundled. Narration uses the device speech engine; install a device voice and test it offline. Speech availability varies by platform; the complete reading is always available.

## Learning pattern

Preview → optional pre-test → visual reading / course viewing → terminology recall and self-explanation → relationship exercise → scenario decision → mini-exam → mistake reflection → spaced retrieval.

- **Knowledge:** name and explain ideas.
- **Systems:** reconstruct relationships.
- **Judgment:** choose a contextual action and understand its implications.
- MCQ, multi-select, matching, ordering, categorization, scenario decisions and typed terminology.
- Touch and keyboard controls; no drag-only interactions.
- First attempts stay visible separately from latest performance; baseline pre-tests are excluded.
- Missed prompts return in 10 minutes; correct prompts initially return after a day. Successful due reviews advance to 3, 7, 14 and 30 days. Guessing stays at a day. Early practice does not advance intervals.
- Mixed reviews alternate lessons where possible. Mini-exams add a prompt from a previously completed lesson.
- Free-text explanations use an explicit self-review rubric, **not** automated semantic grading.

## Host on GitHub Pages

This is a buildless static app, suitable for `https://<owner>.github.io/pmp/` or a custom domain. All runtime assets use relative URLs.

In the repository’s **Settings → Pages**, select **Deploy from a branch**, then **main / (root)**. The `.nojekyll` file keeps the static layout intact. The repository must have Pages enabled before a site URL is usable. No Sites service or application server is required.

The service worker caches the complete runtime and scopes its cache names to this app, so it does not clear sibling GitHub Pages apps. An updated worker waits; use Settings → Check for app update, then apply it. Change `VERSION` in `sw.js` whenever runtime files change.

## Local development

Node 20+ is sufficient; there are no runtime dependencies.

```sh
npm start
npm run check
npm test
```

Open the URL printed by the server. It also serves a `/pmp/` subpath to verify GitHub project-page behavior. Opening `index.html` as a filesystem URL is not supported; module scripts and service workers require HTTP(S).

Browser acceptance checks use Playwright and a locally available Edge or Chromium executable. See `tests/browser.mjs`. These are development-only dependencies and are not shipped to learners.

## Files and extension points

- `content.js`: lesson data, question bank, glossary, roadmap and source register.
- `engine.js`: pure grading, scheduling, interleaving, first/latest scoring and backup validation.
- `app.js`: navigation, local persistence, accessible exercise renderers and narration.
- `styles.css`: light purple, coral and teal palette inspired by PMI; no copied PMI logo or claim of affiliation.
- `sw.js`: atomic app-shell precache, scoped cleanup, cache verification and explicit update activation.
- `docs/MASTER_ARCHITECTURE.md`: reusable lesson contract and module sequencing.
- `docs/SOURCES.md`: provenance and framing decisions.
- `docs/QA.md`: automated and manual acceptance evidence and remaining device checks.

## Data and limitations

No account, analytics, cloud synchronization or server-side scoring. `localStorage` contains notes, answers and review schedules for this browser/origin. Browser eviction and private browsing can remove data; exports are the durable backup. A malformed backup is rejected before replacement. Corrupt saved data is preserved for recovery rather than overwritten. Imports export the previous state before replacing it.

No claim of exam readiness, contact hours, PDUs or PMI endorsement. The course’s title does not establish training-credit eligibility. This first release focuses on foundational learning; it does not reproduce the full course, paid PMBOK content or Study Hall items.
