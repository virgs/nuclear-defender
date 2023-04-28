import type { SpriteSheetLines } from '@/animations/animation-atlas';
import { configuration } from '@/constants/configuration';
import { Directions } from '@/constants/directions';
import type { Point } from '@/math/point';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
import type Phaser from 'phaser';


export type AnimationConfig = {
    spriteSheetLine: SpriteSheetLines,
    playable: boolean;
    worldPosition: Point;
    scene: Phaser.Scene,
};

interface Animation {
    key: string;
    frames: {
        key: string;
        frame: number;
    }[];
    startFrame: number;
}

export class AnimationCreator {
    private readonly config: AnimationConfig;

    constructor(config: AnimationConfig) {
        this.config = config;
    }

    public createImage(frame: number): Phaser.GameObjects.Image {
        return this.prepareGameObject(this.config.scene.add.image(this.config.worldPosition.x, this.config.worldPosition.y,
            configuration.tiles.newSpriteSheetKey, frame)) as Phaser.GameObjects.Image;
    }

    public createSprite(frame: number): Phaser.GameObjects.Sprite {
        return this.prepareGameObject(this.config.scene.add.sprite(this.config.worldPosition.x, this.config.worldPosition.y,
            configuration.tiles.newSpriteSheetKey, frame)) as Phaser.GameObjects.Sprite;
    }

    public getCurrentInitialFrame(spriteSheetLine: SpriteSheetLines, orientation: Directions, stateIndex: number): number {
        const numberOfDirections = 4;
        return spriteSheetLine * configuration.tiles.numOfFramesPerLine +
            configuration.tiles.framesPerAnimation * numberOfDirections * stateIndex +
            configuration.tiles.framesPerAnimation * orientation;
    }

    public createAnimations(spriteSheetLine: SpriteSheetLines, animationStates: string[]): Animation[] {
        const animations: Animation[] = [];
        animationStates
            .forEach((spriteAnimation, spriteAnimationIndex) => {
                Object.keys(Directions)
                    .filter(key => !isNaN(Number(key)))
                    .map(key => Number(key) as Directions)
                    .forEach(direction => {
                        const initialFrame = this.getCurrentInitialFrame(spriteSheetLine, direction, spriteAnimationIndex)
                        const animation = {
                            key: spriteAnimation + '.' + Directions[direction],
                            frames: Array.from(new Array(configuration.tiles.framesPerAnimation))
                                .map((_, index) => ({
                                    key: configuration.tiles.newSpriteSheetKey,
                                    frame: initialFrame + index
                                })),
                            startFrame: initialFrame,
                        };
                        animations.push(animation);
                    });
            });
        return animations;
    }


    private prepareGameObject(image: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image):
        Phaser.GameObjects.GameObject {
        image.scale = configuration.world.scale;
        image.setOrigin(0);
        image.setDepth(new TileDepthCalculator().newCalculate(this.config.spriteSheetLine, image.y));
        if (this.config.playable) {
            image.setPipeline('Light2D');
        }
        return image;
    }
}