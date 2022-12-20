import {Directions} from '../constants/directions';
import {configuration} from '../constants/configuration';
import {TimeController} from '../constants/time-controller';

export function getTweenFromDirection(direction: Directions) {
    switch (direction) {
        case Directions.DOWN:
            return tween.DOWN;
        case Directions.UP:
            return tween.UP;
        case Directions.LEFT:
            return tween.LEFT;
        case Directions.RIGHT:
            return tween.RIGHT;
    }
}

const tween = {
    DOWN: {
        y: '+=' + configuration.verticalTileSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    },
    LEFT: {
        x: '-=' + configuration.horizontalTileSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    },
    RIGHT: {
        x: '+=' + configuration.horizontalTileSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    },
    UP: {
        y: '-=' + configuration.verticalTileSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    }
};