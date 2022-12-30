export enum Tiles {
    empty = 0,
    box = 9,
    target = 64,
    wall = 100,
    hero = 52,
    floor = 89,
    boxOnTarget = 7,
    heroOnTarget = 71,
    // not mapped yet
    oily,
    spring,
    treadmil,
    oneWayDoor,
}

export const getTileFromChar = (char: string): Tiles => {
    switch (char.toLowerCase()) {
        case ' ':
            return Tiles.floor;
        case 't':
            return Tiles.treadmil;
        case 'd':
            return Tiles.oneWayDoor;
        case 'o':
            return Tiles.oily;
        case 's':
            return Tiles.spring;
        case '#':
            return Tiles.wall;
        case '.':
            return Tiles.target;
        case '$':
            return Tiles.box;
        case '*':
            return Tiles.boxOnTarget;
        case '@':
            return Tiles.hero;
        case '+':
            return Tiles.heroOnTarget;
        default:
            return Tiles.empty;
    }
};