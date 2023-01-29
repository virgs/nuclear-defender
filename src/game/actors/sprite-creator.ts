import type Phaser from 'phaser';
import {configuration} from '@/game/constants/configuration';
import type {GameActorConfig} from '@/game/actors/game-actor';
import {TileDepthCalculator} from '@/game/scenes/tile-depth-calculator';

export class SpriteCreator {
    private readonly config: GameActorConfig;

    constructor(config: GameActorConfig) {
        this.config = config;
    }

    public createSprite(): Phaser.GameObjects.Sprite {
        const sprite = this.config.scene.add.sprite(this.config.worldPosition.x, this.config.worldPosition.y,
            configuration.tiles.spriteSheetKey, this.config.code);
        sprite.scale = configuration.world.scale;
        sprite.setOrigin(0);
        sprite.setDepth(new TileDepthCalculator().calculate(this.config.code, sprite.y));
        if (this.config.playable) {
            sprite.setPipeline('Light2D');
        }
        return sprite;
    }
}