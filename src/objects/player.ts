import { GameObject } from "./game_object";
import { _SHOW_DEBUG_INFO } from "../index";
import { SPRITES } from "../sprites";
import { Vec2 } from "../vector";

const JUMPS = 3;
const GRAVITY = -40;
const GROUND_FRICTION = 4;
const WALK_VELOCITY = 40;
const JUMP_VELOCITY = 120;
const MAX_FALL_VELOCITY = -120;

export enum Direction {
  Left = "Left",
  Right = "Right",
}

export interface Collision {
  ground: boolean;
  ceiling: boolean;
  wall_left: boolean;
  wall_right: boolean;
}

export class Player extends GameObject {
  v = new Vec2(0, 0);
  collision: Collision = {
    ground: false,
    ceiling: false,
    wall_left: false,
    wall_right: false,
  };
  walking: Direction;
  direction: Direction;
  jumps = 0;

  #walkingAnimationState = 0;
  #walkingAnimationCounter = 0;

  constructor(x: number, y: number, h: number) {
    const aspectRatio = SPRITES.still.width / SPRITES.still.height;
    super(x, y, aspectRatio * h, h);
  }

  update(dt: number) {
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
  }

  paint(context: CanvasRenderingContext2D) {
    if (_SHOW_DEBUG_INFO) {
      context.strokeStyle = "blue";
      context.strokeRect(this.r.x, this.r.y, this.size.x, this.size.y);
    }

    context.save();
    context.translate(this.center.x, this.center.y);
    context.scale(this.direction === Direction.Left ? -1 : 1, -1);
    context.translate(-this.center.x, -this.center.y);

    if (this.collision.ground) {
      if (
        this.walking &&
        !this.collision.wall_left &&
        !this.collision.wall_right
      ) {
        const sprite = SPRITES.walking[this.#walkingAnimationState];
        context.drawImage(
          sprite,
          this.r.x,
          this.r.y,
          (sprite.width / SPRITES.still.width) * this.size.x,
          this.size.y
        );

        // Advance walking animation
        this.#walkingAnimationCounter++;
        this.#walkingAnimationCounter %= 8;
        if (this.#walkingAnimationCounter === 0) {
          this.#walkingAnimationState++;
          this.#walkingAnimationState %= SPRITES.walking.length;
        }
      } else {
        const sprite = SPRITES.still;
        context.drawImage(sprite, this.r.x, this.r.y, this.size.x, this.size.y);
      }
    } else {
      const sprite = SPRITES.jumping;
      const scaledWidth = (sprite.width / SPRITES.still.width) * this.size.x;
      const scaledHeight = (sprite.height / SPRITES.still.height) * this.size.y;
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
