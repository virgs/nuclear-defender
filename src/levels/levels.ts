import {TileCodes} from '../tiles/tile-codes';

export const levels = [[
    [TileCodes.wall, TileCodes.wall, TileCodes.wall, TileCodes.wall, TileCodes.wall, TileCodes.wall],
    [TileCodes.wall, TileCodes.target, TileCodes.empty, TileCodes.empty, TileCodes.empty, TileCodes.wall],
    [TileCodes.wall, TileCodes.box, TileCodes.empty, TileCodes.empty, TileCodes.empty, TileCodes.wall],
    [TileCodes.wall, TileCodes.hero, TileCodes.empty, TileCodes.empty, TileCodes.empty, TileCodes.wall],
    [TileCodes.wall, TileCodes.empty, TileCodes.empty, TileCodes.empty, TileCodes.empty, TileCodes.wall],
    [TileCodes.wall, TileCodes.empty, TileCodes.empty, TileCodes.empty, TileCodes.empty, TileCodes.wall],
    [TileCodes.wall, TileCodes.wall, TileCodes.wall, TileCodes.wall, TileCodes.wall, TileCodes.wall]
]]
    .map(level => level
        .map(line => line
            .map(tile => tile + 1))); // to match the values generated from Tiled Software