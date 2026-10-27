# WORD HUNT — test report

Tested on 27 October 2026. Generator/game version: **1.0.0**.

## Automated puzzle verification

Actual results from `node tests/test-generator.js`, using Node v24.22.1 on Linux:

| Check | Result |
| --- | --- |
| Campaign levels generated | 5,000 |
| Independently validated campaign levels | 5,000 |
| Unique normalized puzzle fingerprints | 5,000 |
| Duplicate configurations | 0 |
| Levels regenerated and compared for exact equality | 5,000 |
| Distinct placement directions observed | 8 |
| Boards with compatible word overlaps | 2,500 |
| Deterministic daily boards validated | 366 |
| Unique daily configurations in that sample | 366 |
| Curated vocabulary entries across 20 categories | 1,621 |
| Maximum placement attempts observed | 2 of a bounded 7 |
| Fallback invocations observed | 0 |
| Campaign generation, validation, solution checks, hashing, and repeat-generation time | 1,142 ms |
| Whole generator test time | 1,187 ms |

These timings describe this run and machine, not a browser performance guarantee. Detailed machine-readable results are in `tests/generator-results.json`. The fallback is bounded and guarantees row-wise placement by construction; it was not reached during this 5,000-level run. The uniqueness claim is for full grid-plus-target-list configurations, not for non-repeating individual target words.

The independent validator also rejected intentionally damaged letter grids, out-of-bounds coordinates, missing target solutions, extra targets, and invalid direction vectors.

## Automated gameplay and package verification

**14 gameplay/state test groups passed**:

1. Exact forward/reverse selection and duplicate discovery rejection.
2. Substring, overlong, bent, empty, repeated-cell, and malformed selection rejection.
3. All eight straight directions.
4. Overlapping words retain separate coordinate paths.
5. An incomplete puzzle cannot finish.
6. First-completion score/rewards, stars, unlocks, no repeated reward, and campaign position preservation during replay.
7. Both hint types, coin costs, no automatic discovery, affordability, and score/star penalties.
8. Daily date determinism, rollover, reward bonuses, and one claim per date.
9. Consecutive-day streaks, grace until today's completion, missed days, leap days, and year changes.
10. Local calendar date formatting.
11. Save round trip, separate daily/campaign sessions, and invalid saved-path rejection.
12. Missing, corrupt, incompatible, denied, and quota-failing storage.
13. Validation of malformed save fields and settings.
14. Final level progression stays within 1–5000.

The package check passed: all seven runtime resource references resolve locally, all JS parses, shared modules work as classic browser globals without CommonJS, no runtime network APIs are used, the isolated browser test fixture references resolve, and `.nojekyll` exists.

## Browser checks performed

A Chromium desktop browser was used for actual interaction. Narrow widths were tested using same-browser iframe viewports, **not physical phones**.

| Flow | Observed result |
| --- | --- |
| Home → Start Playing | Beginner board and target list rendered |
| Mouse drag along WOLF | One target found and progress updated |
| Enter/arrow-key selection of backwards OTTER | Exact target found by keyboard |
| Vertical/reverse KOALA and LYNX selections, HAWK drag | All five words discovered; completion stayed on screen |
| Completion | Three stars, elapsed time, score, and +30 first-completion coins shown |
| Next Level | Level 2 unlocked and playable |
| Reveal a start | Deducted 3 coins; hint count increased without finding a word |
| Pause | Modal displayed and timer paused |
| Reload and Continue | Completed level, 52 remaining coins, level 2, elapsed time, and one used hint restored |
| Browser difficulty filter | Expert category returned 3,800 matching levels |
| Search level 5000 | One matching Expert level, correctly marked locked |
| Reset dialog → Keep my progress | Explicit confirmation shown; cancellation preserved progress |
| Beginner at 390-pixel iframe width | Square grid and wrapped word list; no horizontal overflow |
| Expert at 390 and 320-pixel iframe widths | 225 cells, readable grid, wrapped target list; no horizontal overflow |
| Expert at narrowest width | 14 px letters; square 253 px board in a 305 px content viewport (scrollbar consumes 15 px) |
| Reduced-motion setting | Body motion override applied |
| Timer visibility setting | “Timer hidden” shown while completion time remains tracked |

Level search was improved during browser testing to filter on input with a short debounce, rather than waiting for a field change. The final version returned the correct level 5000 result.

## Coverage limits and follow-up device checks

Physical touch/stylus input, mobile Safari, desktop Safari, Firefox, and Edge were not executed in this environment. Pointer Events and capture provide the shared input path, but actual touchscreen and cross-browser testing remains necessary before claiming a full device certification. The browser checks exercised mouse and keyboard input; independent state tests are not a substitute for physical-device input tests.

The following manual regression steps can be repeated with `tests/browser-qa.html` on a static server, or with the game itself on a device:

- At each tier, find forward, reverse, vertical, and diagonal words. Test invalid and duplicate selections.
- Drag outside the grid, cancel with Escape, interrupt a touch gesture, and return after switching apps; ensure no stale selection or double discovery.
- Find overlapping words in either order and confirm both remain marked.
- Verify normal page scrolling outside the grid and no scrolling during a grid drag.
- Replay a completed level and a completed daily; verify no repeat coin grant and preserve the campaign position.
- Complete a daily, revisit after midnight, and test missed-day behavior with a disposable browser profile. Automated streak tests cover the calendar arithmetic without altering the device clock.
- Deny storage or use a full/private store; ensure the notice appears and gameplay continues.
- Check a screen reader, focus order, arrow-key grid controls, OS reduced motion, and browser zoom.

The fixture uses an isolated in-memory save, unlocks all levels, and resets on reload. It does not change production progress. It can be left out of a public deployment.

## Delivery

The ZIP contains the complete static source, documentation, tests, and actual test results. `index.html` is at archive root. Preview-only files and configuration, browser saves, credentials, dependencies, and generated test boards are excluded. GitHub upload and publication have not been performed.
