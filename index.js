const JUMPS = 3;
const GRAVITY = -40;
// const AIR_FRICTION = 0.2;
const GROUND_FRICTION = 4;
const WALK_VELOCITY = 40;
const JUMP_VELOCITY = 120;
const MAX_FALL_VELOCITY = -120;
const TOP_PADDING = 200;
const BOTTOM_PADDING = 200;

const _SHOW_HITBOXES = false;

let seed = "jixxklääs";

let canvas, context;
let keyDAPressed = false;
let jumps = 0;
let scrollY = 0;

let highscore = localStorage.getItem("highscore") || 0;
let score = 0;
function setHighscore(it) {
    highscore = it;
    localStorage.setItem("highscore", it);
}

class Vec2 {
    constructor(x, y) {
	this.x = x;
	this.y = y;
    }

    add(other) {
	return new Vec2(
	    this.x + other.x,
	    this.y + other.y,
	);
    }

    mul(factor) {
	return new Vec2(
	    this.x * factor,
	    this.y * factor,
	);
    }
}

class Platform {
    constructor(x, y, w, h) {
	this.pos = new Vec2(x, y);
	this.size = new Vec2(w, h);
    }

    update(dt, colliding, onGround) {}

    paint(context) {
	context.fillStyle = "white";
	context.fillRect(
	    this.pos.x, this.pos.y,
	    this.size.x, this.size.y,
	);
    }
}

let playerHeight;
const playerSprite = new Image();
playerSprite.onload = () => {
    playerHeight = playerSprite.height;
};
playerSprite.src = "player.png";

class Player {
    constructor(x, y, scale) {
	this.pos = new Vec2(x, y);
	this.scale = scale;
	this.size = new Vec2(
	    scale * playerSprite.width / playerSprite.height,
	    scale,
	);

	this.a = new Vec2(0, GRAVITY);
	this.v = new Vec2(0, 0);
    }

    update(dt, colliding, onGround) {
	if (isNaN(this.size.x)) { // dirty bug fix: img.width,img.height are 0 on first load
	    this.size = new Vec2(
		this.scale * playerSprite.width / playerSprite.height,
		this.scale,
	    );
	    return;
	}

	if (!colliding)
	    this.v = this.v.add(this.a.mul(dt));

	const sign = (this.v.x > 0) ? 1 : -1;
	if (onGround && this.v.x !== 0 && !keyDAPressed) {
	    this.v.x += -sign * GROUND_FRICTION;
	}
	/*if (!onGround && this.v.x !== 0) {
			this.v.x += -sign * AIR_FRICTION;
		}*/

	if (this.v.y < MAX_FALL_VELOCITY) {
	    this.v.y = MAX_FALL_VELOCITY;
	}

	this.pos = this.pos.add(this.v.mul(dt));

	const diffTop = canvas.height - (this.pos.y - scrollY + this.size.y) - TOP_PADDING;
	const diffBottom = BOTTOM_PADDING - (this.pos.y - scrollY);
	if (diffTop < 0) {
	    scrollY -= diffTop;
	    context.translate(0, diffTop);
	}
	if (diffBottom > 0) {
	    scrollY -= diffBottom;
	    context.translate(0, diffBottom);
	}
    }

    paint(context) {
	if (this.v.x > 0) {
	    this.direction = "right";
	} else if (this.v.x < 0) {
	    this.direction = "left";
	}

	if (_SHOW_HITBOXES) {
	    context.strokeStyle = "white";
	    context.strokeRect(
		this.pos.x, this.pos.y,
		this.size.x, this.size.y,
	    );
	}

	const center = this.pos.add(this.size.mul(0.5));
	context.save();
	context.translate(center.x, center.y);
	context.scale(this.direction === "left" ? 1 : -1, -1);
	context.translate(-center.x, -center.y);
	context.drawImage(
	    playerSprite,
	    this.pos.x, this.pos.y,
	    this.size.x, this.size.y,
	);
	context.restore();
    }
}

const player = new Player(250, 150, 100);
const objects = [];
let generatedUntilY = 0;

