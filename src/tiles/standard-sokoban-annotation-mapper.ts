import {TileCode} from './tile-code';

export class StandardSokobanAnnotationMapper {
    public map(levelRows: string[]): TileCode[][] {
        return levelRows
            .map(row => row.split('')
                .map(char => StandardSokobanAnnotationMapper.getTileTypeFromString(char) + 1)); // to match the values generated from Tiled Software
    }

    private static getTileTypeFromString(char: string): TileCode {
        switch (char) {
            case '-':
                return TileCode.empty;
            case ' ':
                return TileCode.floor;
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
