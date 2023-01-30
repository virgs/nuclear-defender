import { configuration } from '../constants/configuration';
import { TileDepthCalculator } from '../scenes/tile-depth-calculator';
export class SpriteCreator {
    config;
    constructor(config) {
        this.config = config;
    }
    createSprite() {
        const sprite = this.config.scene.add.sprite(this.config.worldPosition.x, this.config.worldPosition.y, configuration.tiles.spriteSheetKey, this.config.code);
        sprite.scale = configuration.world.scale;
        sprite.setOrigin(0);
        sprite.setDepth(new TileDepthCalculator().calculate(this.config.code, sprite.y));
        if (this.config.playable) {
            sprite.setPipeline('Light2D');
        }
        return sprite;
    }
}
