import {Tiles} from '@/levels/tiles';
import {Point} from '@/math/point';
import {configuration} from '@/constants/configuration';
import type {GameActor, GameActorConfig} from './game-actor';
import {GameObjectCreator} from '@/stage/game-object-creator';

type AdjacentCornerData = { sides: Point[], corner: Point };

export class WallActor implements GameActor {
    private readonly id: number;
    private readonly tilePosition: Point;
    private static readonly adjacentPoints = [new Point(1, 2), //down
        new Point(1, 0), //up
        new Point(0, 1), //left
        new Point(2, 1)];//right

    private static readonly adjacentCorners: AdjacentCornerData[] = [
        {
            corner: new Point(2, 0),//up/right
            sides: [new Point(1, 0), //up
                new Point(2, 1)]//right
        },
        {
            corner: new Point(0, 0), //left/up
            sides: [new Point(1, 0), //up
                new Point(0, 1) //left
            ],
        }, {
            corner: new Point(0, 2), //left/down
            sides: [new Point(0, 1), //left,
                new Point(1, 2)] //down
        }, {
            corner: new Point(2, 2),//right/bottom
            sides: [new Point(1, 2),//down
                new Point(2, 1)]//right,
        }]

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        config.assetSheetKey = configuration.tiles.wallSheetKey;
        this.createPicture(config);
        this.createCorners(config);
    }

    private createPicture(config: GameActorConfig) {

        const frame = WallActor.adjacentPoints
            .reduce((acc, item, index) => {
                return acc + (config.contentAround[item.y][item.x]
                    .some(layer => layer.code === Tiles.wall) ? 0 : Math.pow(2, index))
            }, 0); //TODO adjust initial value to Tiles.wall when there is more than the wall in this sheet
        new GameObjectCreator(config).createImage(frame);
    }

    private createCorners(config: GameActorConfig) {
        WallActor.adjacentCorners
            .forEach((item, index) => {
                if (item.sides
                    .every(side => config.contentAround[side.y][side.x]
                        .some(layer => layer.code === Tiles.wall)) && config.contentAround[item.corner.y][item.corner.x]
                    .every(layer => layer.code !== Tiles.wall)) {
                    const frame = 0 + Math.pow(2, 4) + index;//TODO adjust initial value to Tiles.wall when there is more than the wall in this sheet
                    new GameObjectCreator(config).createImage(frame);
                }
            });
    }

    public getId(): number {
        return this.id;
    }

    public getTileCode(): Tiles {
        return Tiles.wall;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public cover(): void {
    }

}