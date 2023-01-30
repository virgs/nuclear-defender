import { Tiles } from '@/levels/tiles';
import { configuration } from '@/constants/configuration';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
export class FloorActor {
    floorPic;
    floorMaskShape;
    screenPropertiesCalculator;
    constructor(config) {
        this.screenPropertiesCalculator = config.screenPropertiesCalculator;
        this.floorMaskShape = config.scene.make.graphics({});
        this.floorPic = config.scene.add.image(0, 0, configuration.floorTextureKey);
        this.floorPic.scale = 2 * configuration.gameWidth / this.floorPic.width;
        if (config.playable) {
            this.floorPic.setPipeline('Light2D');
        }
        this.floorPic.setDepth(new TileDepthCalculator().calculate(Tiles.floor, -10));
    }
    addTileMask(tilePosition) {
        const verticalBuffer = 10;
        const worldPosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(tilePosition);
        this.floorMaskShape.beginPath();
        this.floorMaskShape.fillRectShape(new Phaser.Geom.Rectangle(worldPosition.x, worldPosition.y, configuration.world.tileSize.horizontal, configuration.world.tileSize.vertical + verticalBuffer));
    }
    createMask() {
        const mask = this.floorMaskShape.createGeometryMask();
        this.floorPic.setMask(mask);
    }
}
