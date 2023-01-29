import {Tiles} from '@/game/levels/tiles';

export class TileDepthCalculator {

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

}