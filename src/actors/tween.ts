import {configuration} from "../constants/configuration";
import {TimeController} from "../constants/time-controller";
import {Direction} from "../constants/direction";

export function getTweenFromDirection(direction: Direction) {
    switch (direction) {
        case Direction.DOWN:
            return tween.DOWN
        case Direction.UP:
            return tween.UP
        case Direction.LEFT:
            return tween.LEFT
        case Direction.RIGHT:
            return tween.RIGHT
    }
}

const tween = {
    DOWN: {
        y: '+=' + configuration.verticalTileSize,
        duration: configuration.walkingDuration * TimeController.getTimeFactor()
    },
    LEFT: {
        x: '-=' + configuration.horizontalTileSize,
        duration: configuration.walkingDuration * TimeController.getTimeFactor()
    },
    RIGHT: {
        x: '+=' + configuration.horizontalTileSize,
        duration: configuration.walkingDuration * TimeController.getTimeFactor()
    },
    UP: {
        y: '-=' + configuration.verticalTileSize,
        duration: configuration.walkingDuration * TimeController.getTimeFactor()
    }
}