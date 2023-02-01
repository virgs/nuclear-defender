import { configuration } from '@/constants/configuration';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
export class GameObjectCreator {
    config;
    constructor(config) {
        this.config = config;
    }
    createSprite(frame) {
        return this.prepareGameObject(this.config.scene.add.sprite(this.config.worldPosition.x, this.config.worldPosition.y, this.config.assetSheetKey, frame));
    }
    createImage(frame) {
        return this.prepareGameObject(this.config.scene.add.image(this.config.worldPosition.x, this.config.worldPosition.y, this.config.assetSheetKey, frame));
    }
    prepareGameObject(image) {
        image.scale = configuration.world.scale;
        image.setOrigin(0);
        image.setDepth(new TileDepthCalculator().calculate(this.config.code, image.y));
        if (this.config.playable) {
            image.setPipeline('Light2D');
        }
        return image;
    }
}
