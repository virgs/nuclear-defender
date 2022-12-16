import Phaser from 'phaser'
import WebFontFileLoader from "../file-loaders/web-font-file-loader";
import {Hero} from "../hero/hero";
import {configuration} from "../constants/configuration";

export default class HelloWorldScene extends Phaser.Scene {
    private layer: Phaser.Tilemaps.TilemapLayer;
    private hero: Hero;
    private movesCountLabel: Phaser.GameObjects.Text;
    private movesCount: number = 0;

    constructor() {
        super('game')
    }

    preload(data: { level: number, hero: Hero } = {level: 1, hero: new Hero()}) {
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
        this.hero = data.hero
    }

    create() {
        const map = this.make.tilemap({key: configuration.tilemapKey})

        const tiles = map.addTilesetImage('sokoban', configuration.spriteSheetKey)
        this.layer = map.createLayer(configuration.layerName, tiles, 0, 0)

        this.hero.init(this);

        this.movesCountLabel = this.add.text(540, 10, `Moves: ${this.movesCount}`, {
            fontFamily: 'Poppins'
        })

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey)
        })
    }


    update(time: number, delta: number) {
        const movingIntention = this.hero.checkMovingIntention();
        if (movingIntention !== null) {
            this.hero.move(movingIntention)
        }
    }

}
