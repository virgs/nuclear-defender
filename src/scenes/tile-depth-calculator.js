import { Tiles } from '../levels/tiles';
export class TileDepthCalculator {
    calculate(code, y) {
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
    }
    ;
}
