import {Directions} from '../constants/directions';
import {configuration} from '../constants/configuration';

//TODO get rid of this class
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
        y: '+=' + (configuration.world.tileSize.vertical * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs
    }),
    LEFT: (multiplier: number) => ({
        x: '-=' + (configuration.world.tileSize.horizontal * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs
    }),
    RIGHT: (multiplier: number) => ({
        x: '+=' + (configuration.world.tileSize.horizontal * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs
    }),
    UP: (multiplier: number) => ({
        y: '-=' + (configuration.world.tileSize.vertical * multiplier),
        ease: 'Circular.Out',
        duration: configuration.updateCycleInMs
    })
};