import type Phaser from 'phaser';
import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {configuration} from '@/constants/configuration';
import {TileDepthCalculator} from '@/scenes/tile-depth-calculator';
import type {SpriteSheetLines} from '@/animations/animation-atlas';


export type AnimationConfig = {
    spriteSheetLine: SpriteSheetLines,
    playable: boolean;
    worldPosition: Point;
    scene: Phaser.Scene,
};

export class AnimationCreator {
    private readonly config: AnimationConfig;

    constructor(config: AnimationConfig) {
        this.config = config;
    }

    public createImage(frame: number): Phaser.GameObjects.Image {
        return this.prepareGameObject(this.config.scene.add.image(this.config.worldPosition.x, this.config.worldPosition.y,
            configuration.tiles.wallSheetKey, frame)) as Phaser.GameObjects.Image;
    }

    private prepareGameObject(image: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image):
        Phaser.GameObjects.GameObject {
        image.scale = configuration.world.scale;
        image.setOrigin(0);
        //TODO uncomment line bellow
        // image.setDepth(new TileDepthCalculator().calculate(this.config.spriteSheetLine, image.y));
        image.setDepth(new TileDepthCalculator().calculate(Tiles.wall, image.y));
        if (this.config.playable) {
            image.setPipeline('Light2D');
        }
        return image;
    }
}