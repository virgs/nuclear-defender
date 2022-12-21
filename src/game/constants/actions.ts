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

export const mapStringToAction = (char: string): Actions => {
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
    console.log(`Action not identified (${char}). Converting it to 'STAND'`);
    return Actions.STAND;
};

export const mapActionToString = (action: Actions): string => Actions[action].charAt(0).toLowerCase();