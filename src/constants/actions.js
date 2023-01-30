import { Directions } from './directions';
export var Actions;
(function (Actions) {
    Actions[Actions["STAND"] = 0] = "STAND";
    Actions[Actions["LEFT"] = 1] = "LEFT";
    Actions[Actions["UP"] = 2] = "UP";
    Actions[Actions["RIGHT"] = 3] = "RIGHT";
    Actions[Actions["DOWN"] = 4] = "DOWN";
})(Actions || (Actions = {}));
export const mapActionToDirection = (action) => {
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
    return undefined;
};
export const mapDirectionToAction = (direction) => {
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
export const mapStringToAction = (char) => {
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
export const mapActionToChar = (action) => Actions[action].charAt(0).toLowerCase();
