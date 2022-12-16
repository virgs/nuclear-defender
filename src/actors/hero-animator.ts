import {Direction} from "../constants/direction";
import {configuration} from "../constants/configuration";
import {getTweenFromDirection} from "./tween";

export type HeroMovement = {
    tween: {
        x?: string,
        y?: string,
        duration: number
    }
    walking: HeroAnimation,
    idle: HeroAnimation
};

enum HeroAnimation {
    IDLE_DOWN = "IDLE_DOWN",
    IDLE_LEFT = "IDLE_LEFT",
    IDLE_UP = "IDLE_UP",
    IDLE_RIGHT = "IDLE_RIGHT",
    DOWN = "DOWN",
    LEFT = "LEFT",
    UP = "UP",
    RIGHT = "RIGHT"
}

export class HeroAnimator {
    public map(direction: Direction): HeroMovement {
        switch (direction) {
            case Direction.DOWN:
                return {
                    walking: HeroAnimation.DOWN,
                    idle: HeroAnimation.IDLE_DOWN,
                    tween: getTweenFromDirection(Direction.DOWN)
                }
            case Direction.LEFT:
                return {
                    walking: HeroAnimation.LEFT,
                    idle: HeroAnimation.IDLE_LEFT,
                    tween: getTweenFromDirection(Direction.LEFT)
                }
            case Direction.RIGHT:
                return {
                    walking: HeroAnimation.RIGHT,
                    idle: HeroAnimation.IDLE_RIGHT,
                    tween: getTweenFromDirection(Direction.RIGHT)
                }
            case Direction.UP:
                return {
                    walking: HeroAnimation.UP,
                    idle: HeroAnimation.IDLE_UP,
                    tween: getTweenFromDirection(Direction.UP)
                }
        }

    }

    public createAnimations() {
        return [
            {
                key: HeroAnimation.IDLE_DOWN,
                frames: this.generateFrames(52)
            },
            {
                key: HeroAnimation.IDLE_LEFT,
                frames: this.generateFrames(81)
            },
            {
                key: HeroAnimation.IDLE_UP,
                frames: this.generateFrames(55)
            },
            {
                key: HeroAnimation.IDLE_RIGHT,
                frames: this.generateFrames(78)
            },
            {
                key: HeroAnimation.DOWN,
                frames: this.generateFrames(52, 53, 54),
                frameRate: configuration.frameRate,
                repeat: -1
            },
            {
                key: HeroAnimation.LEFT,
                frames: this.generateFrames(81, 82, 83),
                frameRate: configuration.frameRate,
                repeat: -1
            },
            {
                key: HeroAnimation.UP,
                frames: this.generateFrames(55, 56, 57),
                frameRate: configuration.frameRate,
                repeat: -1
            },
            {
                key: HeroAnimation.RIGHT,
                frames: this.generateFrames(78, 79, 80),
                frameRate: configuration.frameRate,
                repeat: -1
            },
        ]
    }

    private generateFrames(...frames: number[]) {
        return frames.map(item => {
            return {
                key: configuration.spriteSheetKey,
                frame: item
            }
        })
    }
}