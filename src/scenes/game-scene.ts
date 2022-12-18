import Phaser from 'phaser';
import {Scenes} from './scenes';
import {Hero} from '../actors/hero';
import {Point} from '../math/points';
import {TileCode} from '../tiles/tile-code';
import {Direction} from '../constants/direction';
import {getTweenFromDirection} from '../actors/tween';
import {configuration} from '../constants/configuration';
import {MovementCoordinator} from '../actors/movement-coordinator';
import {MapFeaturesExtractor} from '../tiles/map-features-extractor';

export type GameSceneConfiguration = {
    map: TileCode[][],
    currentLevel: number,
    hero: Hero,
    bestMoves: number
};

export class GameScene extends Phaser.Scene {
    private readonly mapFeaturesExtractor: MapFeaturesExtractor;

    private mapLayer: Phaser.Tilemaps.TilemapLayer;
    private movesCountLabel: Phaser.GameObjects.Text;
    private movementCoordinator: MovementCoordinator;

    private hero: Hero;
    private featuresMap: Map<TileCode, Phaser.GameObjects.Sprite[]>;
    private gameSceneConfiguration: GameSceneConfiguration;
    private movesCounter: number = 0;
    private levelComplete: boolean = false;

    constructor() {
        super(Scenes[Scenes.GAME]);
        this.mapFeaturesExtractor = new MapFeaturesExtractor();
    }

    public init(gameSceneConfiguration: GameSceneConfiguration) {
        this.gameSceneConfiguration = gameSceneConfiguration;
    }

    public preload() {
        this.load.spritesheet(configuration.spriteSheetKey, configuration.tileSheetAsset, {
            frameWidth: configuration.horizontalTileSize,
            startFrame: 0
        });
    }

    public create(gameSceneConfiguration: GameSceneConfiguration) {
        //https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
        const map = this.make.tilemap({
            data: gameSceneConfiguration.map,
            tileWidth: configuration.horizontalTileSize,
            tileHeight: configuration.verticalTileSize
        });
        const tilesetImage = map.addTilesetImage(configuration.spriteSheetKey);
        this.mapLayer = map.createLayer(0, tilesetImage);

        const mapFeaturesExtractor = new MapFeaturesExtractor();
        this.featuresMap = mapFeaturesExtractor.extractFeatures(this.mapLayer);
        //TODO check if map is valid. number of heroes = 1, number of box = targets, if it's solvable?...
        // console.log(this.featuresMap);

        //TODO move this to its own specific GameActor class
        [...this.featuresMap.get(TileCode.target),
            ...this.featuresMap.get(TileCode.empty),
            ...this.featuresMap.get(TileCode.floor)]
            .forEach(item => item.setDepth(0));

        this.hero = gameSceneConfiguration.hero;
        this.hero.init({
            scene: this,
            sprite: this.featuresMap.get(TileCode.hero)[0]
        });
        this.movementCoordinator = new MovementCoordinator();
        this.movesCountLabel = this.add.text(540, 10, `Moves: 0`, {
            fontFamily: 'Poppins',
            fontSize: '30px'
        });

    }

    public update(time: number, delta: number) {
        if (this.levelComplete) {
            return;
        }
        this.hero.update();
        const movingIntentionDirection: Direction = this.hero.checkMovingIntentionDirection();

        const mapState = this.createMapState();
        const mapMovementUpdate = this.movementCoordinator.update({heroMovingIntentionDirection: movingIntentionDirection, mapState: mapState});
        mapMovementUpdate.movementMap.get(TileCode.hero)
            .forEach(heroMovement => {
                ++this.movesCounter;
                this.movesCountLabel.text = `Moves: ${this.movesCounter}`;
                this.hero.move(heroMovement.direction);
            });

        // console.log(mapMovementUpdate.boxesMovements)
        mapMovementUpdate.movementMap.get(TileCode.box)
            .forEach(movedBox => {
                const worldXY = this.mapLayer.tileToWorldXY(movedBox.currentPosition.x, movedBox.currentPosition.y);
                const boxToMove = this.featuresMap
                    .get(TileCode.box)
                    .find(worldBox => worldBox.x === worldXY.x && worldBox.y === worldXY.y);
                this.moveBox(boxToMove, movedBox.direction);
            });
    }

    private createMapState(): Map<TileCode, Point[]> {
        const mapState: Map<TileCode, Point[]> = new Map<TileCode, Point[]>();
        for (let [key, value] of this.featuresMap) {
            mapState.set(key, value
                .map(sprite => this.mapLayer.worldToTileXY(sprite.x, sprite.y)));
        }
        return mapState;
    }

    public moveBox(box: Phaser.GameObjects.Sprite, direction: Direction) {
        const tween = {
            ...getTweenFromDirection(direction),
            targets: box,
            onComplete: () => this.onMovementComplete(),
            onCompleteScope: this
        };
        this.addTween(tween);
    }

    private onMovementComplete(): void {
        this.updateBoxesColor();
        this.checkLevelComplete();
    }

    private updateBoxesColor() {
        this.featuresMap
            .get(TileCode.box)
            .forEach(box => {
                const boxPosition = this.mapLayer.worldToTileXY(box.x, box.y);
                if (this.featuresMap
                    .get(TileCode.target)
                    .some(target => {
                        const targetPosition = this.mapLayer.worldToTileXY(target.x, target.y);
                        return boxPosition.x === targetPosition.x && boxPosition.y === targetPosition.y;
                    })) {
                    box.setFrame(TileCode.boxOnTarget);
                } else {
                    box.setFrame(TileCode.box);
                }
            });
    }

    private checkLevelComplete() {
        if (this.featuresMap.get(TileCode.box)
            .every(box => {
                const boxTilePosition = this.mapLayer.worldToTileXY(box.x, box.y);
                return this.featuresMap.get(TileCode.target)
                    .some(target => {
                        const targetTilePosition = this.mapLayer.worldToTileXY(target.x, target.y);
                        return targetTilePosition.x === boxTilePosition.x &&
                            targetTilePosition.y === boxTilePosition.y;
                    });
            })) {
            this.levelComplete = true;
            console.log('currentLevel complete');
            setTimeout(() => {
                this.scene.start(Scenes[Scenes.NEXT_LEVEL], {
                    gameSceneConfiguration: this.gameSceneConfiguration,
                    numMoves: this.movesCounter
                });
            }, 1500);
        }
    }

    public addTween(tween: Phaser.Types.Tweens.TweenBuilderConfig) {
        this.tweens.add(tween);
    }
}
