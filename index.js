const DEFAULT_SEED = "Jixxklääs";

const JUMPS = 3;
const GRAVITY = -40;
const GROUND_FRICTION = 4;
const WALK_VELOCITY = 40;
const JUMP_VELOCITY = 120;
const WALL_SLIDE_VELOCITY = -30;
const MAX_FALL_VELOCITY = -120;

const PLATFORM_TILE_SIZE = 30;
const PLATFORM_DISTANCE = 250;
const MAX_VIEWPORT_WIDTH = 800;

let _SHOW_DEBUG_INFO = false;
const _FONT_SIZE = 20;

const Sprites = {
  Still: "still.png",
  Walking: ["walking_1.png", "walking_2.png", "walking_3.png", "walking_4.png"],
  Jumping: "jumping.png",
  Ground: "ground.png",
};

function loadImage(filename) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = reject;
    image.onload = () => resolve(image);
    image.src = filename;
  });
}

async function loadSprites() {
  // Load all sprites
  const promises = [];
  for (const key of Object.keys(Sprites)) {
    if (Array.isArray(Sprites[key])) {
      for (let i = 0; i < Sprites[key].length; i++) {
        promises.push(
          loadImage("sprite/" + Sprites[key][i]).then(
            (image) => (Sprites[key][i] = image)
          )
        );
      }
    } else {
      promises.push(
        loadImage("sprite/" + Sprites[key]).then(
          (image) => (Sprites[key] = image)
        )
      );
    }
  }
  await Promise.all(promises);
}

let canvas, context;
let scrollPosition = 0;

const Direction = {
  Left: "Left",
  Right: "Right",
};

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  mul(factor) {
    return new Vec2(this.x * factor, this.y * factor);
  }

  abs() {
    return new Vec2(Math.abs(this.x), Math.abs(this.y));
  }
}

class GameObject {
  r;
  size;

  constructor(x, y, w, h) {
    this.r = new Vec2(x, y);
    this.size = new Vec2(w, h);
  }

  get topLeft() {
    return this.r;
  }

  get bottomRight() {
    return this.r.add(this.size);
  }

  get center() {
    return this.r.add(this.size.mul(0.5));
  }

  collidesWith(other) {
    return (
      this.bottomRight.x >= other.topLeft.x &&
      this.topLeft.x <= other.bottomRight.x &&
      this.bottomRight.y >= other.topLeft.y &&
      this.topLeft.y <= other.bottomRight.y
    );
  }

  overlapWith(other) {
    const overlap = new Vec2(Infinity, Infinity);

    if (this.topLeft.x < other.topLeft.x) {
      overlap.x = this.bottomRight.x - other.topLeft.x;
    } else if (this.bottomRight.x > other.bottomRight.x) {
      overlap.x = other.bottomRight.x - this.topLeft.x;
    }
    if (this.topLeft.y < other.topLeft.y) {
      overlap.y = this.bottomRight.y - other.topLeft.y;
    } else if (this.bottomRight.y > other.bottomRight.y) {
      overlap.y = other.bottomRight.y - this.topLeft.y;
    }

    overlap.x = Math.min(overlap.x, this.size.x, other.size.x);
    overlap.y = Math.min(overlap.y, this.size.y, other.size.y);

    return overlap;
  }
}

class Platform extends GameObject {
  constructor(x, y, w, h) {
    super(x, y, w, h);
  }

  paint(context) {
    for (let col = 0; col < this.size.x / PLATFORM_TILE_SIZE; col++) {
      for (let row = 0; row < this.size.y / PLATFORM_TILE_SIZE; row++) {
        context.drawImage(
          Sprites.Ground,
          this.r.x + col * PLATFORM_TILE_SIZE,
          this.r.y + row * PLATFORM_TILE_SIZE,
          PLATFORM_TILE_SIZE,
          PLATFORM_TILE_SIZE
        );
      }
    }

    if (_SHOW_DEBUG_INFO) {
      context.strokeStyle = "red";
      context.strokeRect(this.r.x, this.r.y, this.size.x, this.size.y);
    }
  }
}

class Player extends GameObject {
  v = new Vec2(0, 0);
  collision = {};
  walking;
  direction;
  jumps = 0;

  #walkingAnimationState = 0;
  #walkingAnimationCounter = 0;

  constructor(x, y, h) {
    const aspectRatio = Sprites.Still.width / Sprites.Still.height;
    super(x, y, aspectRatio * h, h);
  }

  update(dt) {
    if (this.walking === Direction.Left) {
      this.v.x = -WALK_VELOCITY;
    } else if (this.walking === Direction.Right) {
      this.v.x = WALK_VELOCITY;
    }

    // Slow down when on ground
    const sign = this.v.x > 0 ? 1 : -1;
    if (this.v.x !== 0 && this.collision.ground && !this.walking) {
      this.v.x -= sign * GROUND_FRICTION;
    }

    // Update facing direction
    if (this.v.x < 0 || this.walking === Direction.Left) {
      this.direction = Direction.Left;
    } else if (this.v.x > 0 || this.walking === Direction.Right) {
      this.direction = Direction.Right;
    }

    // Apply gravity if not standing on the ground
    if (!this.collision.ground) {
      this.v.y += GRAVITY * dt;
    }

    // Constrain to maximum velocity
    if (this.v.y < MAX_FALL_VELOCITY) {
      this.v.y = MAX_FALL_VELOCITY;
    }

    this.r = this.r.add(this.v.mul(dt));

    const topDistance =
      this.r.y + this.size.y - scrollPosition - (3 / 5) * canvas.height;
    if (topDistance > 0) {
      // Move viewport up
      scrollPosition += topDistance;
      context.translate(0, -topDistance);
    }
    const bottomDistance = this.r.y - scrollPosition - canvas.height / 5;
    if (bottomDistance < 0) {
      // Move viewport down
      scrollPosition += bottomDistance;
      context.translate(0, -bottomDistance);
    }
  }

