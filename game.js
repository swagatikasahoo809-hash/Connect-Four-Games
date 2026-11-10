const ROWS = 6;
const COLUMNS = 7;
const board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
const boardElement = document.querySelector('#game-board');
const turnMessage = document.querySelector('#turn-message');
const overlay = document.querySelector('#winner-overlay');
const winnerTitle = document.querySelector('#winner-title');
const winnerKicker = document.querySelector('#winner-kicker');
const resetButton = document.querySelector('#reset-button');
const playAgainButton = document.querySelector('#play-again-button');
let currentPlayer = 'red';
let gameOver = false;
let cells = [];

function renderBoard() {
  boardElement.replaceChildren();
  cells = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const cell = document.createElement('button');
      const player = board[row][column];
      cell.type = 'button';
      cell.className = `cell${player ? ` ${player}` : ''}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Row ${row + 1}, column ${column + 1}${player ? `, ${player}` : ', empty'}`);
      cell.disabled = gameOver;
      cell.addEventListener('click', () => dropDisc(column));
      boardElement.append(cell);
      cells.push(cell);
    }
  }
}

function dropDisc(column) {
  if (gameOver) return;

  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][column] !== null) continue;

    board[row][column] = currentPlayer;
    renderBoard();
    const winningCells = getWinningCells(row, column);

    if (winningCells) {
      gameOver = true;
      winningCells.forEach(([winRow, winColumn]) => {
        cells[winRow * COLUMNS + winColumn].classList.add('winning');
      });
      showResult(`${currentPlayer.toUpperCase()} WINS!`, `${currentPlayer} player wins`, currentPlayer);
      renderBoard();
      winningCells.forEach(([winRow, winColumn]) => {
        cells[winRow * COLUMNS + winColumn].classList.add('winning');
      });
      return;
    }

    if (board.every((boardRow) => boardRow.every((space) => space !== null))) {
      gameOver = true;
      showResult("IT'S A DRAW!", 'No spaces left', 'draw');
      renderBoard();
      return;
    }

    currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
    updateTurn();
    return;
  }
}

function getWinningCells(row, column) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [rowStep, columnStep] of directions) {
    const line = [[row, column]];
    line.push(...collectDirection(row, column, rowStep, columnStep));
    line.push(...collectDirection(row, column, -rowStep, -columnStep));
    if (line.length >= 4) return line;
  }

  return null;
}

function collectDirection(row, column, rowStep, columnStep) {
  const matchingCells = [];
  let nextRow = row + rowStep;
  let nextColumn = column + columnStep;

  while (
    nextRow >= 0 && nextRow < ROWS &&
    nextColumn >= 0 && nextColumn < COLUMNS &&
    board[nextRow][nextColumn] === currentPlayer
  ) {
    matchingCells.push([nextRow, nextColumn]);
    nextRow += rowStep;
    nextColumn += columnStep;
  }

  return matchingCells;
}

function showResult(title, kicker, result) {
  winnerTitle.textContent = title;
  winnerTitle.classList.toggle('yellow-winner', result === 'yellow');
  winnerTitle.classList.toggle('draw-result', result === 'draw');
  winnerKicker.textContent = kicker;
  turnMessage.textContent = result === 'draw' ? 'Game ended in a draw' : `${result[0].toUpperCase()}${result.slice(1)} wins`;
  overlay.hidden = false;
  playAgainButton.focus();
}

function updateTurn() {
  turnMessage.textContent = `${currentPlayer[0].toUpperCase()}${currentPlayer.slice(1)}'s turn`;
}

function resetGame() {
  for (const row of board) row.fill(null);
  currentPlayer = 'red';
  gameOver = false;
  overlay.hidden = true;
  renderBoard();
  updateTurn();
}

resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', resetGame);
renderBoard();
updateTurn();
