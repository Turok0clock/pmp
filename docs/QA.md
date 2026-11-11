# Verification record

11 November 2026 · initial release

## Automated checks passed

- JavaScript syntax checks for the application, content, learning engine and service worker.
- 12 Node tests: content IDs/provenance, all answer keys, all grading forms, empty-answer handling, first/latest score separation, baseline exclusion, spacing, early practice, lesson enrollment, interleaving, backup round-trip/rejection, and offline asset existence.
- Isolated Chromium browser on Windows: complete first-lesson journey, required participation gates, pre-test handling, self-explanation, rubric, categorization, scenario feedback, mistake classification and delayed mini-exam feedback.
- Progress and explanation persistence across reload.
- A later mini-exam includes a previous completed concept.
- Matching and button-based ordering grade correctly.
- Constraint diagram changes its explanation when selected.
- Early correct practice retains the existing review due time.
- JSON backup download, invalid backup rejection and successful restore.
- Network-disabled navigation to a previously unopened lesson; terminology grading and progress survive offline reload.
- Corrupt saved data remains preserved and displays recovery guidance.
- No uncaught browser JavaScript errors during the flow.
- Dashboard at 1366, 1180, 820 and 390 CSS pixels: no page-level horizontal overflow. Screenshots visually inspected; iPad portrait uses top navigation rather than a narrow sidebar.

The automated browser script is `tests/browser.mjs`. Set `BROWSER_PATH` and `TEST_URL` for other development environments. It uses a separate temporary profile and does not touch the learner's browser data. Screenshots and synthetic test backups stay in ignored `.qa/` and are not included in the repository publication.

## Manual / primary-device checks still required

- Actual iPad Safari and Add to Home Screen installation were not available for physical-device testing.
- Device speech voices are platform-dependent. Text-to-speech is implemented with visible controls and a transcript, but audible playback and offline voice availability must be checked on the travel device.
- Browser storage can be evicted. A successful test is not a guarantee against later eviction; use the app's backup feature.
- No full-course video or paid PMI material was reviewed. Mapping and 2026 structure were checked against public primary-source pages; original lesson prose is not claimed to be PMI-endorsed.

## Run locally

```sh
npm install
npm run check
npm test
npm start
```

With a Chromium executable installed, run the browser script in a second terminal using the preview URL printed by `npm start`. Its default test URL uses port 4174; set `TEST_URL` if the server uses 4173. The runtime app has no third-party JavaScript or CSS dependencies.
