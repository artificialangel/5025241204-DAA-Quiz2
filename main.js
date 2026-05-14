const BLANK = 0;
const WALL = 1;
const START = 2;
const END = 3;
const SOLUTION = 4;

const SIZE = 5;
const MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
  START: 'start',
  END: 'end'
};

let mode = MODES.DRAW;
let board = [
  [START, BLANK, BLANK, BLANK, BLANK],
  [BLANK, BLANK, BLANK, BLANK, BLANK],
  [BLANK, BLANK, BLANK, BLANK, BLANK],
  [BLANK, BLANK, BLANK, BLANK, BLANK],
  [BLANK, BLANK, BLANK, BLANK, END]
];

const mazeGrid = document.getElementById('mazeGrid');
const statusBox = document.getElementById('status');
const toolButtons = {
  draw: document.getElementById('drawBtn'),
  erase: document.getElementById('eraseBtn'),
  start: document.getElementById('startCellBtn'),
  end: document.getElementById('finishCellBtn')
};

function makeEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(BLANK));
}

function setMode(newMode) {
  mode = newMode;

  Object.values(toolButtons).forEach(button => button.classList.remove('active'));

  if (newMode === MODES.DRAW) toolButtons.draw.classList.add('active');
  if (newMode === MODES.ERASE) toolButtons.erase.classList.add('active');
  if (newMode === MODES.START) toolButtons.start.classList.add('active');
  if (newMode === MODES.END) toolButtons.end.classList.add('active');
}

function renderBoard() {
  mazeGrid.innerHTML = '';

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.setAttribute('aria-label', `Row ${y + 1}, Column ${x + 1}`);

      const value = board[y][x];
      if (value === WALL) cell.classList.add('wall');
      if (value === START) {
        cell.classList.add('start');
      }
      if (value === END) {
        cell.classList.add('end');
      }
      if (value === SOLUTION) cell.classList.add('solution');

      cell.addEventListener('click', () => handleCellClick(x, y));
      mazeGrid.appendChild(cell);
    }
  }
}

function handleCellClick(x, y) {
  clearSolutionPath();
  statusBox.textContent = '';

  if (mode === MODES.DRAW) {
    if (board[y][x] !== START && board[y][x] !== END) board[y][x] = WALL;
  }

  if (mode === MODES.ERASE) {
    board[y][x] = BLANK;
  }

  if (mode === MODES.START) {
    removeCellType(START);
    if (board[y][x] === END) removeCellType(END);
    board[y][x] = START;
  }

  if (mode === MODES.END) {
    removeCellType(END);
    if (board[y][x] === START) removeCellType(START);
    board[y][x] = END;
  }

  renderBoard();
}

function removeCellType(type) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] === type) board[y][x] = BLANK;
    }
  }
}

function clearSolutionPath() {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] === SOLUTION) board[y][x] = BLANK;
    }
  }
}

function findCell(type) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] === type) return { x, y };
    }
  }
  return null;
}

function solveMaze() {
  clearSolutionPath();

  const start = findCell(START);
  const end = findCell(END);

  if (!start || !end) {
    statusBox.textContent = 'Add start and finish.';
    renderBoard();
    return;
  }

  const queue = [start];
  const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const parent = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

  visited[start.y][start.x] = true;

  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.x === end.x && current.y === end.y) {
      markPath(parent, start, end);
      statusBox.textContent = 'Shortest path found!';
      renderBoard();
      return;
    }

    for (const direction of directions) {
      const nextX = current.x + direction.x;
      const nextY = current.y + direction.y;

      if (isValidMove(nextX, nextY, visited)) {
        visited[nextY][nextX] = true;
        parent[nextY][nextX] = current;
        queue.push({ x: nextX, y: nextY });
      }
    }
  }

  statusBox.textContent = 'No path found.';
  renderBoard();
}

function isValidMove(x, y, visited) {
  return (
    x >= 0 &&
    x < SIZE &&
    y >= 0 &&
    y < SIZE &&
    !visited[y][x] &&
    board[y][x] !== WALL
  );
}

function markPath(parent, start, end) {
  let current = parent[end.y][end.x];

  while (current && !(current.x === start.x && current.y === start.y)) {
    board[current.y][current.x] = SOLUTION;
    current = parent[current.y][current.x];
  }
}

function clearBoard() {
  board = makeEmptyBoard();
  statusBox.textContent = '';
  renderBoard();
}

document.getElementById('solveBtn').addEventListener('click', solveMaze);
document.getElementById('clearBtn').addEventListener('click', clearBoard);
toolButtons.draw.addEventListener('click', () => setMode(MODES.DRAW));
toolButtons.erase.addEventListener('click', () => setMode(MODES.ERASE));
toolButtons.start.addEventListener('click', () => setMode(MODES.START));
toolButtons.end.addEventListener('click', () => setMode(MODES.END));

renderBoard();
