import { Vec2 } from "../vector";

export class GameObject {
    r: Vec2;
    size: Vec2;

    constructor(x: number, y: number, w: number, h: number) {
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

    collidesWith(other: GameObject) {
        return (
            this.bottomRight.x >= other.topLeft.x &&
            this.topLeft.x <= other.bottomRight.x &&
            this.bottomRight.y >= other.topLeft.y &&
            this.topLeft.y <= other.bottomRight.y
        );
    }

    overlapWith(other: GameObject) {
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
