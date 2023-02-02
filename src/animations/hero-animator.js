import { Directions } from '@/constants/directions';
import { configuration } from '@/constants/configuration';
var HeroAnimation;
(function (HeroAnimation) {
    HeroAnimation["IDLE_DOWN"] = "IDLE_DOWN";
    HeroAnimation["IDLE_LEFT"] = "IDLE_LEFT";
    HeroAnimation["IDLE_UP"] = "IDLE_UP";
    HeroAnimation["IDLE_RIGHT"] = "IDLE_RIGHT";
    HeroAnimation["DOWN"] = "DOWN";
    HeroAnimation["LEFT"] = "LEFT";
    HeroAnimation["UP"] = "UP";
    HeroAnimation["RIGHT"] = "RIGHT";
})(HeroAnimation || (HeroAnimation = {}));
const animationMap = new Map();
animationMap.set(Directions.DOWN, { walking: HeroAnimation.DOWN, idle: HeroAnimation.IDLE_DOWN });
animationMap.set(Directions.LEFT, { walking: HeroAnimation.LEFT, idle: HeroAnimation.IDLE_LEFT });
animationMap.set(Directions.RIGHT, { walking: HeroAnimation.RIGHT, idle: HeroAnimation.IDLE_RIGHT });
animationMap.set(Directions.UP, { walking: HeroAnimation.UP, idle: HeroAnimation.IDLE_UP });
export class HeroAnimator {
    getAnimation(orientation) {
        return animationMap.get(orientation);
    }
    createAnimations() {
        return [
            {
                key: HeroAnimation.IDLE_DOWN,
                //TODO replace magic values with enum codes
                frames: this.generateFrames(52, 1),
                startFrame: 52,
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
                // repeat: -1
            },
            {
                key: HeroAnimation.LEFT,
                frames: this.generateFrames(81, 3),
                frameRate: configuration.frameRate,
                // repeat: -1
            },
            {
                key: HeroAnimation.UP,
                frames: this.generateFrames(55, 3),
                frameRate: configuration.frameRate,
                // repeat: -1
            },
            {
                key: HeroAnimation.RIGHT,
                frames: this.generateFrames(78, 3),
                frameRate: configuration.frameRate,
                // repeat: -1
            },
        ];
    }
    //TODO phaser has a smiliar method built-in. Use it: https://hopefourie.medium.com/successfully-integrating-phaser-3-into-your-react-redux-app-part-3-28628c7b4d4
    generateFrames(initialFrame, numOfFrames) {
        return Array.from(new Array(numOfFrames))
            .map((_, index) => ({
            key: configuration.tiles.spriteSheetKey,
            frame: initialFrame + index
        }));
    }
}
