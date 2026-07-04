'use strict';

// ---------- Game state ----------
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');
const scoreOLabelEl = document.getElementById('scoreOLabel');

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

let board = Array(9).fill(null);   // 'X' | 'O' | null
let currentPlayer = 'X';
let gameActive = true;
let mode = 'pvp';                  // 'pvp' | 'pvc'
let difficulty = 'hard';           // 'easy' | 'hard'
let scores = { X: 0, O: 0, draw: 0 };

const HUMAN = 'X';
const COMPUTER = 'O';

// ---------- Build the 9 cells once ----------
function buildBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    boardEl.appendChild(cell);
  }
}

// ---------- SVG marks ----------
function markSVG(symbol) {
  if (symbol === 'X') {
    return `<svg viewBox="0 0 100 100">
      <path class="mark-path" d="M20,20 L80,80" />
      <path class="mark-path" d="M80,20 L20,80" />
    </svg>`;
  }
  return `<svg viewBox="0 0 100 100">
    <path class="mark-path" d="M50,15 a35,35 0 1,0 0.1,0" />
  </svg>`;
}

// ---------- Rendering ----------
function render() {
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    const value = board[i];
    cell.classList.toggle('filled', !!value);
    cell.classList.remove('x', 'o');
    if (value === 'X') {
      cell.classList.add('x');
      cell.innerHTML = markSVG('X');
    } else if (value === 'O') {
      cell.classList.add('o');
      cell.innerHTML = markSVG('O');
    } else {
      cell.innerHTML = '';
    }
  });
  updateStatus();
}

function updateStatus(customMessage) {
  if (customMessage) {
    statusEl.innerHTML = customMessage;
    return;
  }
  const turnClass = currentPlayer === 'X' ? 'turn-x' : 'turn-o';
  const label = mode === 'pvc' && currentPlayer === COMPUTER ? "Computer's turn" : `Player ${currentPlayer}'s turn`;
  statusEl.innerHTML = `<span class="${turnClass}">${label}</span>`;
}

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

// ---------- Win / draw checking ----------
function findWinner(currentBoard) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
      return { winner: currentBoard[a], line };
    }
  }
  if (currentBoard.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return null;
}

function highlightWin(line) {
  line.forEach(i => {
    boardEl.children[i].classList.add('win-cell');
  });
}

// ---------- Handling a move ----------
function playMove(index, player) {
  if (!gameActive || board[index] !== null) return false;

  board[index] = player;
  render();

  const result = findWinner(board);
  if (result) {
    gameActive = false;
    boardEl.classList.add('locked');

    if (result.winner === 'draw') {
      scores.draw++;
      updateStatus(`<span class="win-msg">It's a draw!</span>`);
    } else {
      scores[result.winner]++;
      highlightWin(result.line);
      const winnerLabel = mode === 'pvc' && result.winner === COMPUTER ? 'Computer' : `Player ${result.winner}`;
      updateStatus(`<span class="win-msg">${winnerLabel} wins! 🎉</span>`);
    }
    updateScoreboard();
    return true;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
  return true;
}

// ---------- Click handling (event delegation) ----------
boardEl.addEventListener('click', (event) => {
  const cell = event.target.closest('.cell');
  if (!cell || !gameActive) return;

  const index = Number(cell.dataset.index);
  if (board[index] !== null) return;

  // In PvC mode, block clicks during the computer's turn
  if (mode === 'pvc' && currentPlayer !== HUMAN) return;

  const moved = playMove(index, currentPlayer);

  if (moved && gameActive && mode === 'pvc' && currentPlayer === COMPUTER) {
    boardEl.classList.add('locked');
    setTimeout(computerMove, 450); // small delay feels more natural
  } else {
    boardEl.classList.remove('locked');
  }
});

// ---------- Computer AI ----------
function computerMove() {
  if (!gameActive) return;

  const emptyCells = board.reduce((acc, v, i) => (v === null ? [...acc, i] : acc), []);
  if (emptyCells.length === 0) return;

  let choice;
  if (difficulty === 'easy') {
    // Easy: mostly random, but still blocks an immediate loss sometimes
    choice = Math.random() < 0.5
      ? findBestMove()
      : emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else {
    // Unbeatable: full minimax
    choice = findBestMove();
  }

  playMove(choice, COMPUTER);
  boardEl.classList.remove('locked');
}

function findBestMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = COMPUTER;
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(currentBoard, depth, isMaximizing) {
  const result = findWinner(currentBoard);
  if (result) {
    if (result.winner === COMPUTER) return 10 - depth;
    if (result.winner === HUMAN) return depth - 10;
    return 0; // draw
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = COMPUTER;
        best = Math.max(best, minimax(currentBoard, depth + 1, false));
        currentBoard[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = HUMAN;
        best = Math.min(best, minimax(currentBoard, depth + 1, true));
        currentBoard[i] = null;
      }
    }
    return best;
  }
}

// ---------- Round / score reset ----------
function newRound() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  boardEl.classList.remove('locked');
  render();
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
}

document.getElementById('newRoundBtn').addEventListener('click', newRound);
document.getElementById('resetScoresBtn').addEventListener('click', resetScores);

// ---------- Mode & difficulty toggles ----------
const modeGroup = document.getElementById('modeGroup');
const difficultyGroup = document.getElementById('difficultyGroup');

modeGroup.addEventListener('click', (event) => {
  const btn = event.target.closest('.toggle-btn');
  if (!btn) return;

  modeGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  mode = btn.dataset.mode;
  difficultyGroup.style.display = mode === 'pvc' ? 'flex' : 'none';
  scoreOLabelEl.textContent = mode === 'pvc' ? 'Computer' : 'Player O';

  resetScores();
  newRound();
});

difficultyGroup.addEventListener('click', (event) => {
  const btn = event.target.closest('.toggle-btn');
  if (!btn) return;

  difficultyGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  difficulty = btn.dataset.difficulty;
  newRound();
});

// ---------- Init ----------
buildBoard();
render();
updateScoreboard();
