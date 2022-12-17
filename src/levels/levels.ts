import {TileCode} from '../tiles/tile-code';

export const levels = [[
    [TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall],
    [TileCode.wall, TileCode.target, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.box, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.hero, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.empty, TileCode.wall],
    [TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall, TileCode.wall]
]]
    .map(level => level
        .map(line => line
            .map(tile => tile + 1))); // to match the values generated from Tiled Software