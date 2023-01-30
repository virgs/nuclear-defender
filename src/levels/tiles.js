export var Tiles;
(function (Tiles) {
    Tiles[Tiles["empty"] = 0] = "empty";
    Tiles[Tiles["box"] = 9] = "box";
    Tiles[Tiles["target"] = 64] = "target";
    Tiles[Tiles["wall"] = 100] = "wall";
    Tiles[Tiles["hero"] = 52] = "hero";
    Tiles[Tiles["floor"] = 89] = "floor";
    Tiles[Tiles["boxOnTarget"] = 7] = "boxOnTarget";
    Tiles[Tiles["treadmil"] = 71] = "treadmil";
    Tiles[Tiles["spring"] = 73] = "spring";
    Tiles[Tiles["oily"] = 49] = "oily";
    Tiles[Tiles["oneWayDoor"] = 47] = "oneWayDoor";
    // not mapped yet
})(Tiles || (Tiles = {}));
export const dynamicTiles = [Tiles.hero, Tiles.box];
const tileCharMap = new Map();
tileCharMap.set('-', Tiles.empty);
tileCharMap.set(' ', Tiles.floor);
tileCharMap.set('f', Tiles.floor);
tileCharMap.set('t', Tiles.treadmil);
tileCharMap.set('w', Tiles.oneWayDoor);
tileCharMap.set('o', Tiles.oily);
tileCharMap.set('s', Tiles.spring);
tileCharMap.set('#', Tiles.wall);
tileCharMap.set('.', Tiles.target);
tileCharMap.set('$', Tiles.box);
tileCharMap.set('b', Tiles.box);
tileCharMap.set('@', Tiles.hero);
tileCharMap.set('p', Tiles.hero);
export const getTilesFromChar = (char) => {
    return tileCharMap.get(char) || Tiles.empty;
};
const getKeyOfValue = (code) => {
    for (let [key, value] of tileCharMap.entries()) {
        if (value === code) {
            return key;
        }
    }
    return undefined;
};
const implicitDoubleLayerCharMap = new Map();
implicitDoubleLayerCharMap.set(/\*/g, `[${getKeyOfValue(Tiles.box).concat(getKeyOfValue(Tiles.target))}]`);
implicitDoubleLayerCharMap.set(/\+/g, `[${getKeyOfValue(Tiles.hero).concat(getKeyOfValue(Tiles.target))}]`);
export const replaceImplicitLayeredTiles = (line) => {
    let result = line;
    for (let [key, value] of implicitDoubleLayerCharMap) {
        result = result.replace(key, value);
    }
    return result;
};
