import BiMap from 'bidirectional-map';

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
            return Directions.UP;
    }
};

export const directionCharMap = new BiMap({
    u: Directions.UP,
    d: Directions.DOWN,
    l: Directions.LEFT,
    r: Directions.RIGHT,
});

export const getDirectionFromChar = (char: string): Directions | undefined => {
    return directionCharMap.get(char);
};