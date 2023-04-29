import { Tiles } from '@/levels/tiles';
import { Point } from '@/math/point';
import type { GameActor, GameActorConfig } from './game-actor';
import { Directions, getAllDirections, getPointFromDirection } from '@/constants/directions';
import type { AnimationConfig } from '@/animations/animation-creator';
import { AnimationCreator } from '@/animations/animation-creator';
import { SpriteSheetLines } from '@/animations/animation-atlas';
import type { OrientedTile } from '@/levels/standard-sokoban-annotation-tokennizer';
import { configuration } from '@/constants/configuration';

export class WallActor implements GameActor {
    private readonly id: number;
    private readonly tilePosition: Point;
    private readonly adjacentPoints: Point[];
    private readonly contentAround: OrientedTile[][][];
    private readonly animationConfig: AnimationConfig;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.contentAround = config.contentAround;
        this.tilePosition = config.tilePosition;

        this.adjacentPoints = getAllDirections()
            .map((direction => getPointFromDirection(direction).sum(new Point(1, 1))))

        this.animationConfig = {
            playable: config.playable,
            scene: config.scene,
            spriteSheetLine: SpriteSheetLines.WALL,
            worldPosition: config.worldPosition
        };

        this.createPicture();
        this.createCorners();
    }

    private createPicture() {
        const frame = this.adjacentPoints
            .reduce((acc, item, index) => {
                return acc + (this.contentAround[item.y][item.x]
                    .some(layer => layer.code === Tiles.wall) ? 0 : Math.pow(2, index))
            }, 0);

        new AnimationCreator(this.animationConfig).createImage(frame + this.animationConfig.spriteSheetLine * configuration.tiles.numOfFramesPerLine);
    }

    private createCorners() {
        const cornersOrder = [[Directions.UP, Directions.RIGHT],
        [Directions.UP, Directions.LEFT],
        [Directions.LEFT, Directions.DOWN],
        [Directions.DOWN, Directions.RIGHT]
        ]
        cornersOrder
            .forEach((item, index) => {
                const corner = item
                    .reduce((acc, side) => acc.sum(getPointFromDirection(side)), new Point(1, 1)); //shift to the center that is the point 1,1
                if (item
                    .every(side => {
                        const point = getPointFromDirection(side).sum(new Point(1, 1));
                        return this.contentAround[point.y][point.x]
                            .some(layer => layer.code === Tiles.wall);
                    }) &&
                    this.contentAround[corner.y][corner.x]
                        .every(layer => layer.code !== Tiles.wall)) {
                    const frame = Math.pow(2, 4) + index;
                    new AnimationCreator(this.animationConfig).createImage(frame + this.animationConfig.spriteSheetLine * configuration.tiles.numOfFramesPerLine)
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