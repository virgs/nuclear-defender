import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Movement} from '@/game/controllers/movement-orchestrator';
import type {OrientedTile, StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import {Directions, getOpositeDirectionOf, rotateDirectionClockwise} from '@/game/constants/directions';

type SegmentAnalysis = { differentBoxes: number; empties: number; targets: number };

export class DeadlockDetector {
    private staticMap: StaticMap;

    constructor(config: { staticMap: StaticMap }) {
        this.staticMap = config.staticMap;
    }

    public deadLocked(movedBox: Movement, boxes: Movement[]): boolean {
        const direction = movedBox.direction!;
        const nextTilePosition = movedBox.nextPosition.calculateOffset(direction);
        if (this.staticMap.tiles[nextTilePosition.y][nextTilePosition.x].code === Tiles.wall) {
            if (this.wallAheadCheck(direction, movedBox, nextTilePosition, boxes)) {
                return true;
            }

            if (this.checkTrappedBoxInCorner(movedBox, direction)) {
                return true;
            }

        }
        return false;
    }

    private wallAheadCheck(direction: Directions, movedBox: Movement, nextTilePosition: Point, boxes: Movement[]) {
        let segment: SegmentAnalysis;
        if (direction === Directions.DOWN || direction === Directions.UP) {
            segment = this.verticalLineSegment(movedBox.nextPosition, nextTilePosition, boxes);
        } else {
            segment = this.horizontalLineSegment(movedBox.nextPosition, nextTilePosition, boxes);
        }
        if (segment.differentBoxes > segment.targets && segment.empties < 2) {
            // console.log('segment.differentBoxes > segment.targets && segment.empties < 2');
            // console.log(segment.differentBoxes, segment.targets, segment.empties);
            // console.log('deadlocked: no way to get it back and no available targets');
            return true;
        }
        return false;
    }

    private checkTrappedBoxInCorner(movedBox: Movement, direction: Directions): boolean {
        const featureAtPosition = this.getFeatureAtPosition(movedBox.nextPosition);
        if (featureAtPosition?.code === Tiles.target || featureAtPosition?.code === Tiles.spring) {
            return false;
        }
        //  ######
        //  #$@  player pushed left (or up, in this case)
        //  #
        //  #

        const clockwiseSide = rotateDirectionClockwise(direction);
        const clockwiseTilePosition = movedBox.nextPosition.calculateOffset(clockwiseSide);
        const otherSide = getOpositeDirectionOf(clockwiseSide);
        const counterClowiseTilePosition = movedBox.nextPosition.calculateOffset(otherSide);
        const cwTile = this.staticMap.tiles[clockwiseTilePosition.y][clockwiseTilePosition.x].code;
        const ccwTile = this.staticMap.tiles[counterClowiseTilePosition.y][counterClowiseTilePosition.x].code;
        if (ccwTile === Tiles.wall || cwTile === Tiles.wall) {
            console.log(cwTile, ccwTile);
            console.log('deadlocked: trapped in between walls');
            return true;
        }
        return false;
    }

    private verticalLineSegment(tilePosition: Point, nextTilePosition: Point, boxes: Movement[]): SegmentAnalysis {
        //  ###      player pushed left (or right)
        //  #
        //  #$@
        //  #
        //  # ##

        let empties = 0;
        let targets = 0;
        for (let x = 0; x < this.staticMap.width; ++x) {
            const currentLineTile = this.staticMap.tiles[tilePosition.y][x].code;
            if (currentLineTile === Tiles.target) {
                ++targets;
            }
            const nextLineTile = this.staticMap.tiles[nextTilePosition.y][x].code;
            if (nextLineTile !== Tiles.wall && nextLineTile !== Tiles.empty) {
                ++empties;
            }
        }
        const differentBoxes = boxes
            .filter(box => box.nextPosition.y === tilePosition.y)
            .reduce((acc, _) => acc + 1, 0);
        return {empties, targets, differentBoxes};
    }

    private horizontalLineSegment(tilePosition: Point, nextTilePosition: Point, boxes: Movement[]): SegmentAnalysis {
        //        player pushed down (or up)
        //  #     @     #
        //  #     $     #
        //  #############
        let empties = 0;
        let targets = 0;
        for (let y = 0; y < this.staticMap.height; ++y) {
            const currentColumnTile = this.staticMap.tiles[y][tilePosition.x].code;
            if (currentColumnTile === Tiles.target) {
                ++targets;
            }

            const nextColumnTile = this.staticMap.tiles[y][nextTilePosition.x].code;
            if (nextColumnTile !== Tiles.wall && nextColumnTile !== Tiles.empty) {
                ++empties;
            }
        }

        const differentBoxes = boxes
            .filter(box => box.nextPosition.x === tilePosition.x)
            .reduce((acc, _) => acc + 1, 0);
        return {empties, targets, differentBoxes};
    }

    public getFeatureAtPosition(position: Point): OrientedTile | undefined {
        if (position.x < this.staticMap.width && position.y < this.staticMap.height
            && position.x >= 0 && position.y >= 0) {
            return this.staticMap.tiles[position.y][position.x];
        }
        return undefined;
    }
}