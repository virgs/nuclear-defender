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

    public normalize(): Point {
        const size = this.size();
        return new Point(this._x / size, this._y / size);
    }

    public equal(other: Point): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public calculateOffset(direction: Directions): Point {
        const offset = new Point(0, 0);
        if (direction === Directions.LEFT) {
            offset.x -= 1;
        } else if (direction === Directions.RIGHT) {
            offset.x += 1;
        }
        if (direction === Directions.UP) {
            offset.y -= 1;
        } else if (direction === Directions.DOWN) {
            offset.y += 1;
        }

        return this.sum(offset);
    };

    public subtract(other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y);
    }

    public sum(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }

    public multiply(number: number): Point {
        return new Point(this.x * number, this.y * number);
    }

    public size(): number {
        return Math.sqrt(this.x * this.x + this.y + this.y);
    }
}
