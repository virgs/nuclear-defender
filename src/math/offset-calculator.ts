import {MovingIntention} from '../actors/hero';
import {Point} from './points';
import {Direction} from '../constants/direction';
import {configuration} from '../constants/configuration';

export function calculateOffset(movingIntention: MovingIntention) {

    const offset: Point = {
        x: movingIntention.position.x,
        y: movingIntention.position.y
    };

    if (movingIntention.direction == Direction.LEFT) {
        offset.x -= configuration.horizontalTileSize;
    } else if (movingIntention.direction == Direction.RIGHT) {
        offset.x += configuration.horizontalTileSize;
    }
    if (movingIntention.direction == Direction.UP) {
        offset.y -= configuration.verticalTileSize;
    } else if (movingIntention.direction == Direction.DOWN) {
        offset.y += configuration.verticalTileSize;
    }
    return offset;
}