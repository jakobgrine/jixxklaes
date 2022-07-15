const DEFAULT_SEED = "Jixxklääs";

const JUMPS = 3;
const GRAVITY = -40;
const GROUND_FRICTION = 4;
const WALK_VELOCITY = 40;
const JUMP_VELOCITY = 120;
const WALL_SLIDE_VELOCITY = -30;
const MAX_FALL_VELOCITY = -120;

const TOP_PADDING = 200;
const BOTTOM_PADDING = 200;
const PLATFORM_HEIGHT = 30;
const PLATFORM_DISTANCE = 250;

let _SHOW_DEBUG_INFO = false;
const _FONT_SIZE = 20;

const Sprites = {
  Still: "still.png",
  Walking: [
    "walking_1.png",
    "walking_2.png",
    "walking_3.png",
  ],
  Jumping: "jumping.png",
  Falling: "falling.png",
  Ground: "ground.png",
};

function loadImage(filename) {
  const image = new Image();
  image.src = filename;
  return image;
}
// Load all sprites
for (const key of Object.keys(Sprites)) {
  if (Array.isArray(Sprites[key])) {
    for (let i = 0; i < Sprites[key].length; i++) {
      Sprites[key][i] = loadImage("sprite/" + Sprites[key][i]);
    }
  } else {
    Sprites[key] = loadImage("sprite/" + Sprites[key]);
  }
}

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

let playerSprite;
let canvas, context;
let lastTime = 0;
let leftPressed = false;
let rightPressed = false;
let scrollPosition = 0;
let generatedUntil = 0;
let score = 0;
let highscore = localStorage.getItem("highscore") || 0;

const Colliding = {
  Ceiling: 1 << 0,
  Ground: 1 << 1,
  WallRight: 1 << 2,
  WallLeft: 1 << 3,
  Wall: 1 << 2 | 1 << 3,
};
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
    const spriteSize = PLATFORM_HEIGHT;
    for (let col = 0; col < this.size.x / spriteSize; col++) {
      for (let row = 0; row < this.size.y / spriteSize; row++) {
        context.drawImage(Sprites.Ground,
          this.r.x + col * spriteSize, this.r.y + row * spriteSize,
          spriteSize, spriteSize,
        );
      }
    }

    if (_SHOW_DEBUG_INFO) {
      context.strokeStyle = "red";
      context.strokeRect(
        this.r.x, this.r.y,
        this.size.x, this.size.y,
      );
    }
  }
}

class Player extends GameObject {
  a = new Vec2(0, GRAVITY);
  v = new Vec2(0, 0);
  colliding = 0;
  walking;
  direction;
  jumps = 0;

  #walkingAnimationState = 0;
  #walkingAnimationCounter = 0;

  constructor(x, y, h) {
    // TODO: no hardcoded aspect ratio, compute from image
    const aspectRatio = 250 / 270;
    super(x, y, aspectRatio * h, h);
  }

  update(dt) {
    if (~this.colliding & Colliding.Ground) {
      this.v = this.v.add(this.a.mul(dt));
    }

    if (this.colliding & Colliding.Wall) {
      // Stop at walls
      this.v.x = 0;
    }

    if (this.walking === Direction.Right) {
      this.v.x = WALK_VELOCITY;
    } else if (this.walking === Direction.Left) {
      this.v.x = -WALK_VELOCITY;
    }

    // Slow down when on ground
    const sign = this.v.x > 0 ? 1 : -1;
    if (this.v.x !== 0 && this.colliding & Colliding.Ground && !this.walking) {
      this.v.x -= sign * GROUND_FRICTION;
    }

    // Constrain to maximum velocity
    if (this.v.y < MAX_FALL_VELOCITY) {
      this.v.y = MAX_FALL_VELOCITY;
    }

    // Calculate facing direction
    if (this.v.x > 0) {
      this.direction = Direction.Right;
    } else if (this.v.x < 0) {
      this.direction = Direction.Left;
    }

    this.r = this.r.add(this.v.mul(dt));

    const topDistance =
      TOP_PADDING - (canvas.height - (this.r.y + this.size.y - scrollPosition));
    if (topDistance > 0) {
      // Move viewport up
      scrollPosition += topDistance;
      context.translate(0, -topDistance);
    }
    const bottomDistance = BOTTOM_PADDING - (this.r.y - scrollPosition);
    if (bottomDistance > 0) {
      // Move viewport down
      scrollPosition -= bottomDistance;
      context.translate(0, bottomDistance);
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

    let sprite = Sprites.Still;
    if (this.colliding & Colliding.Ground
      && !(this.colliding & Colliding.Wall)
      && this.walking)
    {
      sprite = Sprites.Walking[this.#walkingAnimationState];
      this.#walkingAnimationCounter++;
      this.#walkingAnimationCounter %= 7;
      if (this.#walkingAnimationCounter === 0) {
        this.#walkingAnimationState++;
        this.#walkingAnimationState %= Sprites.Walking.length;
      }
    }
    if (!(this.colliding & Colliding.Ground)) {
      if (this.v.y > 0) {
        sprite = Sprites.Jumping;
      } else {
        sprite = Sprites.Falling;
      }
    }

    context.drawImage(
      sprite,
      this.r.x,
      this.r.y,
      this.size.x,
      this.size.y,
    );

    context.restore();
  }

  jump() {
    if (this.jumps < JUMPS) {
      this.jumps++;
      this.v.y = JUMP_VELOCITY;
    }
  }
}

const p = it => (it >>> 0).toString(2).padStart(4, "0");

const player = new Player(250, 200, 70);
const STATIC_PLATFORMS = [];
let platforms = [];
let webs = [];

class Web extends GameObject {
  v;

  constructor(x, y, r, direction) {
    super(x, y, r, r);
    const sign = this.direction === Direction.Left
      ? -1
      : this.direction === Direction.Right
      ? 1
      : 0;
    this.v = new Vec2(
      sign * 20 + player.v.x,
      30 + player.v.y,
    );
  }

  paint(context) {
    context.beginPath();
    context.arc(this.center.x, this.center.y, this.size.x, 0, 2 * Math.PI);
    context.fillStyle = "white";
    context.fill();
  }

  update(dt) {
    this.r = this.r.add(this.v.mul(dt));
  }
}

let seed, rand;
function setSeed(it) {
  it = decodeURI(it);

  seed = cyrb128(it);
  rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

  platforms = STATIC_PLATFORMS;
  generatedUntil = 0;
  if (canvas) {
    generatePlatforms();
  }

  const seedElement = document.getElementById("seed");
  if (seedElement) {
    seedElement.value = it;
  }
  window.location.hash = `#${it}`;
  document.title = it;
}

function main() {
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

  canvas.height = window.innerHeight - 170;

  STATIC_PLATFORMS.push(
    // Ground
    new Platform(0, 0, canvas.width, PLATFORM_HEIGHT),
  );
  platforms = STATIC_PLATFORMS;

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

  // Place coordinate system origin in bottom left corner
  context.scale(1, -1);
  context.translate(0, -canvas.height);

  document.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "Space":
        player.jump();
        break;
      case "KeyA":
        leftPressed = true;
        player.walking = Direction.Left;
        break;
      case "KeyD":
        rightPressed = true;
        player.walking = Direction.Right;
        break;
      case "KeyE":
      case "KeyQ":
        const web = new Web(
          player.center.x,
          player.bottomRight.y,
          10,
          player.walking,
        );
        webs.push(web);
        break;
    }
  });
  document.addEventListener("keyup", (event) => {
    switch (event.code) {
      case "KeyA":
        leftPressed = false;
        if (!leftPressed && !rightPressed) {
          player.walking = null;
        } else if (rightPressed) {
          player.walking = Direction.Right;
        }
        break;
      case "KeyD":
        rightPressed = false;
        if (!leftPressed && !rightPressed) {
          player.walking = null;
        } else if (leftPressed) {
          player.walking = Direction.Left;
        }
        break;
    }
  });

  loop();
}
window.addEventListener("load", main);

