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
        y: '+=' + configuration.tiles.verticalSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    },
    LEFT: {
        x: '-=' + configuration.tiles.horizontalSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    },
    RIGHT: {
        x: '+=' + configuration.tiles.horizontalSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    },
    UP: {
        y: '-=' + configuration.tiles.verticalSize,
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    }
};