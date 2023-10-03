import { GameObject } from "./game_object";
import { _SHOW_DEBUG_INFO } from "../index";
import { SPRITES } from "../sprites";

export const PLATFORM_TILE_SIZE = 30;

export class Platform extends GameObject {
    constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h);
    }

    paint(context: CanvasRenderingContext2D) {
        for (let col = 0; col < this.size.x / PLATFORM_TILE_SIZE; col++) {
            for (let row = 0; row < this.size.y / PLATFORM_TILE_SIZE; row++) {
                context.drawImage(
                    SPRITES.ground,
                    this.r.x + col * PLATFORM_TILE_SIZE,
                    this.r.y + row * PLATFORM_TILE_SIZE,
                    PLATFORM_TILE_SIZE,
                    PLATFORM_TILE_SIZE,
                );
            }
        }

        if (_SHOW_DEBUG_INFO) {
            context.strokeStyle = "red";
            context.strokeRect(this.r.x, this.r.y, this.size.x, this.size.y);
        }
    }
}
