import Phaser from 'phaser';
import {Point} from '../math/points';
import {Hero, MovingIntention} from './hero';
import {getTweenFromDirection} from './tween';
import {GameScene} from '../scenes/game-scene';
import {calculateOffset} from '../math/offset-calculator';
import {FeatureMap} from '../tiles/map-features-extractor';

export class HeroMovementCoordinator {
    private readonly gameScene: GameScene;
    private readonly mapLayer: Phaser.Tilemaps.TilemapLayer;
    private readonly featuresMap: FeatureMap;
    private readonly hero: Hero;

    private movesCount: number;

    constructor(data: { gameScene: GameScene; featuresMap: FeatureMap; hero: Hero; mapLayer: Phaser.Tilemaps.TilemapLayer }) {
        this.gameScene = data.gameScene;
        this.featuresMap = data.featuresMap;
        this.mapLayer = data.mapLayer;
        this.hero = data.hero;

        this.movesCount = 0;
    }

    public moveHero(movingIntention: MovingIntention): boolean {
        if (this.movementIsAvailable(movingIntention)) {
            ++this.movesCount;
            this.hero.move(movingIntention.direction);

            const offset = calculateOffset(movingIntention);
            const offsetTilePosition = this.mapLayer.worldToTileXY(offset.x, offset.y);

            const boxAhead = this.hasBoxAt(offsetTilePosition);
            if (boxAhead) {
                this.moveBox(boxAhead, movingIntention);
            }
            return true;
        }
        return false;
    }

    public movementIsAvailable(movingIntention: MovingIntention): boolean {
        const offset = calculateOffset(movingIntention);
        const offsetTilePosition = this.mapLayer.worldToTileXY(offset.x, offset.y);

        if (this.hasWallAt(offsetTilePosition)) {
            return false;
        }

        const boxAhead = this.hasBoxAt(offsetTilePosition);
        if (boxAhead) {
            const afterNextMove = calculateOffset({position: offset, direction: movingIntention.direction});
            const afterNextMoveTilePosition = this.mapLayer.worldToTileXY(afterNextMove.x, afterNextMove.y);
            if (this.hasWallAt(afterNextMoveTilePosition)) {
                return false;
            }
            if (this.hasBoxAt(afterNextMoveTilePosition)) {
                return false;
            }
        }

        return true;
    }

    public moveBox(box: Phaser.GameObjects.Sprite, movingIntention: MovingIntention) {
        const tween = {
            ...getTweenFromDirection(movingIntention.direction),
            targets: box,
            onComplete: () => this.gameScene.checkLevelComplete(),
            onCompleteScope: this
        };
        this.gameScene.addTween(tween);
    }

    public getMovesCount() {
        return this.movesCount;
    }

    public hasFeatureAt(features: Phaser.GameObjects.Sprite[], point: Point): Phaser.GameObjects.Sprite {
        return features
            .find(item => {
                const itemTilePosition = this.mapLayer.worldToTileXY(item.x, item.y);
                return itemTilePosition.x == point.x && itemTilePosition.y == point.y;
            });
    }

    public hasWallAt(offsetTilePosition: Phaser.Math.Vector2): Phaser.GameObjects.Sprite {
        return this.hasFeatureAt(this.featuresMap.wall, offsetTilePosition);
    }

    public hasBoxAt(offsetTilePosition: Phaser.Math.Vector2): Phaser.GameObjects.Sprite {
        return this.hasFeatureAt(this.featuresMap.box, offsetTilePosition);
    }
}