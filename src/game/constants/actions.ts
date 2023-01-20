import {Directions} from './directions';

export enum Actions {
    STAND,
    LEFT,
    UP,
    RIGHT,
    DOWN
}

export const mapActionToDirection = (action: Actions): Directions | undefined => {
    switch (action) {
        case Actions.LEFT:
            return Directions.LEFT;
        case Actions.UP:
            return Directions.UP;
        case Actions.RIGHT:
            return Directions.RIGHT;
        case Actions.DOWN:
            return Directions.DOWN;
    }
};

export const mapDirectionToAction = (direction: Directions): Actions => {
    switch (direction) {
        case Directions.LEFT:
            return Actions.LEFT;
        case Directions.UP:
            return Actions.UP;
        case Directions.RIGHT:
            return Actions.RIGHT;
        case Directions.DOWN:
            return Actions.DOWN;
    }
    return Actions.STAND;
};

export const mapStringToAction = (char: string): Actions | undefined => {
    switch (char) {
        case 's':
            return Actions.STAND;
        case 'l':
            return Actions.LEFT;
        case 'u':
            return Actions.UP;
        case 'r':
            return Actions.RIGHT;
        case 'd':
            return Actions.DOWN;
    }
    return undefined;
};

export const mapActionToChar = (action: Actions): string => Actions[action].charAt(0).toLowerCase();