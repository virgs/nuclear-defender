import {TileCode} from './tile-code';

export class MapBuilder {
    public build(levelRows: TileCode[][]): TileCode[][] {
        const longestLine = levelRows
            .reduce((acc, item) => Math.max(acc, item.length), 0);
        return levelRows
            .map(row => row
                .concat(new Array(longestLine - row.length)
                    .fill(TileCode.empty)));
    }
}
