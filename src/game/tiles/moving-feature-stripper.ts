import {Tiles} from '@/game/tiles/tiles';
import {Point} from '@/game/math/point';
import type {LayeredTileMatrix, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export class MovingFeatureStripper {
    private readonly featuresToStripOff = [Tiles.hero, Tiles.box];

    public strip(dressedLayeredTileMatrix: LayeredTileMatrix): { movingFeatures: Map<Tiles, Point[]>; strippedLayeredTileMatrix: LayeredTileMatrix } {
        const movingFeatures: Map<Tiles, Point[]> = new Map();
        this.featuresToStripOff.forEach(feature => movingFeatures.set(feature, []));
        const deepCopy = (JSON.parse(JSON.stringify(dressedLayeredTileMatrix)) as OrientedTile[][][]);
        deepCopy
            .forEach((line, y) => {
                line
                    .forEach((layers: OrientedTile[], x: number, editableLine) => {
                        editableLine[x] = layers
                            .filter(item => {
                                if (this.featuresToStripOff.includes(item.code)) {
                                    movingFeatures.get(item.code)!.push(new Point(x, y));
                                    return false;
                                }
                                return true;
                            });
                    });
            });
        return {
            strippedLayeredTileMatrix: deepCopy,
            movingFeatures: movingFeatures
        };
    }
}