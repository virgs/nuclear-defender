import {TileCodes} from './tile-codes';

export class MapBuilder {
    public build(levelRows: TileCodes[][]): TileCodes[][] {
        const longestLine = levelRows
            .reduce((acc, item) => Math.max(acc, item.length), 0);
        return levelRows
            .map(row => row
                .concat(new Array(longestLine - row.length)
                    .fill(TileCodes.empty)));
    }
}
