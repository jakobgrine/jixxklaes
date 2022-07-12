const JUMPS = 3;
const GRAVITY = -40;
const GROUND_FRICTION = 4;
const WALK_VELOCITY = 40;
const JUMP_VELOCITY = 120;
const WALL_SLIDE_VELOCITY = -30;
const MAX_FALL_VELOCITY = -120;
const TOP_PADDING = 200;
const BOTTOM_PADDING = 200;
const DEFAULT_HASH = "Jixxklääs";
const PLATFORM_HEIGHT = 30;

let _SHOW_DEBUG_INFO = false;
const _FONT_SIZE = 20;

function loadImage(filename) {
  const image = new Image();
  image.src = filename;
  return image;
}

const Sprites = {
  Still: "still.png",
  Walking: [
    "walking_1.png",
    "walking_2.png",
    "walking_3.png",
  ],
  Jumping: "jumping.png",
  Falling: "falling.png",
};
for (const key of Object.keys(Sprites)) {
  if (Array.isArray(Sprites[key])) {
    for (let i = 0; i < Sprites[key].length; i++) {
        Sprites[key][i] = loadImage("sprite/" + Sprites[key][i]);
    }
  } else {
    Sprites[key] = loadImage("sprite/" + Sprites[key]);
  }
}
const groundSprite = loadImage("sprite/ground.png");

// See https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
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
let jumps = 0;
let scrollPosition = 0;
let generatedUntil = 0;
let score = 0;
let highscore = localStorage.getItem("highscore") || 0;

let walkingAnimationState = 0;
let walkingAnimationCounter = 0;

const Colliding = {
  Ceiling: "Ceiling",
  Ground: "Ground",
  Wall: "Wall",
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

  paint(context) {
    context.fillStyle = "white";
    context.fillRect(this.r.x, this.r.y, this.size.x, this.size.y);
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
  notJumpable; // only works on walls

  constructor(x, y, w, h, notJumpable) {
    super(x, y, w, h);
    this.notJumpable = notJumpable || false;
  }

  paint(context) {
    const spriteSize = PLATFORM_HEIGHT;
    for (let col = 0; col < this.size.x / spriteSize; col++) {
      for (let row = 0; row < this.size.y / spriteSize; row++) {
        context.drawImage(groundSprite,
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
  a;
  v;

  constructor(x, y, h) {
  // const aspectRatio = playerSprite ? playerSprite.width / playerSprite.height : 2;
  const aspectRatio = 250 / 270;
  super(x, y, aspectRatio * h, h);

  this.a = new Vec2(0, GRAVITY);
  this.v = new Vec2(0, 0);
  }

  update(dt) {
    if (this.colliding !== Colliding.Ground) {
      this.v = this.v.add(this.a.mul(dt));
    }

    if (this.colliding === Colliding.Wall) {
      // Stop at walls
      this.v.x = 0;
      // Slide down walls
      // TODO: only when facing to the wall
      if (this.direction === this.collisionDirection) {
        this.v.y = WALL_SLIDE_VELOCITY;
      }
    }

    if (this.walking === Direction.Right) {
      this.v.x = WALK_VELOCITY;
    } else if (this.walking === Direction.Left) {
      this.v.x = -WALK_VELOCITY;
    }

    // Slow down when on ground
    const sign = this.v.x > 0 ? 1 : -1;
    if (this.v.x !== 0 && this.colliding === Colliding.Ground && !this.walking) {
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
    if (this.colliding === Colliding.Ground && this.walking) {
      sprite = Sprites.Walking[walkingAnimationState];
      walkingAnimationCounter++;
      if (walkingAnimationCounter > 10) {
        walkingAnimationCounter = 0;
        walkingAnimationState++;
        if (walkingAnimationState >= 3) {
          walkingAnimationState = 0;
        }
      }
    }
    if (!this.colliding || this.colliding === Colliding.Wall) {
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
}

const player = new Player(250, 200, 70);
let objects = [];

let seed, rand;
function setSeed(it) {
  it = decodeURI(it);

  seed = cyrb128(it);
  rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

  objects = [];
  addDefaultPlatforms();
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
  canvas.height = window.innerHeight - 170;
  context = canvas.getContext("2d");

  document
    .getElementById("seed")
    .addEventListener("input", (event) => setSeed(event.target.value));
  window.addEventListener("hashchange", () =>
    setSeed(window.location.hash.substring(1))
  );
  setSeed(window.location.hash.substring(1) || DEFAULT_HASH);

  addDefaultPlatforms();

  // Place coordinate system origin in bottom left corner
  context.scale(1, -1);
  context.translate(0, -canvas.height);

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && jumps < JUMPS && player.colliding !== Colliding.Wall) {
      jumps++;
      player.v.y = JUMP_VELOCITY;
    }

    if (event.code === "KeyA") {
      player.walking = Direction.Left;
    } else if (event.code === "KeyD") {
      player.walking = Direction.Right;
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.code === "KeyD" || event.code === "KeyA") {
      player.walking = null;
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
    drawText(fps, canvas.width - 20, 20);
  }

  player.update(dt);
  const playerCenter = player.r.add(player.size.mul(0.5));

  let onGround = false;
  let noCollisions = true;
  for (const object of objects) {
    if (player.collidesWith(object)) {
      noCollisions = false;
      const objectCenter = object.r.add(object.size.mul(0.5));
      const overlap = player.overlapWith(object).abs();
      if (overlap.y < overlap.x) {
        if (playerCenter.y > objectCenter.y) {
          // Place player's top edge at object's bottom edge
          player.r.y = object.r.y + object.size.y;
          onGround = true;
        } else {
          // Place player's bottom edge at object's top edge
          player.r.y = object.r.y - player.size.y;
          player.colliding = Colliding.Ceiling;
        }
        player.v.y = 0;
      } else {
        if (playerCenter.x > objectCenter.x) {
          // Place player's left edge at object's right edge
          player.r.x = object.r.x + object.size.x;
        } else {
          // Place player's right edge at object's left edge
          player.r.x = object.r.x - player.size.x;
        }
        player.colliding = Colliding.Wall;
        if (!object.notJumpable) {
          jumps = 0;
        }
      }
    }

    object.paint(context);
  }
  if (onGround) {
    player.colliding = Colliding.Ground;
  }
  if (noCollisions) {
    player.colliding = null;
  }

  player.paint(context);

  const newScore = Math.floor(player.r.y / 250);
  if (player.colliding === Colliding.Ground) {
    jumps = 0;
    score = newScore;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore);
    }
  } else if (newScore < score) {
    score = newScore;
  }

  context.textAlign = "left";
  context.fillStyle = "white";
  drawText(`Score: ${score}\nHighscore: ${highscore}`, 20, 20);

  generatePlatforms();

  player.paint(context);
}

function addDefaultPlatforms() {
  objects.push(
    // Walls
    new Platform(0, 0, 0, Infinity, true),
    new Platform(canvas.width, 0, 0, Infinity, true),
    // Ground
    new Platform(0, 0, canvas.width, PLATFORM_HEIGHT),
  );
}

function generatePlatforms() {
  while (generatedUntil - player.r.y < 2 * canvas.height) {
    const w = Math.round((100 + rand() * 100) / PLATFORM_HEIGHT) * PLATFORM_HEIGHT;
    const h = PLATFORM_HEIGHT;
    const x = (canvas.width - w) * rand();
    const y = generatedUntil + 250;
    generatedUntil = y;
    objects.push(new Platform(x, y, w, h));
  }
}

function drawText(text, x, y) {
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
