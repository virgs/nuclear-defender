import {Tiles} from '../../levels/tiles';
import {DeadLockDetector} from '../../solver/analyser/dead-lock-detector';
import type {Movement, MovementOrchestratorOutput} from '../../engine/movement-orchestrator';
import {Directions, getOppositeDirectionOf, rotateDirectionClockwise} from '../../constants/directions';

//TODO improve to accomodate richer features
export class BoxClusterDeadlockDetector extends DeadLockDetector {

    public deadLocked(movement: MovementOrchestratorOutput): boolean {
        return movement.boxes
            .filter(box => box.currentPosition.isDifferentOf(box.nextPosition))
            .some(movedBox => this.boxIsDeadLocked(movedBox));
    }

    private boxIsDeadLocked(movedBox: Movement) {
        const direction = movedBox.direction!;
        const nextTilePosition = movedBox.nextPosition.calculateOffset(direction);
        if (this.getStaticFeaturesAtPosition(nextTilePosition)
            .some(tile => tile.code === Tiles.wall)) {
            if (this.checkTrappedBoxInCorner(movedBox, direction)) {
                return true;
            }
        }
        return false;
    }

    private checkTrappedBoxInCorner(movedBox: Movement, direction: Directions): boolean {
        const featuresAtPosition = this.getStaticFeaturesAtPosition(movedBox.nextPosition);
        if (featuresAtPosition
            .some(tile => tile.code === Tiles.target || tile.code === Tiles.spring || tile.code === Tiles.treadmil)) {
            return false;
        }
        //  #'#'####
        //  '#'$@  player pushed left (or up, in this case)
        //  #
        //  #

        const clockwiseSide = rotateDirectionClockwise(direction);
        const clockwiseTilePosition = movedBox.nextPosition.calculateOffset(clockwiseSide);
        const otherSide = getOppositeDirectionOf(clockwiseSide);
        const counterClowiseTilePosition = movedBox.nextPosition.calculateOffset(otherSide);
        const cwTiles = this.staticMap.strippedFeatureLayeredMatrix[clockwiseTilePosition.y][clockwiseTilePosition.x];
        const ccwTiles = this.staticMap.strippedFeatureLayeredMatrix[counterClowiseTilePosition.y][counterClowiseTilePosition.x];
        if (cwTiles
            .some(tile => tile.code === Tiles.wall) || ccwTiles
            .some(tile => tile.code === Tiles.wall)) {
            // console.log('deadlocked: trapped in a blocked cluster');
            return true;
        }
        return false;
    }

}