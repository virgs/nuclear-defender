export enum Tiles {
    empty = 0,
    box = 9,
    target = 64,
    wall = 100,
    hero = 52,
    floor = 89,
    boxOnTarget = 7,
    treadmil = 71,
    spring = 73,
    oily = 49,
    oneWayDoor = 47,
    // not mapped yet
}

const tileCharMap = new Map<string, Tiles>();
tileCharMap.set('-', Tiles.empty);
tileCharMap.set(' ', Tiles.floor);
tileCharMap.set('t', Tiles.treadmil);
tileCharMap.set('w', Tiles.oneWayDoor);
tileCharMap.set('o', Tiles.oily);
tileCharMap.set('s', Tiles.spring);
tileCharMap.set('#', Tiles.wall);
tileCharMap.set('.', Tiles.target);
tileCharMap.set('$', Tiles.box);
tileCharMap.set('@', Tiles.hero);

export const getTilesFromChar = (char: string): Tiles => {
    return tileCharMap.get(char) || Tiles.empty;
};

const getKeyOfValue = (code: Tiles): string | undefined => {
    for (let [key, value] of tileCharMap.entries()) {
        if (value === code) {
            return key;
        }
    }
    return undefined;
};

const implicitDoubleLayerCharMap: Map<RegExp, string> = new Map();
implicitDoubleLayerCharMap.set(/\*/g, `[${getKeyOfValue(Tiles.box)!.concat(getKeyOfValue(Tiles.target)!)}]`);
implicitDoubleLayerCharMap.set(/\+/g, `[${getKeyOfValue(Tiles.hero)!.concat(getKeyOfValue(Tiles.target)!)}]`);

export const replaceImplicitLayeredTiles = (line: string): string => {
    let result = line;
    for (let [key, value] of implicitDoubleLayerCharMap) {
        result = result.replace(key, value);
    }
    return result;
};
