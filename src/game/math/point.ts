import {Directions} from '@/game/constants/directions';

export class Point {
    private _x: number = 0;
    private _y: number = 0;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    public clone(): Point {
        return new Point(this._x, this._y);
    }

    public equal(other: Point): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public calculateOffset(direction: Directions): Point {
        const result = this.clone();
        if (direction === Directions.LEFT) {
            result.x -= 1;
        } else if (direction === Directions.RIGHT) {
            result.x += 1;
        }
        if (direction === Directions.UP) {
            result.y -= 1;
        } else if (direction === Directions.DOWN) {
            result.y += 1;
        }
        return result;
    };

}
