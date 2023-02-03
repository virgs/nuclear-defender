import { Tiles } from '@/levels/tiles';
import { Point } from '@/math/point';
import { getPointFromDirection } from '@/constants/directions';
import { AnimationCreator } from '@/animations/animation-creator';
import { AnimationAtlas, SpriteSheetLines } from '@/animations/animation-atlas';
export class WallActor {
    id;
    tilePosition;
    adjacentPoints;
    contentAround;
    animationConfig;
    constructor(config) {
        this.id = config.id;
        this.contentAround = config.contentAround;
        this.tilePosition = config.tilePosition;
        this.adjacentPoints = AnimationAtlas.orientationOrder
            .map((direction => getPointFromDirection(direction).sum(new Point(1, 1))));
        this.animationConfig = {
            playable: config.playable,
            scene: config.scene,
            spriteSheetLine: SpriteSheetLines.WALL,
            worldPosition: config.worldPosition
        };
        this.createPicture();
        this.createCorners();
    }
    createPicture() {
        const frame = this.adjacentPoints
            .reduce((acc, item, index) => {
            return acc + (this.contentAround[item.y][item.x]
                .some(layer => layer.code === Tiles.wall) ? 0 : Math.pow(2, index));
        }, 0); //TODO adjust initial value to SpriteSheetLines.WALL when there is more than the wall in this sheet
        new AnimationCreator(this.animationConfig).createImage(frame);
    }
    createCorners() {
        AnimationAtlas.wall.cornersOrder
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
                const frame = 0 + Math.pow(2, 4) + index; //TODO adjust initial value to SpriteSheetLines.WALL when there is more than the wall in this sheet
                // new GameObjectCreator(config).createImage(frame);
                new AnimationCreator(this.animationConfig).createImage(frame);
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
