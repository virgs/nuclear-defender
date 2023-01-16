export enum Directions {
    LEFT,
    UP,
    RIGHT,
    DOWN
}

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