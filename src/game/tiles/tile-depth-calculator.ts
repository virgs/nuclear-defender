import {Tiles} from '@/game/tiles/tiles';

export class TileDepthCalculator {

    public calculate(code: Tiles, y: number): number {
        let modifier = 10;
        switch (code) {
            case Tiles.floor:
                return -1000;
            case Tiles.target:
                return -100;
        }
        return (y * 100) + modifier;
    };

}