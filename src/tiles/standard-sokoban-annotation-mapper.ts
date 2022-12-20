import {TileCodes} from './tile-codes';

export class StandardSokobanAnnotationMapper {
    public map(levelRows: string[]): TileCodes[][] {
        return levelRows
            .map(row => row.split('')
                .map(char => StandardSokobanAnnotationMapper.getTileTypeFromString(char) + 1)); // to match the values generated from Tiled Software
    }

    private static getTileTypeFromString(char: string): TileCodes {
        switch (char) {
            case '-':
                return TileCodes.empty;
            case ' ':
                return TileCodes.floor;
            case '#':
                return TileCodes.wall;
            case '.':
                return TileCodes.target;
            case '$':
                return TileCodes.box;
            case '*':
                return TileCodes.boxOnTarget;
            case '@':
                return TileCodes.hero;
            case '+':
                return TileCodes.heroOnTarget;
            default:
                return TileCodes.empty;
        }
    }
}
