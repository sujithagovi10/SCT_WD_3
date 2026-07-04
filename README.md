# Tic Tac Toe

A fully functional Tic Tac Toe game built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies — just the DOM.

## Live features

- **2 Player mode** — pass-and-play on the same screen
- **Vs Computer mode** — with two difficulties:
  - **Easy** — mixes random moves with occasional smart play
  - **Unbeatable** — full minimax algorithm, cannot lose
- Winning line highlighting with animated marks
- Running scoreboard (X wins / O wins / draws)
- New Round and Reset Scores controls

## Files

- `index.html` — markup and layout
- `style.css` — dark, neon-accented board styling with SVG mark animations
- `script.js` — game state, click handling, win detection, and the minimax AI

## Run it

Just open `index.html` in a browser, or serve the folder with any static server:

```bash
npx serve .
```

## What this project demonstrates

- **DOM manipulation** — dynamically building the 9-cell grid, injecting SVG marks, toggling classes for win highlights
- **Event handling** — a single delegated `click` listener on the board reads `data-index` from whichever cell was clicked
- **Game state tracking** — a flat `board[]` array plus `currentPlayer` and `gameActive` flags drive every render
- **Win/draw detection** — checks all 8 possible lines (rows, columns, diagonals) against the board state
- **Game AI** — `minimax()` recursively scores every possible outcome so the computer plays optimally on Unbeatable difficulty
