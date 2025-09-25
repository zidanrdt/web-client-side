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
  wallSolid: 'images/wall_solid.jpg',
  wallBreak: 'images/wall.png',
  bomb: 'images/bomb.png',
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
  }
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

function render() {
  drawGrid();
  Player();
}

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

      if (totalTime == 15) {
        gameStarted = false;
        console.log("Game Over! Timer berhenti.");
      }
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

const map = [
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


document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  let newRow = player.row;
  let newCol = player.col;

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
  }
  // Agar tidak bisa melewati wall solid
  if (map[newRow][newCol] === 0) {
    player.row = newRow;
    player.col = newCol;
  }

  if (isPaused) return;
  render();
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
  render()
  screenContainer.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  totalTime = 0;
  gameStarted = true;
  startTimer();

}


