# WORD HUNT

A calm, dark-mode word search game with **5,000 distinct campaign puzzles**, 20 vocabulary categories, five difficulty tiers, and a fresh deterministic daily challenge. Plain HTML, CSS, and JavaScript. No framework, build step, backend, runtime dependencies, analytics, fonts, images, or remote APIs.

## Play locally

Extract the ZIP and open `index.html` in a modern browser. The classic deferred scripts also work with `file://`; local saving on file URLs depends on browser policy. For consistent saving, use any static host or, optionally, run `python3 -m http.server 8000` from the extracted directory and visit `http://localhost:8000`.

After its local files have loaded, the running page needs no network access. An offline reload of a hosted page is not guaranteed; this release does not install a service worker. The downloaded project works offline.

## Publish to GitHub Pages

This is a new project for `melvinvarghese/word-hunt`. No files from any other game or repository are used.

1. Create or open the **word-hunt** repository.
2. Upload the **extracted contents** of this ZIP to the repository root. `index.html` must be directly at the root, beside `style.css`, `game.js`, and the other scripts. Do not upload only the ZIP or wrap the contents in an extra directory.
3. In the repository's **Settings → Pages**, select deployment from the `main` branch and the `/(root)` folder, then save.
4. After GitHub completes deployment, the intended address is `https://melvinvarghese.github.io/word-hunt/`.

The archive is ready to upload. No repository has been created, pushed, or deployed as part of delivering it. Every resource reference is relative, so the `/word-hunt/` path works. `.nojekyll` allows direct static publishing. The `tests/` directory can be omitted from hosting if desired; it is not loaded by the game.

## Controls and progression

- Mouse, touch, or stylus: press a letter, drag in a straight line, and release at the last letter. All eight directions and reverse selections work. The drag preview snaps to the nearest horizontal, vertical, or diagonal line. Only a full target word is accepted; a target within a longer selection is rejected. Legitimate alternate occurrences of a full word also count.
- Keyboard: Tab into the grid; arrows move the focused cell. Enter or Space starts a selection. Arrows move the endpoint, then Enter or Space submits. Escape cancels. A bent keyboard path is rejected. Tab out to reach other controls.
- Each completion unlocks the next level. The completion screen stays visible until a button is pressed. Previously unlocked levels can be replayed. **Continue playing** keeps your main campaign position when you replay earlier levels or visit the daily puzzle. **Start playing** opens level 1 without resetting anything.
- Pause stops the active timer. Leaving the tab or window pauses automatically. Turning the timer display off hides it; time still counts toward performance and completion records.
- Settings include timer visibility, reduced motion, instructions, version details, and a confirmed reset. System reduced-motion preferences are always respected. There is no sound.
- Word discoveries are indicated by both the grid colors and the crossed-off word list. Shared cells retain every found word's membership and gain an inset overlap marker.

## Difficulty schedule

| Levels | Tier | Grid | Target words |
| --- | --- | --- | --- |
| 1–40 | Beginner | 7 × 7 | 5 |
| 41–120 | Easy | 9 × 9 | 6 |
| 121–400 | Medium | 11 × 11 | 8 |
| 401–1200 | Hard | 13 × 13 | 10 |
| 1201–5000 | Expert | 15 × 15 | 13 |

Categories rotate every 20 levels: Animals, Nature, Food, Space, Science, Geography, Travel, Sports, Technology, Music, Art, History, Weather, Ocean, Plants, Everyday objects, Human body, School, Hobbies, and Professions. The local word bank has **1,621 category entries**; some appropriate words appear in more than one category. All targets use uppercase A–Z, with no spaces. Target words are curated; filler letters are random and can form incidental words.

## Hints, points, and coins

Start with **25 free coins**. Highlighting one letter costs **1 coin**. Revealing a word's starting location costs **3 coins**. Both choose an undiscovered target and highlight one cell in gold for four seconds; a live message also gives its row and column. Neither completes a word. You can always finish without spending coins.

Score = `max(100, wordCount × 100 + max(0, 600 − 2 × elapsedWholeSeconds) − 80 × hintsUsed)`.

Three stars: no hints. Two stars: one or two hints. One star: three or more hints. Best score, fastest completion, fewest hints, and best star rating are retained independently across replays.

| First-time completion | Coins |
| --- | --- |
| Any campaign or daily puzzle | 20 |
| No-hint bonus | +10 |
| Daily bonus | +30 |
| Daily streak bonus | +2 per consecutive day, capped at +14 |

Rewards and total accumulated score are claimed only once per campaign level or daily date. Replays improve personal bests but grant no new coins, even if the replay is faster or uses fewer hints. There are no purchases, subscriptions, accounts, leaderboards, or payments. As with any browser-only game, editing or clearing local data can change rewards; this is not a tamper-proof online economy.

## Daily puzzles and streaks

