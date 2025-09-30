const openBtn = document.getElementById("open-instruction");
const closeBtn = document.getElementById("close-instruction");
const instruction = document.getElementById("instruction-container");
const btnPlay = document.getElementById("play");

const overlayCountdown = document.getElementById("overlay-countdown");
const countdownCount = overlayCountdown.querySelector(".count");

const screenContainer = document.getElementById('screen-container');
const gameContainer = document.getElementById('game-container');

const inputName = document.getElementById('input-name');
const inputDifficulty = document.getElementById('input-difficulty');
const playerName1 = document.getElementById('player-name1');
const playerName2 = document.getElementById('player-name2');

const pauseScreen = document.getElementById("pause-screen");
const resumeBtn = document.getElementById("resume-btn");
const quitBtn = document.getElementById("quit-btn");

const gameoverScreen = document.getElementById("gameover-screen");
const saveScrore = document.getElementById("save-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn")

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext('2d');

let userName;
let difficulty;
let isPaused = false;
let gameStarted = false;

// Ukuran Grid
const COLS = 11;
const ROWS = 9;
const TILE = 70;

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

const SPRITES = {
  wallBreak: 'images/wall.png',
  bomb: 'images/bomb.png',
  explosion: 'images/explosion.png',
  tnt: 'images/tnt.png',
  ice: 'images/ice.png',
  heartUI: 'images/heart_indicator2.png',
  heartItem: 'images/heart.png',

  // player & dog directions
  player: {
    up: 'images/char_up.png',
    down: 'images/char_down.png',
    left: 'images/char_left.png',
    right: 'images/char_right.png',
  },

  dog: {
    up: 'images/dog_up.png',
    down: 'images/dog_down.png',
    left: 'images/dog_left.png',
    right: 'images/dog_right.png',
  },
};

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const IMGS = {
  player: {
    up: loadImage(SPRITES.player.up),
    down: loadImage(SPRITES.player.down),
    left: loadImage(SPRITES.player.left),
    right: loadImage(SPRITES.player.right),
  },
  wallBreak: loadImage(SPRITES.wallBreak),
  bomb: loadImage(SPRITES.bomb),
  explosion: loadImage(SPRITES.explosion),
};


// Posisi awal player
let player = {
  col: 1,
  row: 1,
  dir: "down"
};

// grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let x = c * TILE;
      let y = r * TILE;

      if (map[r][c] === 2) {
        ctx.drawImage(IMGS.wallBreak, x, y, TILE, TILE);
      }
    }
  }
}

// Gambar player sesuai arah
function Player() {
  const x = player.col * TILE;
  const y = player.row * TILE;
  const sprite = IMGS.player[player.dir];
  ctx.drawImage(sprite, x, y, TILE, TILE);
}

// Random Wall
function generateBreakWalls() {
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (map[r][c] === 0) {
        if ((r === 1 && c === 1) || (r === 1 && c === 2) || (r === 2 && c === 1)) {

        } else {
          // 30% peluang jadi 2
          if (Math.random() < 0.6) {
            map[r][c] = 2;
          }
        }
      }
    }
  }
}

// === Bomb Place ===
let bombs = [];
const BOMB_TIMER = 3000;
const EXPLOSION_DURATION = 500;

function drawBombs() {
  bombs.forEach(b => {
    // Kalau belum meledak → gambar bom
    if (!b.exploded) {
      ctx.drawImage(IMGS.bomb, b.col * TILE, b.row * TILE, TILE, TILE);
    } else {
      b.explosionArea.forEach(pos => {
        ctx.drawImage(IMGS.explosion, pos.col * TILE, pos.row * TILE, TILE, TILE);
      });
    }
  });
}

function placeBomb() {
  const existingBomb = bombs.find(b => b.row === player.row && b.col === player.col && !b.exploded);
  if (existingBomb) return; // cegah spam di blok yg sama

  let bomb = {
    row: player.row,
    col: player.col,
    placedAt: Date.now(),
    exploded: false,
    explosionArea: [] // akan diisi ketika meledak
  };
  bombs.push(bomb);

  setTimeout(() => {
    explodeBomb(bomb);
  }, BOMB_TIMER);
}

function explodeBomb(bomb) {
  bomb.exploded = true;

  let explosionArea = [];

  // posisi bom selalu kena
  explosionArea.push({ row: bomb.row, col: bomb.col });

  // cek 4 arah
  let dirs = [
    { r: -1, c: 0 }, // atas
    { r: 1, c: 0 },  // bawah
    { r: 0, c: -1 }, // kiri
    { r: 0, c: 1 }   // kanan
  ];

  dirs.forEach(d => {
    let nr = bomb.row + d.r;
    let nc = bomb.col + d.c;

    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      if (map[nr][nc] === 1) {
        // solid wall, stop ledakan
        return;
      } else if (map[nr][nc] === 2) {
        // wallBreak hancur
        map[nr][nc] = 0;
        explosionArea.push({ row: nr, col: nc });
      } else if (map[nr][nc] === 0) {
        // tile kosong tetap dapat ledakan
        explosionArea.push({ row: nr, col: nc });
      }
    }
  });

  bomb.explosionArea = explosionArea;

  // Cek kalau player kena bom
  if (isPlayerHit(bomb)) {
    hearts -= 1;
    renderHearts();

    if (hearts <= 0) {
      gameStarted = false; // game over
    }
  }


  setTimeout(() => {
    bombs = bombs.filter(b => b !== bomb);
  }, EXPLOSION_DURATION);
}


