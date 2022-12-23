import {Directions} from '../constants/directions';
import {configuration} from '../constants/configuration';
import {TimeController} from '../constants/time-controller';

export function getTweenFromDirection(direction: Directions, multiplier: number = 1) {
    switch (direction) {
        case Directions.DOWN:
            return tween.DOWN(multiplier);
        case Directions.UP:
            return tween.UP(multiplier);
        case Directions.LEFT:
            return tween.LEFT(multiplier);
        case Directions.RIGHT:
            return tween.RIGHT(multiplier);
    }
}

const tween = {
    DOWN: (multiplier: number) => ({
        y: '+=' + (configuration.tiles.verticalSize * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    }),
    LEFT: (multiplier: number) => ({
        x: '-=' + (configuration.tiles.horizontalSize * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    }),
    RIGHT: (multiplier: number) => ({
        x: '+=' + (configuration.tiles.horizontalSize * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    }),
    UP: (multiplier: number) => ({
        y: '-=' + (configuration.tiles.verticalSize * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs * TimeController.getTimeFactor()
    })
};