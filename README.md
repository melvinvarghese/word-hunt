# Word Hunt

A calm, dark-mode word search game with **5,000 campaign puzzles**, 20 vocabulary categories, five difficulty tiers, and a deterministic daily challenge. Built with plain HTML, CSS, and JavaScript; no backend or runtime dependencies.

**[Play Word Hunt](https://melvinvarghese.github.io/word-hunt/)**

## Play locally

Open `index.html` in a modern browser. For consistent local saving, serve the project directory:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls and progression

- Use a mouse, touch, or stylus to select a word in a straight line in any of eight directions. Reverse selections work.
- With a keyboard, Tab to the grid, use arrows to move, and Enter or Space to start and submit a selection. Escape cancels.
- Completing a level unlocks the next one. Replays do not reset campaign progress.
- Pause stops the timer. Reduced-motion preferences are respected.
- Daily puzzles are deterministic for the device's local date and generator version.

## Local saves and privacy

Progress is stored in this browser and does not sync across devices. Clearing browser storage removes it. Nothing is transmitted to a service. Resetting progress requires confirmation.

## Tests

Players do not need Node.js. To run the development tests with Node.js:

```sh
node tests/test-generator.js
node tests/test-gameplay.js
node tests/test-package.js
```

For browser checks, serve the project and open `tests/browser-qa.html`. See [TEST-REPORT.md](TEST-REPORT.md) for coverage and limitations.