The puzzle key uses your device's **local date**, `YYYY-MM-DD`, plus generator version `1.0.0`. The same date and version always generate the same puzzle. A new date generates a new puzzle. Daily challenges are Medium difficulty. All players on the same local calendar date and version see the same board.

An ongoing daily retains the date on which it was opened, including across midnight. Finish it under that date; Home → Daily Challenge opens the new date. Completion and coin claims are stored once per date. A current streak includes today or, before today's completion, yesterday. Missing a full day breaks it. The best streak is the longest consecutive run in history. Calendar-day arithmetic is independent of daylight-saving changes. The device clock is trusted because there is no backend.

## Local saves and privacy

Progress is **local to this browser and origin and does not synchronize across devices**. Another browser, private window, domain, protocol, or local file origin can have a separate save. Clearing browser storage removes it. Nothing is transmitted to a service.

The versioned key is `word-hunt.save.v1`. Validated save data contains campaign position, highest unlocked level, completed level records, daily history, coins, total score, settings, and unfinished puzzle paths, elapsed time, and hints. Boards are regenerated, not stored. Up to 30 unfinished sessions are retained; active play and the main campaign position are protected during pruning. Daily and replay sessions stay separate.

Writes occur after discoveries, hints, progression, settings changes, navigation, pause, and page exit, plus a 15-second active-play checkpoint. Dragging does not cause storage writes. Invalid fields are sanitized; corrupt, missing, or incompatible data uses safe defaults. Denied or full storage shows a notice and allows in-memory play. Browser or device termination may lose time since the last checkpoint.

Reset requires a separate confirmation dialog and removes progress only for this game. Generator version mismatch deliberately discards incompatible saves. If extending this release, design a migration before changing the version or vocabulary/placement rules.

## Generator and validation

- Stable FNV-1a seed hash and Mulberry32 pseudorandom sequence.
- Seeds include game identity, generator version, and level or daily date.
- Deterministic target selection, direction selection, compatible overlaps, and filler letters.
- Up to six placement attempts, each with at most 400 candidate paths per word. Each retry has a derived seed and a fresh word selection.
- A seventh, deterministic fallback places targets on separate shuffled rows, with randomized forward/backward direction. Every target fits and no conflicting cells can be overwritten. No word is silently omitted. Grid sizes and counts stay within the difficulty schedule.
- Metadata includes ID, version, seed, category, difficulty, dimensions, target words, letter matrix, every solution path, direction vectors, attempt count, fallback flag, and a normalized grid-plus-sorted-target fingerprint.
- `validator.js` independently checks grid dimensions, A–Z letters, target counts, exact path text, straight direction, bounds, solution completeness, overlaps, and bounded-attempt diagnostics. Gameplay validates a regenerated board before displaying it.

Generated solution metadata is separate from mutable gameplay state. Saved discoveries store actual selected coordinates, so alternate occurrences and overlapping words remain highlighted correctly.

## Reproduce the tests

Only development-time tests use Node.js built-in modules. Players do not need Node, npm, or package installation.

```sh
node tests/test-generator.js
node tests/test-gameplay.js
node tests/test-package.js
```

`test-generator.js` generates, independently validates, and regenerates **all 5,000 levels**, checks exact equality, accepts every solution in both directions, and checks normalized fingerprints using SHA-256. It also validates 366 unique deterministic daily boards and verifies deliberately damaged puzzles are rejected. It writes `tests/generator-results.json` with actual timing and results.

`test-gameplay.js` covers eight-direction selection, reverse/exact matches, substring and invalid rejection, shared highlights, rewards, hints, progression, replay preservation, date rollover, streak gaps, leap days, year boundaries, save validation, corrupt/denied storage, and final-level bounds.

For browser layout checks, serve this directory and open `tests/browser-qa.html`. It runs the real game with an isolated in-memory save, all levels unlocked, selectable difficulty, and viewport widths of 320, 390, 768, and 1200 pixels. Test fixtures never read or write the production save. See `TEST-REPORT.md` for observed browser tests and remaining device coverage.

## File map

| File | Purpose |
| --- | --- |
| `index.html` | Accessible application shell and dialogs |
| `style.css` | Responsive dark theme and motion preferences |
| `game.js` | Screens, pointer/keyboard input, highlighting, timer, persistence hooks |
| `core.js` | Pure selection, save validation, score, reward, hint, and streak logic |
| `puzzle-generator.js` | Versioned deterministic generator and metadata |
| `word-bank.js` | Curated, category-based local vocabulary |
| `validator.js` | Independent puzzle validation |
| `favicon.svg` | Local vector brand icon |
| `tests/` | Reproducible Node tests, results, and isolated browser QA fixtures |
| `TEST-REPORT.md` | Validation results and browser coverage |

No generated boards need to be downloaded, fetched, or bundled individually. The compact generator produces all 5,000 actual configurations locally on demand.
