import { Tiles } from '@/levels/tiles';
import { Point } from '@/math/point';
import { configuration } from '@/constants/configuration';
import { GameObjectCreator } from '@/stage/game-object-creator';
export class WallActor {
    id;
    tilePosition;
    static adjacentPoints = [new Point(1, 2),
        new Point(1, 0),
        new Point(0, 1),
        new Point(2, 1)]; //right
    static adjacentCorners = [
        {
            corner: new Point(2, 0),
            sides: [new Point(1, 0),
                new Point(2, 1)] //right
        },
        {
            corner: new Point(0, 0),
            sides: [new Point(1, 0),
                new Point(0, 1) //left
            ],
        }, {
            corner: new Point(0, 2),
            sides: [new Point(0, 1),
                new Point(1, 2)] //down
        }, {
            corner: new Point(2, 2),
            sides: [new Point(1, 2),
                new Point(2, 1)] //right,
        }
    ];
    constructor(config) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        config.assetSheetKey = configuration.tiles.wallSheetKey;
        this.createPicture(config);
        this.createCorners(config);
    }
    createPicture(config) {
        const frame = WallActor.adjacentPoints
            .reduce((acc, item, index) => {
            return acc + (config.contentAround[item.y][item.x]
                .some(layer => layer.code === Tiles.wall) ? 0 : Math.pow(2, index));
        }, 0); //TODO adjust initial value to Tiles.wall when there is more than the wall in this sheet
        new GameObjectCreator(config).createImage(frame);
    }
    createCorners(config) {
        WallActor.adjacentCorners
            .forEach((item, index) => {
            if (item.sides
                .every(side => config.contentAround[side.y][side.x]
                .some(layer => layer.code === Tiles.wall)) && config.contentAround[item.corner.y][item.corner.x]
                .every(layer => layer.code !== Tiles.wall)) {
                const frame = 0 + Math.pow(2, 4) + index; //TODO adjust initial value to Tiles.wall when there is more than the wall in this sheet
                new GameObjectCreator(config).createImage(frame);
            }
        });
    }
    getId() {
        return this.id;
    }
    getTileCode() {
        return Tiles.wall;
    }
    getTilePosition() {
        return this.tilePosition;
    }
    cover() {
    }
}
