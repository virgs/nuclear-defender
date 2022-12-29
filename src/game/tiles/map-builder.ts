import {Tiles} from './tiles';

export class MapBuilder {
    public build(levelRows: Tiles[][]): Tiles[][] {
        const longestLine = levelRows
            .reduce((acc, item) => Math.max(acc, item.length), 0);
        return levelRows
            .map(row => row
                .concat(new Array(longestLine - row.length)
                    .fill(Tiles.empty)));
    }
}
