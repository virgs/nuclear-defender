import { Point } from '@/math/point';

export enum Directions {
    DOWN = 0,
    UP = 1,
    LEFT = 2,
    RIGHT = 3,
}

export const getAllDirections = (): Directions[] => Object.keys(Directions)
    .filter(key => !isNaN(Number(key)))
    .map(key => Number(key) as Directions);

export const getDirectionsAsString = (): string[] => getAllDirections()
    .map(direction => Directions[direction])

export const getOppositeDirectionOf = (direction: Directions): Directions => {
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
            return Directions.UP;
    }
};

export const directionCharMap = new Map<string, Directions>();
directionCharMap.set('u', Directions.UP);
directionCharMap.set('l', Directions.LEFT);
directionCharMap.set('d', Directions.DOWN);
directionCharMap.set('r', Directions.RIGHT);

export const getDirectionFromChar = (char: string): Directions | undefined => {
    return directionCharMap.get(char.toLowerCase());
};

export const getPointFromDirection = (direction: Directions): Point => {
    switch (direction) {
        case Directions.LEFT:
            return new Point(-1, 0);
        case Directions.UP:
            return new Point(0, -1);
        case Directions.RIGHT:
            return new Point(1, 0);
        case Directions.DOWN:
            return new Point(0, 1);
    }
}