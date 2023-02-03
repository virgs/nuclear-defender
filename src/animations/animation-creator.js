import { Tiles } from '@/levels/tiles';
import { configuration } from '@/constants/configuration';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
export class AnimationCreator {
    config;
    constructor(config) {
        this.config = config;
    }
    createImage(frame) {
        return this.prepareGameObject(this.config.scene.add.image(this.config.worldPosition.x, this.config.worldPosition.y, configuration.tiles.wallSheetKey, frame));
    }
    prepareGameObject(image) {
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
