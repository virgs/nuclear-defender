import type Phaser from 'phaser';
import {configuration} from '@/constants/configuration';
import type {GameActorConfig} from '@/stage/game-actor';
import {TileDepthCalculator} from '@/scenes/tile-depth-calculator';

export class GameObjectCreator {
    private readonly config: GameActorConfig;

    constructor(config: GameActorConfig) {
        this.config = config;
    }

    public createSprite(): Phaser.GameObjects.Sprite {
        return this.prepareGameObject(this.config.scene.add.sprite(this.config.worldPosition.x, this.config.worldPosition.y,
            configuration.tiles.spriteSheetKey, this.config.code)) as Phaser.GameObjects.Sprite;
    }

    public createImage(): Phaser.GameObjects.Image {
        return this.prepareGameObject(this.config.scene.add.image(this.config.worldPosition.x, this.config.worldPosition.y,
            configuration.tiles.spriteSheetKey, this.config.code)) as Phaser.GameObjects.Image;
    }

    private prepareGameObject(image: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image):
        Phaser.GameObjects.GameObject {
        image.scale = configuration.world.scale;
        image.setOrigin(0);
        image.setDepth(new TileDepthCalculator().calculate(this.config.code, image.y));
        if (this.config.playable) {
            image.setPipeline('Light2D');
        }
        return image;
    }
}