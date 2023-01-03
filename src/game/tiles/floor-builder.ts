import Phaser from 'phaser';
import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import {configuration} from '@/game/constants/configuration';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';
import type {OrientedTile, MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export class FloorBuilder {
    private scene: Phaser.Scene;
    private floorPic: Phaser.GameObjects.Sprite;
    private floorMaskShape: Phaser.GameObjects.Graphics;
    private featurelessMap: MultiLayeredMap;

    constructor(scene: Phaser.Scene, featurelessMap: MultiLayeredMap) {
        this.scene = scene;
        this.featurelessMap = featurelessMap;

        this.floorMaskShape = scene.make.graphics({});
        this.floorPic = this.scene.add.sprite(0, 0, configuration.floorTextureKey);
        this.floorPic.scale = 2 * configuration.gameWidth / this.floorPic.width;
        this.floorPic.setPipeline('Light2D');
        this.floorPic.setDepth(new TileDepthCalculator().calculate(Tiles.floor, -10));
    }

    public createMask() {
        this.featurelessMap.layeredTileMatrix
            .forEach((line, y) => line
                .forEach((cell: OrientedTile[], x: number) => cell
                    .forEach(tile => {
                        const tilePosition = new Point(x, y);
                        if (tile.code === Tiles.floor) {
                            this.createFloorMask(tilePosition);
                        }
                    })));
        const mask = this.floorMaskShape.createGeometryMask();
        // mask.invertAlpha = true

        this.floorPic!.setMask(mask);
    }

    //
    // private createFloors(staticActors: GameActor[]) {
    //     const staticActorsCode = this.addHiddenFloors(staticActors);
    //
    //     //Every floor in the map
    //     this.featurelessMap.tiles
    //         .forEach((line, y) => line
    //             .forEach((tile: OrientedTile, x: number) => {
    //                 if (!staticActorsCode.has(tile.code)) {//it was created in the staticActors loop
    //                     const tilePosition = new Point(x, y);
    //                     if (tile.code === Tiles.floor) {
    //                         this.createFloorMask(tilePosition);
    //                     }
    //                 }
    //             }));
    // }
    //
    // private addHiddenFloors(staticActors: GameActor[]): Set<Tiles> {
    //     const staticActorsCode: Set<Tiles> = new Set<Tiles>();
    //     //stuff that hide floors behind them
    //     staticActors
    //         .forEach(actor => {
    //             staticActorsCode.add(actor.getTileCode());
    //             this.createFloorMask(actor.getTilePosition());
    //         });
    //     return staticActorsCode;
    // }

    private createFloorMask(point: Point) {
        // this.floorMaskShape.fillStyle(0xFFFFFF);
        this.floorMaskShape.beginPath();
        this.floorMaskShape.fillRectShape(new Phaser.Geom.Rectangle(
            (point.x * configuration.world.tileSize.horizontal),
            (point.y * configuration.world.tileSize.vertical),
            configuration.world.tileSize.horizontal, configuration.world.tileSize.vertical));
    }

}