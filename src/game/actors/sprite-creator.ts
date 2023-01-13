import type Phaser from 'phaser';
import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import {configuration} from '@/game/constants/configuration';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';

export class SpriteCreator {
    private readonly scene: Phaser.Scene;
    private readonly tileCode: Tiles;

    constructor(config: { code: Tiles; scene: Phaser.Scene }) {
        this.scene = config.scene;
        this.tileCode = config.code;
    }

    public createSprite(worldPosition: Point): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(worldPosition.x, worldPosition.y, configuration.tiles.spriteSheetKey, this.tileCode);
        sprite.scale = configuration.world.scale;
        sprite.setOrigin(0);
        sprite.setDepth(new TileDepthCalculator().calculate(this.tileCode, sprite.y));
        sprite.setPipeline('Light2D');

        return sprite;
    }
}