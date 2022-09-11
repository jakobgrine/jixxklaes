import { Platform, PLATFORM_TILE_SIZE } from "./objects/platform";
import { Direction, Player } from "./objects/player";
import { rand, setSeed } from "./random";
import { loadSprites } from "./sprites";

const DEFAULT_SEED = "Jixxklääs";

const PLATFORM_DISTANCE = 250;
const MAX_VIEWPORT_WIDTH = 800;

export let _SHOW_DEBUG_INFO = false;
const _FONT_SIZE = 20;

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let scrollPosition = 0;

let player: Player;
const STATIC_PLATFORMS = [
  // ground
  new Platform(0, 0, MAX_VIEWPORT_WIDTH, PLATFORM_TILE_SIZE),
];
let platforms = STATIC_PLATFORMS.slice();

async function main() {
  await loadSprites();

  player = new Player(250, 200, 70);

  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("failed to get canvas element");
    return;
  }
  context = canvas.getContext("2d");
  if (!context) {
    console.error("failed to get canvas context");
    return;
  }

  resizeCanvas();

  const seedInput = document.getElementById("seed");
  if (!seedInput) {
    console.error("failed to get seed input element");
    return;
  }
  const updateSeed = (it: string) => {
    setSeed(it);

    if (canvas) {
      generatePlatforms(true);
    }
  };
  // Update the seed when the input changes
  seedInput.addEventListener("input", (event) =>
    updateSeed((event.target as HTMLInputElement).value)
  );
  // Update the seed when the url changes
  window.addEventListener("hashchange", () =>
    updateSeed(window.location.hash.substring(1))
  );
  // Load the seed from the url
  updateSeed(window.location.hash.substring(1) || DEFAULT_SEED);

  document.addEventListener("keydown", inputSystem);
  document.addEventListener("keyup", inputSystem);

  window.requestAnimationFrame(loop);
}
window.addEventListener("load", main);

let fpsUpdateCounter = 0;
let fps: string;
let lastTime = -1;
function loop(time: number) {
  window.requestAnimationFrame(loop);
  // Skip first frame
  if (!time) {
    return;
  }

  const dt = lastTime === -1 ? 0 : (time - lastTime) / 1e2;
  lastTime = time;

  if (!canvas || !context) {
    console.error("canvas or context are falsy");
    return;
  }

  context.clearRect(0, scrollPosition, canvas.width, canvas.height);

  if (_SHOW_DEBUG_INFO) {
    // Do not update the fps every frame so it does not flicker
    if (fpsUpdateCounter === 0) {
      fps = (10 / dt).toFixed(1);
    }
    fpsUpdateCounter++;
    fpsUpdateCounter %= 10;

    context.fillStyle = "lightgreen";
    context.textAlign = "right";
    drawText(
      `${fps}
      ${player.jumps}`,
      canvas.width - 20,
      20
    );
  }

  player.update(dt);

  const topDistance =
    player.r.y + player.size.y - scrollPosition - (3 / 5) * canvas.height;
  if (topDistance > 0) {
    // Move viewport up
    scrollPosition += topDistance;
    context.translate(0, -topDistance);
  }
  const bottomDistance = player.r.y - scrollPosition - canvas.height / 5;
  if (bottomDistance < 0) {
    // Move viewport down
    scrollPosition += bottomDistance;
    context.translate(0, -bottomDistance);
  }

  collisionSystem();

  player.paint(context);
  platforms.forEach((platform) => platform.paint(context));

  displayScore();

  generatePlatforms();
}

// Generates new platforms until there are enough to fill the screen
let generatedUntil = 0;
function generatePlatforms(reset = false) {
  if (reset) {
    generatedUntil = 0;
    platforms = STATIC_PLATFORMS.slice();
  }

  while (generatedUntil - player.r.y < 2 * canvas.height) {
    const w =
      Math.round((100 + rand() * 100) / PLATFORM_TILE_SIZE) *
      PLATFORM_TILE_SIZE;
    const h = PLATFORM_TILE_SIZE;
    const x = (canvas.width - w) * rand();
    const y = generatedUntil + PLATFORM_DISTANCE;
    generatedUntil = y;
    platforms.push(new Platform(x, y, w, h));
  }
}

let leftPressed = false;
let rightPressed = false;
function inputSystem(event: KeyboardEvent) {
  if (event.type === "keydown") {
    switch (event.code) {
      case "Space":
        player.jump();
        break;
      case "KeyA":
      case "ArrowLeft":
        leftPressed = true;
        player.walking = Direction.Left;
        break;
      case "KeyD":
      case "ArrowRight":
        rightPressed = true;
        player.walking = Direction.Right;
        break;
    }
  } else if (event.type === "keyup") {
    switch (event.code) {
      case "KeyA":
      case "ArrowLeft":
        leftPressed = false;
        player.walking = !rightPressed ? null : Direction.Right;
        break;
      case "KeyD":
      case "ArrowRight":
        rightPressed = false;
        player.walking = !leftPressed ? null : Direction.Left;
        break;
    }
  }
}

function collisionSystem() {
  player.collision = {
    ground: false,
    ceiling: false,
    wall_left: false,
    wall_right: false,
  };
  for (const platform of platforms) {
    if (player.collidesWith(platform)) {
      const overlap = player.overlapWith(platform).abs();
      if (overlap.y < overlap.x) {
        if (player.center.y > platform.center.y) {
          // Place player's top edge at platform's bottom edge
          player.r.y = platform.r.y + platform.size.y;
          player.collision.ground = true;
        } else {
          // Place player's bottom edge at platform's top edge
          player.r.y = platform.r.y - player.size.y;
          player.collision.ceiling = true;
        }
        player.v.y = 0;
      } else {
        if (player.center.x > platform.center.x) {
          // Place player's left edge at platform's right edge
          player.r.x = platform.r.x + platform.size.x;
          player.collision.wall_left = true;
        } else {
          // Place player's right edge at platform's left edge
          player.r.x = platform.r.x - player.size.x;
          player.collision.wall_right = true;
        }
        player.v.x = 0;
      }
    }
  }

  // Stop the player at the left or right edge of the screen
  if (player.r.x <= 0) {
    player.r.x = 0;
    player.collision.wall_left = true;
  } else if (player.r.x + player.size.x >= canvas.width) {
    player.r.x = canvas.width - player.size.x;
    player.collision.wall_right = true;
  }
}

function drawText(text: string, x: number, y: number) {
  context.save();
  context.translate(0, canvas.height + scrollPosition);
  context.scale(1, -1);

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    context.font = `${_FONT_SIZE}px 'Press Start 2P'`;
    context.fillText(lines[i], x, y + _FONT_SIZE + (_FONT_SIZE + 10) * i);
  }
  context.restore();
}

let score = 0;
let highscore = localStorage.getItem("highscore") || 0;
function displayScore() {
  const currentScore = Math.floor(player.r.y / PLATFORM_DISTANCE);
  if (player.collision.ground) {
    player.jumps = 0;
    score = currentScore;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore.toString());
    }
  } else if (currentScore < score) {
    score = currentScore;
  }

  context.textAlign = "left";
  context.fillStyle = "white";
  drawText(`Score: ${score}\nHighscore: ${highscore}`, 20, 20);
}

function resizeCanvas() {
  if (!canvas) {
    return;
  }

  const { width, height } = canvas.parentElement.getBoundingClientRect();
  canvas.height = height;
  canvas.width = width;

  // Place coordinate system origin in bottom left corner
  context.scale(1, -1);
  context.translate(0, -canvas.height - scrollPosition);
}
window.addEventListener("resize", resizeCanvas);

// vim: foldmethod=syntax
