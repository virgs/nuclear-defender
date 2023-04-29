import { SpriteSheetLines } from '@/animations/sprite-sheet-lines';
import { Tiles } from '@/levels/tiles';

export class TileDepthCalculator {

    //TODO remove this method
    public calculate(code: Tiles, y: number): number {
        let modifier = 10;
        switch (code) {
            case Tiles.floor:
                return -100000;
            case Tiles.oily:
                return -90000;
            case Tiles.treadmil:
                return -90000;
            case Tiles.oneWayDoor:
                return -80000;
            case Tiles.target:
                return -70000;
        }
        return (y * 100) + modifier;
    };


    public newCalculate(code: SpriteSheetLines, y: number): number {
        let modifier = 10;
        switch (code) {
            case SpriteSheetLines.FLOOR:
                return -100000;
            case SpriteSheetLines.OIL:
                return -90000;
            case SpriteSheetLines.TREADMIL:
                return -90000;
            case SpriteSheetLines.ONE_WAY_DOOR_BACK:
                return -80000;
            case SpriteSheetLines.TARGET:
                return -70000;
        }
        return (y * 100) + modifier;
    };

}