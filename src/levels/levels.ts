import {TileCode} from '../tiles/tile-code';

export const levels = [[
    [TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall],
    [TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall],
    [TileCode.wall, TileCode.floor, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.floor, TileCode.empty, TileCode.box, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.floor, TileCode.boxOnTarget, TileCode.heroOnTarget, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.floor, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall]
]]
    .map(level => level
        .map(line => line
            .map(tile => tile + 1))); // to match the values generated from Tiled Software