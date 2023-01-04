import {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export class FeatureRemover {
    private readonly featuresToStripOff;

    constructor(featuresToStripOff: Tiles[]) {
        this.featuresToStripOff = featuresToStripOff;
    }

    public strip(dressedLayeredTileMatrix: MultiLayeredMap): { removedFeatures: Map<Tiles, Point[]>; strippedLayeredTileMatrix: MultiLayeredMap } {
        const removed: Map<Tiles, Point[]> = new Map();
        this.featuresToStripOff.forEach(feature => removed.set(feature, []));
        const deepCopy = JSON.parse(JSON.stringify(dressedLayeredTileMatrix)) as MultiLayeredMap;
        deepCopy.layeredTileMatrix
            .forEach((line, y) =>
                line
                    .forEach((layers: OrientedTile[], x: number, editableLine) =>
                        editableLine[x] = layers
                            .filter(item => {
                                if (this.featuresToStripOff.includes(item.code)) {
                                    removed.get(item.code)!.push(new Point(x, y));
                                    return false;
                                }
                                return true;
                            })));
        return {
            strippedLayeredTileMatrix: deepCopy,
            removedFeatures: removed
        };
    }
}