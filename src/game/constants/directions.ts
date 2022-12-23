import type {Point} from '@/game/math/point';

export enum Directions {
    LEFT,
    UP,
    RIGHT,
    DOWN
}

export const getOpositeDirectionOf = (direction: Directions): Directions => {
    switch (direction) {
        case Directions.UP:
            return Directions.DOWN;
        case Directions.RIGHT:
            return Directions.LEFT;
        case Directions.DOWN:
            return Directions.UP;
        case Directions.LEFT:
            return Directions.RIGHT;
    }
};

export const rotateDirectionClockwise = (direction: Directions): Directions => {
    switch (direction) {
        case Directions.UP:
            return Directions.RIGHT;
        case Directions.RIGHT:
            return Directions.DOWN;
        case Directions.DOWN:
            return Directions.LEFT;
        case Directions.LEFT:
            return Directions.RIGHT;
    }
};

export const calculateOffset = (point: Point, direction: Directions): Point => {
    const result = point;
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

export const sumDirections = (...directions: Directions[]): Directions[] => {
    return directions.reduce((acc, item) => {
        const oposite = getOpositeDirectionOf(item);
        const accIndex = acc
            .findIndex(accItem => accItem === oposite);
        if (accIndex !== -1) {
            acc.splice(accIndex, 1);
        } else {
            acc.push(item);
        }
        return acc;
    }, [] as Directions[]);
};