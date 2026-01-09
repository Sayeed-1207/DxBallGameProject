const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================= FULLSCREEN =================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ================= MUSIC =================
const bgMusic = new Audio("background.wav");
bgMusic.loop = true;
bgMusic.volume = 0.5;

const bounceSound = new Audio("bounce.wav");

let musicOn = true;
bgMusic.play();

document.getElementById("musicBtn").onclick = () => {
  if (musicOn) {
    bgMusic.pause();
    musicBtn.innerText = "🔇 Music OFF";
  } else {
    bgMusic.play();
    musicBtn.innerText = "🔊 Music ON";
  }
  musicOn = !musicOn;
};

// ================= GAME STATE =================
let score = 0;
let lives = 3;
let level = 1;
let paused = false;

// ================= PADDLE =================
let paddle = {
  w: 140,
  h: 14,
  x: canvas.width / 2 - 70,
  y: canvas.height - 40
};

// ================= BALL =================
let ball = {
  r: 8,
  x: canvas.width / 2,
  y: canvas.height / 2,
  dx: 4,
  dy: -4
};

// ================= BRICKS =================
let bricks = [];

function createBricks() {
  bricks = [];
  let rows = 3 + level;
  let brickWidth = canvas.width / 12;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 10; c++) {
      bricks.push({
        x: c * (brickWidth + 10) + 50,
        y: r * 35 + 60,
        w: brickWidth,
        h: 22,
        hit: false
      });
    }
  }
}
createBricks();

// ================= CONTROLS =================
document.addEventListener("mousemove", e => {
  paddle.x = e.clientX - paddle.w / 2;
});

document.addEventListener("keydown", e => {
  if (e.key === "p") paused = !paused;
  if (e.key === "ArrowUp") bgMusic.volume = Math.min(1, bgMusic.volume + 0.1);
  if (e.key === "ArrowDown") bgMusic.volume = Math.max(0, bgMusic.volume - 0.1);
});

// ================= GAME LOOP =================
function draw() {
  if (paused) {
    requestAnimationFrame(draw);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paddle
  ctx.fillStyle = "lime";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  // Bricks
  ctx.fillStyle = "red";
  bricks.forEach(b => {
    if (!b.hit) ctx.fillRect(b.x, b.y, b.w, b.h);
  });

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.x < ball.r || ball.x > canvas.width - ball.r) ball.dx *= -1;
  if (ball.y < ball.r) ball.dy *= -1;

  // Paddle collision
  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y > paddle.y
  ) {
    ball.dy *= -1;
    bounceSound.play();
  }

  // Brick collision
  bricks.forEach(b => {
    if (!b.hit &&
        ball.x > b.x &&
        ball.x < b.x + b.w &&
        ball.y > b.y &&
        ball.y < b.y + b.h) {
      b.hit = true;
      ball.dy *= -1;
      score += 10;
    }
  });

  // Lose life
  if (ball.y > canvas.height) {
    lives--;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    if (lives === 0) {
      alert("GAME OVER");
      location.reload();
    }
  }

  // Level complete
  if (bricks.every(b => b.hit)) {
    level++;
    createBricks();
  }

  // UI text
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${lives}`, 140, 30);
  ctx.fillText(`Level: ${level}`, 260, 30);
  ctx.fillText("P = Pause | ↑↓ Volume", 380, 30);

  requestAnimationFrame(draw);
}

draw();
