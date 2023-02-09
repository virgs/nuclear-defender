import {Point} from '@/math/point';
import {Tiles} from '@/levels/tiles';
import type {ProcessedMap} from '@/levels/sokoban-map-stripper';
import type {OrientedTile} from '@/levels/standard-sokoban-annotation-tokennizer';

export type MapExploration = {
    wrapped: Point[];
    acessibleEmpties: Point[];
    leaks: Point[];
    unwrapped: Point[]
};

export class MapExplorer {
    private readonly toInvestigate: Point[];
    private readonly dimensions: Point;
    private notInvestigatedYet: { point: Point, tiles: OrientedTile[] }[];

    public constructor(output: ProcessedMap) {
        this.dimensions = new Point(output.raw.width, output.raw.height);
        this.notInvestigatedYet = [];
        output.raw.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
                .forEach((_: any, x: number) => this.notInvestigatedYet.push({
                    point: new Point(x, y),
                    tiles: output.raw.strippedFeatureLayeredMatrix[y][x]
                })));
        const heroPosition = output.removedFeatures.get(Tiles.hero)![0];
        this.toInvestigate = [heroPosition];
    }

    public explore(): MapExploration {
        const wrapped: Point[] = [];
        const mapLeaks: Point[] = [];
        const acessibleEmpty: Point[] = [];
        //Starting from hero position, spread to every neighboor position to check the whole area and eliminate it from notInvestigatedYet.
        //If some feature is still remaining in the notInvestigatedYet, it means it is not in the explorableArea
        while (this.toInvestigate.length > 0) {
            const currentPoint = this.toInvestigate.shift()!;
            const staticItemInThePosition = this.notInvestigatedYet
                .find(staticItem => staticItem.point.isEqualTo(currentPoint))!;
            this.notInvestigatedYet = this.notInvestigatedYet
                .filter(item => item.point.isDifferentOf(currentPoint));
            if (!staticItemInThePosition) {
                continue;
            } else if (staticItemInThePosition.tiles
                .some(tile => tile.code === Tiles.wall)) {
                continue;
            } else if (staticItemInThePosition.tiles
                .some(tile => tile.code === Tiles.empty)) {
                acessibleEmpty.push(currentPoint)
            }
            wrapped.push(currentPoint);
            MapExplorer.getNeighborsOf(currentPoint)
                .forEach(neighbor => {
                    if (neighbor.x < 0 || neighbor.y < 0 ||
                        neighbor.x >= this.dimensions.x ||
                        neighbor.y >= this.dimensions.y) {
                        mapLeaks.push(neighbor)
                        return;
                    }

                    if (this.notInvestigatedYet
                        .find(item => item.point.isEqualTo(neighbor))) {
                        this.toInvestigate.push(neighbor);
                    }
                });
        }

        const unwrapped = this.notInvestigatedYet
            .filter(tile => tile.tiles.length > 0 &&
                tile.tiles
                    .some(layer => layer.code !== Tiles.empty))
            .map(item => item.point);
        return {
            wrapped: wrapped,
            leaks: [...new Set(mapLeaks)],
            acessibleEmpties: acessibleEmpty,
            unwrapped: unwrapped
        }
    }

    private static getNeighborsOf(point: Point): Point[] {
        const result: Point[] = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const x = horizontal + point.x;
                const y = vertical + point.y;
                if (vertical !== 0 || horizontal !== 0) {
                    result.push(new Point(x, y));
                }
            }
        }
        return result;
    }

}