  paint(context) {
    if (_SHOW_DEBUG_INFO) {
      context.strokeStyle = "blue";
      context.strokeRect(this.r.x, this.r.y, this.size.x, this.size.y);
    }

    context.save();
    context.translate(this.center.x, this.center.y);
    context.scale(this.direction === Direction.Left ? -1 : 1, -1);
    context.translate(-this.center.x, -this.center.y);

    let sprite;
    if (this.collision.ground) {
      if (
        this.walking &&
        !this.collision.wall_left &&
        !this.collision.wall_right
      ) {
        sprite = Sprites.Walking[this.#walkingAnimationState];
        context.drawImage(
          sprite,
          this.r.x,
          this.r.y,
          (sprite.width / Sprites.Still.width) * this.size.x,
          this.size.y
        );

        // Advance walking animation
        this.#walkingAnimationCounter++;
        this.#walkingAnimationCounter %= 8;
        if (this.#walkingAnimationCounter === 0) {
          this.#walkingAnimationState++;
          this.#walkingAnimationState %= Sprites.Walking.length;
        }
      } else {
        sprite = Sprites.Still;
        context.drawImage(sprite, this.r.x, this.r.y, this.size.x, this.size.y);
      }
    } else {
      sprite = Sprites.Jumping;
      const scaledWidth = (sprite.width / Sprites.Still.width) * this.size.x;
      const scaledHeight = (sprite.height / Sprites.Still.height) * this.size.y;
      const dw = scaledWidth - this.size.x;
      context.drawImage(
        sprite,
        this.r.x - dw / 2,
        this.r.y,
        scaledWidth,
        scaledHeight
      );
    }

    context.restore();
  }

  jump() {
    if (this.jumps < JUMPS) {
      this.jumps++;
      this.v.y = JUMP_VELOCITY;
    }
  }
}

let player;
const STATIC_PLATFORMS = [
    // Ground
    new Platform(0, 0, MAX_VIEWPORT_WIDTH, PLATFORM_TILE_SIZE)
];
let platforms = STATIC_PLATFORMS.slice();

// See https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
// Hash function for strings
function cyrb128(str) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [
    (h1 ^ h2 ^ h3 ^ h4) >>> 0,
    (h2 ^ h1) >>> 0,
    (h3 ^ h1) >>> 0,
    (h4 ^ h1) >>> 0,
  ];
}

// Returns a random number generator for the given seed
function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

let seed, rand;
function setSeed(it) {
  it = decodeURI(it);

  seed = cyrb128(it);
  rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

  if (canvas) {
    generatePlatforms(true);
  }

  const seedElement = document.getElementById("seed");
  if (seedElement) {
    seedElement.value = it;
  }
  window.location.hash = `#${it}`;
  document.title = it;
}

async function main() {
  await loadSprites();

  player = new Player(250, 200, 70);

  canvas = document.getElementById("canvas");
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
  // Update the seed when the input changes
  seedInput.addEventListener("input", (event) => setSeed(event.target.value));
  // Update the seed when the url changes
  window.addEventListener("hashchange", () =>
    setSeed(window.location.hash.substring(1))
  );
  // Load the seed from the url
  setSeed(window.location.hash.substring(1) || DEFAULT_SEED);

  document.addEventListener("keydown", inputSystem);
  document.addEventListener("keyup", inputSystem);

  window.requestAnimationFrame(loop);
}
window.addEventListener("load", main);

let fpsUpdateCounter = 0;
let fps = 0;
let lastTime = 0;
function loop(time) {
  window.requestAnimationFrame(loop);
  // Skip first frame
  if (!time) {
    return;
  }

  const dt = (time - lastTime) / 1e2;
  lastTime = time;

  if (!canvas || !context) {
    console.error("canvas or context are falsy");
    return;
  }

  context.clearRect(0, scrollPosition, canvas.width, canvas.height);

  if (_SHOW_DEBUG_INFO) {
    // Do not update the fps every frame so it does not flicker
    fpsUpdateCounter++;
    fpsUpdateCounter %= 10;
    if (fpsUpdateCounter === 0) {
      fps = (10 / dt).toFixed(1);
    }

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

  collisionSystem();

  player.paint(context);
  platforms.forEach((platform) => platform.paint(context));

  displayScore();

  generatePlatforms();
}

// Generates new platforms until there are enough to fill the screen
let generatedUntil = 0;
function generatePlatforms(reset) {
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
function inputSystem(event) {
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
  player.collision = {};
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

function drawText(text, x, y) {
  context.save();
  context.translate(0, canvas.height + scrollPosition);
  context.scale(1, -1);

  const lines = text.toString().split("\n");
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
      localStorage.setItem("highscore", highscore);
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
