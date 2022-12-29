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

export const getDirectionFromChar = (char: string): Directions | undefined => {
    switch (char) {
        case 'u':
            return Directions.UP;
        case 'd':
            return Directions.DOWN;
        case 'l':
            return Directions.LEFT;
        case 'r':
            return Directions.RIGHT;
    }
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