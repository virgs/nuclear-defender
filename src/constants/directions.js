export var Directions;
(function (Directions) {
    Directions[Directions["LEFT"] = 0] = "LEFT";
    Directions[Directions["UP"] = 1] = "UP";
    Directions[Directions["RIGHT"] = 2] = "RIGHT";
    Directions[Directions["DOWN"] = 3] = "DOWN";
})(Directions || (Directions = {}));
export const getOppositeDirectionOf = (direction) => {
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
export const rotateDirectionClockwise = (direction) => {
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
export const directionCharMap = new Map();
directionCharMap.set('u', Directions.UP);
directionCharMap.set('l', Directions.LEFT);
directionCharMap.set('d', Directions.DOWN);
directionCharMap.set('r', Directions.RIGHT);
export const getDirectionFromChar = (char) => {
    return directionCharMap.get(char.toLowerCase());
};
