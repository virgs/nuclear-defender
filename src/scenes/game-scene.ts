import Phaser from 'phaser';
import {Hero} from '../actors/hero';
import {configuration} from '../constants/configuration';
import {FeatureMap, MapFeaturesExtractor} from '../tiles/map-features-extractor';
import {HeroMovementCoordinator} from '../actors/hero-movement-coordinator';

export type GameSceneConfiguration = {
    currentLevel: number,
    hero: Hero,
    bestMoves: number
};

export class GameScene extends Phaser.Scene {
    private readonly mapFeaturesExtractor: MapFeaturesExtractor;

    private mapLayer: Phaser.Tilemaps.TilemapLayer;
    private movesCountLabel: Phaser.GameObjects.Text;
    private movementCoordinator: HeroMovementCoordinator;

    private hero: Hero;
    private featuresMap: FeatureMap;
    private gameSceneConfiguration: GameSceneConfiguration;

    constructor() {
        super('game');
        this.mapFeaturesExtractor = new MapFeaturesExtractor();
    }

    public init(gameSceneConfiguration: GameSceneConfiguration) {
        this.gameSceneConfiguration = gameSceneConfiguration;
    }

    public preload() {
        this.load.tilemapTiledJSON(configuration.tilemapKey, `${configuration.levelAssetPrefix}${this.gameSceneConfiguration.currentLevel}.json`);
        this.load.spritesheet(configuration.spriteSheetKey, configuration.tileSheetAsset, {
            frameWidth: 64,
            startFrame: 0
        });
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey);
        });
    }

    public create(gameSceneConfiguration: GameSceneConfiguration) {
        const map = this.make.tilemap({key: configuration.tilemapKey});
        const tiles = map.addTilesetImage(configuration.tilesetName, configuration.spriteSheetKey);
        this.mapLayer = map.createLayer(configuration.layerName, tiles);

        const mapFeaturesExtractor = new MapFeaturesExtractor();
        const featuresMap = mapFeaturesExtractor.extractFeatures(this.mapLayer);
        this.featuresMap = featuresMap;

        this.featuresMap.target
            .forEach(item => item.setDepth(0));

        this.hero = gameSceneConfiguration.hero;
        this.hero.init({scene: this, sprite: featuresMap.player[0]});
        this.movementCoordinator =
            new HeroMovementCoordinator({
                gameScene: this,
                featuresMap: featuresMap,
                mapLayer: this.mapLayer,
                hero: this.hero
            });
        this.movesCountLabel = this.add.text(540, 10, `Moves: 0`, {
            fontFamily: 'Poppins',
            fontSize: '30px'
        });

    }

    public update(time: number, delta: number) {
        this.hero.update();
        const movingIntention = this.hero.checkMovingIntention();
        if (movingIntention !== null) {
            if (this.movementCoordinator.moveHero(movingIntention)) {
                this.movesCountLabel.text = `Moves: ${this.movementCoordinator.getMovesCount()}`;
            }
        }
    }

    public checkLevelComplete(): void {
        if (this.featuresMap.box
            .every(box => {
                const boxTilePosition = this.mapLayer.worldToTileXY(box.x, box.y);
                return this.featuresMap.target
                    .some(target => {
                        const targetTilePosition = this.mapLayer.worldToTileXY(target.x, target.y);
                        return targetTilePosition.x === boxTilePosition.x &&
                            targetTilePosition.y === boxTilePosition.y;
                    });
            })) {
            console.log('currentLevel complete');
            setTimeout(() => {
                this.scene.start('next-level', {
                    gameSceneConfiguration: this.gameSceneConfiguration,
                    numMoves: this.movementCoordinator.getMovesCount()
                });
            }, 1000);
        }
    }

    public addTween(tween: Phaser.Types.Tweens.TweenBuilderConfig) {
        this.tweens.add(tween);
    }
}
