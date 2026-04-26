// =========================
// ELEMENTS
// =========================
let player = document.getElementById("player");
let obstacle = document.getElementById("obstacle");
let scoreText = document.getElementById("score");

let menu = document.getElementById("menu");
let gameOverScreen = document.getElementById("gameOver");
let finalScoreText = document.getElementById("finalScore");
let game = document.getElementById("game");

// CREATE COIN + POWER
let coin = document.createElement("div");
coin.id = "coin";
game.appendChild(coin);

let power = document.createElement("div");
power.id = "power";
game.appendChild(power);

// =========================
// GAME STATE
// =========================
let shapes = ["square", "circle", "triangle"];
let currentShape = 0;

let isJumping = false;
let velocity = 0;
let gravity = 0.6;
let position = 0;

let obstacleX = 600;
let coinX = 800;
let powerX = 1000;

let obstacleType = 0;

let score = 0;
let speed = 5;
let running = false;

let shield = false;

// COMBO
let combo = 0;
let comboTimer;

// =========================
// SOUND
// =========================
let bgMusic = new Audio("https://actions.google.com/sounds/v1/ambiences/arcade_game_background.ogg");
bgMusic.loop = true;

let coinSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
let jumpSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");

// =========================
// PARTICLES
// =========================
function createParticles(x, y, color = "yellow") {
  for (let i = 0; i < 10; i++) {
    let p = document.createElement("div");
    p.className = "particle";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.background = color;

    let dx = (Math.random() - 0.5) * 100 + "px";
    let dy = (Math.random() - 0.5) * 100 + "px";

    p.style.setProperty("--x", dx);
    p.style.setProperty("--y", dy);

    game.appendChild(p);
    setTimeout(() => p.remove(), 500);
  }
}

// =========================
// TRAIL
// =========================
function createTrail() {
  let t = document.createElement("div");
  t.className = "trail";

  let rect = player.getBoundingClientRect();
  t.style.left = rect.left + "px";
  t.style.top = rect.top + "px";

  game.appendChild(t);
  setTimeout(() => t.remove(), 500);
}

// =========================
// SCREEN SHAKE
// =========================
function screenShake() {
  game.classList.add("shake");
  setTimeout(() => game.classList.remove("shake"), 300);
}

// =========================
// COMBO TEXT
// =========================
function showCombo(x, y) {
  let text = document.createElement("div");
  text.className = "combo";
  text.innerText = "x" + combo;

  text.style.left = x + "px";
  text.style.top = y + "px";

  game.appendChild(text);
  setTimeout(() => text.remove(), 500);
}

// =========================
// START / RESTART
// =========================
function startGame() {
  menu.style.animation = "fadeOut 0.5s forwards";

  setTimeout(() => {
    menu.style.display = "none";
    game.style.display = "block";
    running = true;
    bgMusic.play();
    gameLoop();
  }, 500);
}

function restartGame() {
  location.reload();
}

// =========================
// SKINS
// =========================
function setSkin(color) {
  player.classList.remove("red", "blue", "green");
  player.classList.add(color);
}

// =========================
// CONTROLS (PC)
// =========================
document.addEventListener("keydown", (e) => {
  if (!running) return;

  if (e.code === "KeyS") {
    currentShape = (currentShape + 1) % 3;
    player.className = shapes[currentShape];
  }

  if (e.code === "Space" && !isJumping) {
    isJumping = true;
    velocity = 10;

    jumpSound.play();

    player.classList.add("jump");
    setTimeout(() => player.classList.remove("jump"), 200);

    createParticles(60, 180, "white");
  }
});

// =========================
// MOBILE
// =========================
document.addEventListener("touchstart", () => {
  if (!running) return;

  currentShape = (currentShape + 1) % 3;
  player.className = shapes[currentShape];

  if (!isJumping) {
    isJumping = true;
    velocity = 10;
    jumpSound.play();

    createParticles(60, 180, "white");
  }
});

// =========================
// OBSTACLE
// =========================
function setObstacle() {
  obstacleType = Math.floor(Math.random() * 3);

  obstacle.style.border = "none";

  if (obstacleType === 0) {
    obstacle.style.width = "20px";
    obstacle.style.height = "40px";
    obstacle.style.background = "yellow";
  }

  if (obstacleType === 1) {
    obstacle.style.width = "30px";
    obstacle.style.height = "30px";
    obstacle.style.background = "cyan";
  }

  if (obstacleType === 2) {
    obstacle.style.width = "0";
    obstacle.style.height = "0";
    obstacle.style.borderLeft = "20px solid transparent";
    obstacle.style.borderRight = "20px solid transparent";
    obstacle.style.borderBottom = "40px solid orange";
  }
}

// =========================
// GAME LOOP
// =========================
function gameLoop() {
  if (!running) return;

  // JUMP
  if (isJumping) {
    position += velocity;
    velocity -= gravity;

    if (position <= 0) {
      position = 0;
      isJumping = false;
    }

    player.style.bottom = position + "px";
  }

  // MOVE OBSTACLE
  obstacleX -= speed;
  obstacle.style.left = obstacleX + "px";

  if (obstacleX < -40) {
    obstacleX = 600;
    setObstacle();

    obstacle.style.transform = "scaleY(1.1)";
    setTimeout(() => obstacle.style.transform = "scaleY(1)", 100);

    score++;
    speed += 0.2;
  }

  // MOVE COIN
  coinX -= speed;
  coin.style.left = coinX + "px";

  if (coinX < -20) coinX = 800;

  // MOVE POWER
  powerX -= speed;
  power.style.left = powerX + "px";

  if (powerX < -20) powerX = 1000;

  // COLLISIONS
  let playerRect = player.getBoundingClientRect();
  let obstacleRect = obstacle.getBoundingClientRect();
  let coinRect = coin.getBoundingClientRect();
  let powerRect = power.getBoundingClientRect();

  // COIN
  if (
    playerRect.right > coinRect.left &&
    playerRect.left < coinRect.right &&
    playerRect.bottom > coinRect.top
  ) {
    coinX = 800;

    combo++;
    score += 5 * combo;

    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => combo = 0, 2000);

    coinSound.play();

    showCombo(coinRect.left, coinRect.top);
    createParticles(coinRect.left, coinRect.top, "gold");
  }

  // POWER
  if (
    playerRect.right > powerRect.left &&
    playerRect.left < powerRect.right &&
    playerRect.bottom > powerRect.top
  ) {
    powerX = 1000;
    shield = true;

    player.style.boxShadow = "0 0 20px cyan";
    createParticles(powerRect.left, powerRect.top, "cyan");

    setTimeout(() => {
      shield = false;
      player.style.boxShadow = "none";
    }, 5000);
  }

  // COLLISION
  if (
    playerRect.right > obstacleRect.left &&
    playerRect.left < obstacleRect.right &&
    playerRect.bottom > obstacleRect.top
  ) {
    if (!shield && currentShape !== obstacleType) {
      createParticles(playerRect.left, playerRect.top, "red");
      screenShake();

      running = false;
      bgMusic.pause();

      game.style.display = "none";
      gameOverScreen.style.display = "block";
      finalScoreText.innerText = "Score: " + score;
      return;
    }
  }

  // TRAIL
  createTrail();

  // SCORE
  scoreText.innerText = "Score: " + score;

  requestAnimationFrame(gameLoop);
}

// INIT
setObstacle();