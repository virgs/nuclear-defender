import {TileCode} from './tile-code';

export class MapBuilder {
    public build(levelRows: string[]): TileCode[][] {
        const longestLine = levelRows
            .reduce((acc, item) => Math.max(acc, item.length), 0);
        return levelRows
            .map(row => row.split('')
                .map(char => MapBuilder.getTileTypeFromString(char) + 1) // to match the values generated from Tiled Software
                .concat(new Array(longestLine - row.length)
                    .fill(TileCode.empty)));
    }

    private static getTileTypeFromString(char: string): TileCode {
        switch (char) {
            case '#':
                return TileCode.wall;
            case '.':
                return TileCode.target;
            case '$':
                return TileCode.box;
            case '*':
                return TileCode.boxOnTarget;
            case '@':
                return TileCode.hero;
            case '+':
                return TileCode.heroOnTarget;
            default:
                return TileCode.empty;
        }
    }
}