// == HEART SYSTEM ==
let hearts = 3;
function renderHearts() {
  const heartsContainer = document.getElementById("hearts");
  heartsContainer.innerHTML = ""; // reset dulu

  for (let i = 0; i < hearts; i++) {
    const img = document.createElement("img");
    img.src = SPRITES.heartUI;
    img.classList.add("heart-icon");
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.marginRight = "5px";
    heartsContainer.appendChild(img);
  }
}

function isPlayerHit(bomb) {
  return bomb.explosionArea.some(pos => pos.row === player.row && pos.col === player.col);
}


function render() {
  drawGrid();
  Player();
  drawBombs();
  renderHearts();
}

function gameLoop() {
  if (gameStarted && !isPaused) {
    render();
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();

function updateButton() {
  userName = inputName.value.trim();
  difficulty = inputDifficulty.value;
  btnPlay.disabled = (userName.length === 0 || difficulty === "");
}
updateButton();

// Pause
function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    pauseScreen.classList.remove("hidden");
  } else {
    pauseScreen.classList.add("hidden");
  }
}

// Timer
let totalTime = 0;
let timerInterval;
let secondText;
let minuteText;
function startTimer() {
  timerInterval = setInterval(() => {
    if (!isPaused) {


      totalTime++;
      let minutes = Math.floor(totalTime / 60);
      let seconds = totalTime % 60;

      minuteText = String(minutes).padStart(2, "0");
      secondText = String(seconds).padStart(2, "0");
      document.getElementById("minute1").textContent = minuteText;
      document.getElementById("second1").textContent = secondText;

      // if (totalTime == 15) {
      //   gameStarted = false;
      //   console.log("Game Over! Timer berhenti.");
      // }
    }

    if (!gameStarted) {
      clearInterval(timerInterval);
      // saveTime(totalTime); // simpan ke localStorage
      gameContainer.classList.add('hidden');
      gameoverScreen.classList.remove('hidden');
      document.getElementById("minute2").textContent = minuteText;
      document.getElementById("second2").textContent = secondText;
      // showLeaderboard();
      return;
    }

  }, 1000);
}


// Simpan timer ke localStorage
function saveTime(timeInSeconds) {
  let minutes = Math.floor(timeInSeconds / 60);
  let seconds = timeInSeconds % 60;
  let formatted = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push(formatted);
  localStorage.setItem("scores", JSON.stringify(scores));

  document.getElementById("result").textContent = "Waktu terakhir: " + formatted;
}


inputName.addEventListener('input', updateButton);
inputDifficulty.addEventListener('change', updateButton);

openBtn.addEventListener("click", () => { instruction.classList.toggle("hidden-op") });
closeBtn.addEventListener("click", () => { instruction.classList.toggle("hidden-op") });
resumeBtn.addEventListener("click", () => {
  isPaused = false;
  pauseScreen.classList.add("hidden");
});
quitBtn.addEventListener("click", () => {
  isPaused = false;
  gameStarted = false;
  clearInterval(timerInterval);
  pauseScreen.classList.add("hidden");
  gameContainer.classList.add("hidden");
  screenContainer.classList.remove("hidden");
  player.col = 1;
  player.row = 1;
  player.dir = "down";
});

let map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let keyPressed = {};
document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  let newRow = player.row;
  let newCol = player.col;

  // if (e.repeat) return;

  if (keyPressed[e.key]) return;
  keyPressed[e.key] = true;

  if (e.key === "Escape") {
    togglePause();
  }
  if (!isPaused) {
    if ((e.key === "w" || e.key === "ArrowUp") && player.row > 0) {
      newRow--;
      player.dir = "up";
    }
    else if ((e.key === "s" || e.key === "ArrowDown") && player.row < ROWS - 1) {
      newRow++;
      player.dir = "down";
    }
    else if ((e.key === "a" || e.key === "ArrowLeft") && player.col > 0) {
      newCol--;
      player.dir = "left";
    }
    else if ((e.key === "d" || e.key === "ArrowRight") && player.col < COLS - 1) {
      newCol++;
      player.dir = "right";
    }
    else if (e.key === " ") {
      placeBomb();
    }
  }

  if (map[newRow][newCol] === 0) {
    player.row = newRow;
    player.col = newCol;
  }

  if (isPaused) return;
});

document.addEventListener("keyup", (e) => {
  keyPressed[e.key] = false;
});


// Countdown
btnPlay.addEventListener("click", () => {
  playerName1.textContent = userName;
  playerName2.textContent = userName;
  overlayCountdown.classList.remove('hidden')

  let i = 3;
  countdownCount.textContent = i;

  const iv = setInterval(() => {
    i--;
    if (i > 0) {
      countdownCount.textContent = i;
    } else {
      clearInterval(iv);
      overlayCountdown.classList.add('hidden');
      startGame();
    }
  }, 1000);
});

function startGame() {
  hearts = 3;
  renderHearts();
  generateBreakWalls();
  render();
  screenContainer.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  totalTime = 0;
  gameStarted = true;
  startTimer();
}

