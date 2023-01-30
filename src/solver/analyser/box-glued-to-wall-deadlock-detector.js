import { Tiles } from '../../levels/tiles';
import { Directions } from '../../constants/directions';
import { DeadLockDetector } from './dead-lock-detector';
//TODO improve to accomodate richer features
export class BoxGluedToWallDetector extends DeadLockDetector {
    deadLocked(movement) {
        return movement.boxes
            .filter(box => box.currentPosition.isDifferentOf(box.nextPosition))
            .some(movedBox => this.boxIsDeadLocked(movedBox, movement.boxes));
    }
    boxIsDeadLocked(movedBox, moves) {
        if (this.getStaticFeaturesAtPosition(movedBox.nextPosition)
            .some(tile => tile.code === Tiles.spring || tile.code === Tiles.treadmil)) {
            return false;
        }
        const direction = movedBox.direction;
        const nextTilePosition = movedBox.nextPosition.calculateOffset(direction);
        if (this.getStaticFeaturesAtPosition(nextTilePosition)
            .some(tile => tile.code === Tiles.wall)) {
            if (this.wallAheadCheck(direction, movedBox, nextTilePosition, moves)) {
                return true;
            }
        }
        return false;
    }
    wallAheadCheck(moveDirection, movedBox, nextTilePosition, boxes) {
        let segment;
        if (moveDirection === Directions.DOWN || moveDirection === Directions.UP) {
            segment = this.verticalLineSegment(movedBox.nextPosition, nextTilePosition, boxes);
        }
        else {
            segment = this.horizontalLineSegment(movedBox.nextPosition, nextTilePosition, boxes);
        }
        if (segment.boxes > segment.targets && segment.emptiesAhead < 2) {
            // console.log('segment.differentBoxes > segment.targets && segment.empties < 2');
            // console.log(segment.boxes, segment.targets, segment.emptiesAhead);
            // console.log('deadlocked: no way to get it back and no available targets');
            return true;
        }
        return false;
    }
    verticalLineSegment(tilePosition, nextTilePosition, boxes) {
        //        player pushed down (or up)
        //  #     @     #
        //  #     $     #
        //  #############
        let empties = 0;
        let targets = 0;
        for (let x = 0; x < this.staticMap.width; ++x) {
            const currentLineTiles = this.staticMap.strippedFeatureLayeredMatrix[tilePosition.y][x];
            if (currentLineTiles
                .some(tile => tile.code === Tiles.target)) {
                ++targets;
            }
            const nextLineTiles = this.staticMap.strippedFeatureLayeredMatrix[nextTilePosition.y][x];
            if (nextLineTiles
                .some(tile => tile.code !== Tiles.wall && tile.code !== Tiles.empty)) {
                ++empties;
            }
        }
        const differentBoxes = boxes
            .filter(box => box.nextPosition.y === tilePosition.y)
            .reduce((acc, _) => acc + 1, 0);
        return { emptiesAhead: empties, targets, boxes: differentBoxes };
    }
    horizontalLineSegment(tilePosition, nextTilePosition, boxes) {
        //  ###      player pushed left (or right)
        //  #
        //  #$@
        //  #
        //  # ##
        let empties = 0;
        let targets = 0;
        for (let y = 0; y < this.staticMap.height; ++y) {
            const currentColumnTiles = this.staticMap.strippedFeatureLayeredMatrix[y][tilePosition.x];
            if (currentColumnTiles
                .some(tile => tile.code === Tiles.target)) {
                ++targets;
            }
            const nextColumnTiles = this.staticMap.strippedFeatureLayeredMatrix[y][nextTilePosition.x];
            if (nextColumnTiles
                .some(tile => tile.code !== Tiles.wall && tile.code !== Tiles.empty)) {
                ++empties;
            }
        }
        const differentBoxes = boxes
            .filter(box => box.nextPosition.x === tilePosition.x)
            .reduce((acc, _) => acc + 1, 0);
        return { emptiesAhead: empties, targets, boxes: differentBoxes };
    }
}