let i = 0,
  fps = 0;
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
    if (i < 10) {
      i += 1;
    } else {
      i = 0;
      fps = (10 / dt).toFixed(1);
    }
    context.fillStyle = "lightgreen";
    context.textAlign = "right";
    drawText(
      `${fps}
      ${player.jumps}
      0b${player.colliding.toString(2).padStart(4, "0")}`,
      canvas.width - 20,
      20,
    );
  }

  player.update(dt);

  for (const web of webs) {
    if (web.v.x !== 0 || web.v.y !== 0) {
      web.update(dt);
      // TODO: optimize with marching squares or similar
      for (const platform of platforms) {
        if (web.collidesWith(platform)) {
          web.v.x = 0;
          web.v.y = 0;
          const overlap = web.overlapWith(platform);
          const overlapAbs = overlap.abs();
          if (overlapAbs.y > overlapAbs.x) {
            if (web.center.x > platform.center.x) {
              web.r.x = platform.r.x + platform.size.x;
            } else {
              web.r.x = platform.r.x - web.size.x;
            }
          } else {
            if (web.center.y > platform.center.y) {
              web.r.y = platform.r.y + platform.size.y;
            } else {
              web.r.y = platform.r.y - web.size.y;
            }
          }
        }
      }
    }
    web.paint(context);
  }

  player.colliding = 0;
  for (const platform of platforms) {
    if (player.collidesWith(platform)) {
      const overlap = player.overlapWith(platform).abs();
      if (overlap.y < overlap.x) {
        if (player.center.y > platform.center.y) {
          // Place player's top edge at platform's bottom edge
          player.r.y = platform.r.y + platform.size.y;
          player.colliding |= Colliding.Ground;
        } else {
          // Place player's bottom edge at platform's top edge
          player.r.y = platform.r.y - player.size.y;
          player.colliding |= Colliding.Ceiling;
        }
        player.v.y = 0;
      } else {
        if (player.center.x > platform.center.x) {
          // Place player's left edge at platform's right edge
          player.r.x = platform.r.x + platform.size.x;
          player.colliding |= Colliding.WallLeft;
        } else {
          // Place player's right edge at platform's left edge
          player.r.x = platform.r.x - player.size.x;
          player.colliding |= Colliding.WallRight;
        }
      }
    }
    platform.paint(context);
  }

  // Stop the player at the left or right edge of the screen
  if (player.r.x <= 0) {
    player.r.x = 0;
    player.colliding |= Colliding.WallLeft;
  } else if (player.r.x + player.size.x >= canvas.width) {
    player.r.x = canvas.width - player.size.x;
    player.colliding |= Colliding.WallRight;
  }

  const currentScore = Math.floor(player.r.y / PLATFORM_DISTANCE);
  if (player.colliding & Colliding.Ground) {
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

  generatePlatforms();

  player.paint(context);
}

function generatePlatforms() {
  while (generatedUntil - player.r.y < 2 * canvas.height) {
    const w = Math.round((100 + rand() * 100) / PLATFORM_HEIGHT) * PLATFORM_HEIGHT;
    const h = PLATFORM_HEIGHT;
    const x = (canvas.width - w) * rand();
    const y = generatedUntil + PLATFORM_DISTANCE;
    generatedUntil = y;
    platforms.push(new Platform(x, y, w, h));
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
