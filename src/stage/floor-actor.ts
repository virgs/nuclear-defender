import { SpriteSheetLines } from '@/animations/sprite-sheet-lines';
import { configuration } from '@/constants/configuration';
import type { Point } from '@/math/point';
import type { ScreenPropertiesCalculator } from '@/math/screen-properties-calculator';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
import type { StageCreatorConfig } from '@/stage/game-stage-creator';

export class FloorActor {
    private readonly floorPic: Phaser.GameObjects.Image;
    private readonly floorMaskShape: Phaser.GameObjects.Graphics;
    private readonly screenPropertiesCalculator: ScreenPropertiesCalculator;

    constructor(config: StageCreatorConfig) {
        this.screenPropertiesCalculator = config.screenPropertiesCalculator;
        this.floorMaskShape = config.scene.make.graphics({});
        this.floorPic = config.scene.add.image(0, 0, configuration.floorTextureKey);
        this.floorPic.scale = 2 * configuration.gameWidth / this.floorPic.width;
        if (config.playable) {
            this.floorPic.setPipeline('Light2D');
        }
        this.floorPic.setDepth(new TileDepthCalculator().newCalculate(SpriteSheetLines.FLOOR, -10));
    }

    public addTileMask(tilePosition: Point): void {
        const verticalBuffer = 10;
        const worldPosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(tilePosition);

        this.floorMaskShape.beginPath();
        this.floorMaskShape.fillRectShape(new Phaser.Geom.Rectangle(worldPosition.x, worldPosition.y,
            configuration.world.tileSize.horizontal, configuration.world.tileSize.vertical + verticalBuffer));
    }

    public createMask(): void {
        const mask = this.floorMaskShape.createGeometryMask();
        this.floorPic!.setMask(mask);
    }
}