import { Tiles } from '@/levels/tiles';
import { Directions } from '@/constants/directions';
import { configuration } from '@/constants/configuration';
// order in the file
export var SpriteSheetLines;
(function (SpriteSheetLines) {
    SpriteSheetLines[SpriteSheetLines["HERO"] = 0] = "HERO";
    SpriteSheetLines[SpriteSheetLines["SPRING"] = 1] = "SPRING";
    SpriteSheetLines[SpriteSheetLines["TREADMIL"] = 2] = "TREADMIL";
    SpriteSheetLines[SpriteSheetLines["ONE_WAY_DOOR_BACK"] = 3] = "ONE_WAY_DOOR_BACK";
    SpriteSheetLines[SpriteSheetLines["ONE_WAY_DOOR_FRONT"] = 4] = "ONE_WAY_DOOR_FRONT";
    SpriteSheetLines[SpriteSheetLines["BOX"] = 5] = "BOX";
    SpriteSheetLines[SpriteSheetLines["OIL"] = 6] = "OIL";
    SpriteSheetLines[SpriteSheetLines["WALL"] = 7] = "WALL";
})(SpriteSheetLines || (SpriteSheetLines = {}));
const defaultFeatureAnimations = {
    standing: {
        index: 0,
        numberOfFrames: 3,
        repeat: true
    },
    walking: {
        index: 1,
        numberOfFrames: 3
    },
    pushing: {
        index: 2,
        numberOfFrames: 3,
        onComplete: () => defaultFeatureAnimations.standing
    },
    covering: {
        index: 1,
        numberOfFrames: 3
    },
    uncovering: {
        index: 2,
        numberOfFrames: 3,
        onComplete: () => defaultFeatureAnimations.standing
    }
};
export const AnimationAtlas = {
    orientationOrder: [Directions.DOWN, Directions.UP, Directions.LEFT, Directions.RIGHT],
    numOfFramesPerLine: 36,
    hero: {
        spriteSheet: SpriteSheetLines.HERO,
        assetSheetKey: configuration.tiles.spriteSheetKey,
        oriented: true,
        animations: defaultFeatureAnimations
    },
    spring: {
        spriteSheet: SpriteSheetLines.SPRING,
        assetSheetKey: configuration.tiles.spriteSheetKey,
        oriented: true,
        animations: defaultFeatureAnimations
    },
    oneWayDoor: {
        spriteSheet: SpriteSheetLines.ONE_WAY_DOOR_BACK,
        spriteSheetFront: SpriteSheetLines.ONE_WAY_DOOR_FRONT,
        assetSheetKey: configuration.tiles.spriteSheetKey,
        oriented: true,
        animations: defaultFeatureAnimations
    },
    treadmil: {
        spriteSheet: SpriteSheetLines.TREADMIL,
        assetSheetKey: configuration.tiles.spriteSheetKey,
        oriented: true,
        animations: defaultFeatureAnimations
    },
    oil: {
        spriteSheet: SpriteSheetLines.OIL,
        assetSheetKey: configuration.tiles.spriteSheetKey,
        oriented: false,
        frames: [Tiles.oily, Tiles.oily + 1, Tiles.oily + 1]
    },
    box: {
        spriteSheet: SpriteSheetLines.BOX,
        assetSheetKey: configuration.tiles.spriteSheetKey,
        oriented: false,
        animations: defaultFeatureAnimations
    },
    wall: {
        spriteSheet: SpriteSheetLines.WALL,
        oriented: false,
        assetSheetKey: configuration.tiles.wallSheetKey,
        cornersOrder: [[Directions.UP, Directions.RIGHT],
            [Directions.UP, Directions.LEFT],
            [Directions.LEFT, Directions.DOWN],
            [Directions.DOWN, Directions.RIGHT]
        ]
    }
};
//TODO phaser has a smiliar method built-in. Use it: https://hopefourie.medium.com/successfully-integrating-phaser-3-into-your-react-redux-app-part-3-28628c7b4d4
// private generateFrames(initialFrame: number, numOfFrames: number) {
//     return Array.from(new Array(numOfFrames))
//         .map((_, index) => ({
//             key: configuration.tiles.spriteSheetKey,
//             frame: initialFrame + index
//         }));
// }
//
// function getFrames(state: AnimationState, LEFT: Directions) {
//     state.index
//     Array.from(new Array(state.numberOfFrames))
//         .map((_, index) => ({
//             key: configuration.tiles.spriteSheetKey,
//             frame: state. state.index + index
//         }));
// }
//
// getFrames(AnimationAtlas.hero.animations?.pushing, Directions.LEFT);
