import BiMap from 'bidirectional-map';

export enum Tiles {
    empty = 0,
    box = 9,
    target = 64,
    wall = 100,
    hero = 52,
    floor = 89,
    boxOnTarget = 7,
    heroOnTarget = 71,
    spring = 73,
    oily = 49,
    oneWayDoor = 47,
    // not mapped yet
    treadmil,
}

const tileCharMap = new BiMap({
    ' ': Tiles.floor,
    't': Tiles.treadmil,
    'w': Tiles.oneWayDoor,
    'o': Tiles.oily,
    's': Tiles.spring,
    '#': Tiles.wall,
    '.': Tiles.target,
    '$': Tiles.box,
    '@': Tiles.hero,
});

export const getTileFromChar = (char: string): Tiles => {
    return tileCharMap.get(char.toLowerCase()) || Tiles.empty;
};

const layeredCharMap = new BiMap({
    '*': [tileCharMap.getKey(Tiles.box), tileCharMap.getKey(Tiles.target)],
    '+': [tileCharMap.getKey(Tiles.hero), tileCharMap.getKey(Tiles.target)],
});

export const removeImplicitDoubleLayer = (encoded: string): string => {
    let result = encoded;
    for (let [key, replacement] of layeredCharMap.entries()) {
        result = result.replace(new RegExp('\\' + key, 'g'), `[${replacement.join('')}]`);
    }
    return result;
};

