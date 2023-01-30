import { Directions } from '../constants/directions';
export class Point {
    _x = 0;
    _y = 0;
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    clone() {
        return new Point(this._x, this._y);
    }
    normalize() {
        const size = this.size();
        return new Point(this._x / size, this._y / size);
    }
    isEqualTo(other) {
        return this.x === other.x && this.y === other.y;
    }
    isDifferentOf(other) {
        return !this.isEqualTo(other);
    }
    calculateOffset(direction) {
        const offset = new Point(0, 0);
        if (direction === Directions.LEFT) {
            offset.x -= 1;
        }
        else if (direction === Directions.RIGHT) {
            offset.x += 1;
        }
        if (direction === Directions.UP) {
            offset.y -= 1;
        }
        else if (direction === Directions.DOWN) {
            offset.y += 1;
        }
        return this.sum(offset);
    }
    ;
    subtract(other) {
        return new Point(this.x - other.x, this.y - other.y);
    }
    sum(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }
    multiply(number) {
        return new Point(this.x * number, this.y * number);
    }
    size() {
        return Math.sqrt(this.quadractricSize());
    }
    quadractricSize() {
        return this.x * this.x + this.y + this.y;
    }
}