function main() {
    canvas = document.getElementById("canvas");
    canvas.height = window.innerHeight - 170;
    context = canvas.getContext("2d");

    objects.push(
	// Walls
	new Platform(0, 0, 0, Infinity),
	new Platform(canvas.width, 0, 0, Infinity),
	// Ground
	new Platform(0, 0, canvas.width, 10),
    );

    // Place coordinate system origin in bottom left corner
    context.scale(1, -1);
    context.translate(0, -canvas.height);

    document.addEventListener("keydown", event => {
	if (event.code === "Space") {
	    if (jumps < JUMPS) {
		jumps++;
		player.v.y = JUMP_VELOCITY;
	    }
	}

	if (event.code === "KeyD") {
	    player.v.x = WALK_VELOCITY;
	    keyDAPressed = true;
	} else if (event.code === "KeyA") {
	    player.v.x = -WALK_VELOCITY;
	    keyDAPressed = true;
	}
    });
    document.addEventListener("keyup", event => {
	if (event.code === "KeyD" || event.code === "KeyA")
	    keyDAPressed = false;
    });

    loop();
}

let lastTime;
let colliding = false
let onGround = false;

function loop(time) {
    const dt = (time - lastTime) / 1e2;
    lastTime = time;

    window.requestAnimationFrame(loop);

    if (Number.isNaN(dt)) {
	return;
    }

    if (!canvas || !context) {
	return;
    }

    context.clearRect(0, scrollY, canvas.width, canvas.height);

    player.update(dt, colliding, onGround);

    onGround = false;
    let priorityNotOnGround = false;

    const ptl = player.pos; // player top left
    const pbr = player.pos.add(player.size); // player bottom right
    for (const object of objects) {
	const otl = object.pos; // object top left
	const obr = object.pos.add(object.size); // object bottom right

	// Collision detection
	if (
	    pbr.x >= otl.x &&
	    ptl.x <= obr.x &&
	    pbr.y >= otl.y &&
	    ptl.y <= obr.y
	) {
	    colliding = true;

	    let overlap = new Vec2(Infinity, Infinity);
	    if (player.pos.x < object.pos.x) {
		overlap.x = player.pos.x + player.size.x - object.pos.x, player.size.x, object.size.x;
	    } else if (player.pos.x + player.size.x > object.pos.x + object.size.x) {
		overlap.x = object.pos.x + object.size.x - player.pos.x;
	    }
	    if (player.pos.y < object.pos.y) {
		overlap.y = player.pos.y + player.size.y - object.pos.y;
	    } else if (player.pos.y + player.size.y > object.pos.y + object.size.y) {
		overlap.y = object.pos.y + object.size.y - player.pos.y;
	    }
	    overlap.x = Math.min(overlap.x, player.size.x, object.size.x);
	    overlap.y = Math.min(overlap.y, player.size.y, object.size.y);

	    if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
		if (player.pos.y + player.size.y / 2 > object.pos.y + object.size.y / 2) {
		    // ground
		    player.pos.y = object.pos.y + object.size.y;
		    onGround = true;
		} else {
		    // ceiling
		    player.pos.y = object.pos.y - player.size.y;
		    priorityNotOnGround = true;
		}
		player.v.y = 0;
	    } else {
		// wall
		if (player.pos.x + player.size.x / 2 > object.pos.x + object.size.x / 2) {
		    player.pos.x = object.pos.x + object.size.x;
		} else {
		    player.pos.x = object.pos.x - player.size.x;
		}
		// player.v.x = 0;
		// onGround = true;
	    }
	} else {
	    colliding = false;
	}

	// Draw object
	object.paint(context);
    }

    if (priorityNotOnGround)
	onGround = false;

    const newScore = Math.floor(player.pos.y / 250);
    if (onGround) {
	jumps = 0;

	score = newScore;
	if (score > highscore)
	    setHighscore(score);
    } else if (newScore < score) {
	score = newScore;
    }

    const fontSize = 20;
    context.save();
    context.translate(0, canvas.height + scrollY);
    context.scale(1, -1);
    context.font = `${fontSize}px 'Press Start 2P'`;
    context.fillText(`Score: ${score}`, 20, 20 + fontSize);
    context.fillText(`Highscore: ${highscore}`, 20, 20 + fontSize + (fontSize + 10) * 1);
    context.restore();

    while (generatedUntilY - player.pos.y < 2 * canvas.height) {
	const w = 100 + Math.random() * 100;
	const h = 10;
	const x = (canvas.width - w) * Math.random();
	const y = generatedUntilY + 250;
	generatedUntilY += 250;
	objects.push(new Platform(x, y, w, h));
    }

    player.paint(context);
}

window.addEventListener("load", main);
