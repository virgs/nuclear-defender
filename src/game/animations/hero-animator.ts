import {getTweenFromDirection} from './tween';
import {Directions} from '../constants/directions';
import {configuration} from '../constants/configuration';

export type HeroMovement = {
    tween: {
        x?: string,
        y?: string,
        duration: number,
        ease: string;
    }
    walking: HeroAnimation,
    idle: HeroAnimation
};

enum HeroAnimation {
    IDLE_DOWN = 'IDLE_DOWN',
    IDLE_LEFT = 'IDLE_LEFT',
    IDLE_UP = 'IDLE_UP',
    IDLE_RIGHT = 'IDLE_RIGHT',
    DOWN = 'DOWN',
    LEFT = 'LEFT',
    UP = 'UP',
    RIGHT = 'RIGHT'
}

export class HeroAnimator {
    public map(direction: Directions): HeroMovement {
        switch (direction) {
            case Directions.DOWN:
                return {
                    walking: HeroAnimation.DOWN,
                    idle: HeroAnimation.IDLE_DOWN,
                    tween: getTweenFromDirection(Directions.DOWN)
                };
            case Directions.LEFT:
                return {
                    walking: HeroAnimation.LEFT,
                    idle: HeroAnimation.IDLE_LEFT,
                    tween: getTweenFromDirection(Directions.LEFT)
                };
            case Directions.RIGHT:
                return {
                    walking: HeroAnimation.RIGHT,
                    idle: HeroAnimation.IDLE_RIGHT,
                    tween: getTweenFromDirection(Directions.RIGHT)
                };
            case Directions.UP:
                return {
                    walking: HeroAnimation.UP,
                    idle: HeroAnimation.IDLE_UP,
                    tween: getTweenFromDirection(Directions.UP)
                };
        }

    }

    public createAnimations() {
        return [
            {
                key: HeroAnimation.IDLE_DOWN,
                //TODO replace magic values with enum codes
                frames: this.generateFrames(52, 1)
            },
            {
                key: HeroAnimation.IDLE_LEFT,
                frames: this.generateFrames(81, 1)
            },
            {
                key: HeroAnimation.IDLE_UP,
                frames: this.generateFrames(55, 1)
            },
            {
                key: HeroAnimation.IDLE_RIGHT,
                frames: this.generateFrames(78, 1)
            },
            {
                key: HeroAnimation.DOWN,
                frames: this.generateFrames(52, 3),
                frameRate: configuration.frameRate,
                repeat: -1
            },
            {
                key: HeroAnimation.LEFT,
                frames: this.generateFrames(81, 3),
                frameRate: configuration.frameRate,
                repeat: -1
            },
            {
                key: HeroAnimation.UP,
                frames: this.generateFrames(55, 3),
                frameRate: configuration.frameRate,
                repeat: -1
            },
            {
                key: HeroAnimation.RIGHT,
                frames: this.generateFrames(78, 3),
                frameRate: configuration.frameRate,
                repeat: -1
            },
        ];
    }

    private generateFrames(initialFrame: number, numOfFrames: number) {
        return Array.from(new Array(numOfFrames))
            .map((_, index) => ({
                key: configuration.tiles.spriteSheetKey,
                frame: initialFrame + index
            }));
    }
}