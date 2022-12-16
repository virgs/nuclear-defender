import Phaser from 'phaser'
import {Hero} from "../actors/hero";
import {configuration} from "../constants/configuration";
import WebFontFileLoader from "../file-loaders/web-font-file-loader";
import {FeatureMap, MapFeaturesExtractor} from "../tiles/map-features-extractor";
import {HeroMovementCoordinator} from "../actors/hero-movement-coordinator";

export default class GameScene extends Phaser.Scene {
    private readonly mapFeaturesExtractor: MapFeaturesExtractor;
    private movementCoordinator: HeroMovementCoordinator;

    private mapLayer: Phaser.Tilemaps.TilemapLayer;
    private movesCountLabel: Phaser.GameObjects.Text;

    private hero: Hero;
    private featuresMap: FeatureMap;

    constructor() {
        super('game-scene')
        this.mapFeaturesExtractor = new MapFeaturesExtractor()
    }

    public preload(data: { level: number, hero: Hero } = {level: 2, hero: new Hero()}) {
        const fonts = new WebFontFileLoader(this.load, 'google', [
            'Poppins',
            'Righteous'
        ])
        this.load.addFile(fonts)

        this.load.tilemapTiledJSON(configuration.tilemapKey, `${configuration.levelAssetPrefix}${data.level}.json`)
        this.load.spritesheet(configuration.spriteSheetKey, configuration.tileSheetAsset, {
            frameWidth: 64,
            startFrame: 0
        })
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey)
        })
        this.hero = data.hero
    }

    public create() {
        const map = this.make.tilemap({key: configuration.tilemapKey})
        const tiles = map.addTilesetImage(configuration.tilesetName, configuration.spriteSheetKey)
        this.mapLayer = map.createLayer(configuration.layerName, tiles)

        const mapFeaturesExtractor = new MapFeaturesExtractor();
        const featuresMap = mapFeaturesExtractor.extractFeatures(this.mapLayer);
        this.featuresMap = featuresMap

        this.featuresMap.target
            .forEach(item => item.setDepth(0))

        this.hero.init({scene: this, sprite: featuresMap.player[0]});
        this.movementCoordinator =
            new HeroMovementCoordinator({
                gameScene: this,
                featuresMap: featuresMap,
                mapLayer: this.mapLayer,
                hero: this.hero
            })
        this.movesCountLabel = this.add.text(540, 10, `Moves: 0`, {
            fontFamily: 'Poppins'
        })

    }

    public update(time: number, delta: number) {
        this.hero.update();
        const movingIntention = this.hero.checkMovingIntention();
        if (movingIntention !== null) {
            if (this.movementCoordinator.moveHero(movingIntention)) {
                this.movesCountLabel.text = `Moves: ${this.movementCoordinator.getMovesCount()}`
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
                            targetTilePosition.y === boxTilePosition.y
                    })
            })) {
            console.log('level complete')
        }
    }

    public addTween(tween: Phaser.Types.Tweens.TweenBuilderConfig) {
        this.tweens.add(tween)
    }
}
