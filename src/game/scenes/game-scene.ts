import Phaser from 'phaser';
import {Store} from '@/store';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {GameStage} from '@/game/engine/game-stage';
import {GameActorsFactory} from '../actors/game-actors-factory';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {sounds} from '@/game/constants/sounds';

export class GameScene extends Phaser.Scene {
    private allowUpdates?: boolean;
    private gameEngine?: GameStage;
    private initialTime?: number;

    constructor() {
        super('game');
    }

    public init() {
    }

    public preload() {
        this.load.image(configuration.floorTextureKey, configuration.floorTexture);
//        this.load.json('characters', './assets/images/characters.json');

        //on actor
        //        Object.keys(this.map.animations)
        //              .forEach((animation: string) => this.sprite.anims.load('mole-' + animation));
        //        this.map = scene.cache.json.get('characters');
        //        this.sprite.anims.play(`${this.characterConfig.name}-hit`)
        //             .once('animationcomplete', () => {
        //                 this.hole.setAvailable();
        //                 this.destroy();
        //             });
        //     }

        //        this.sprite.anims.play(`${this.characterConfig.name}-raise`)
        //             .once('animationcomplete', () => {
        //                 this.sprite.anims.play(`${this.characterConfig.name}-alive`);
        //             })

        //           this.sprite.anims.play(`${this.characterConfig.name}-hit`)
        //                     .once('animationcomplete', () => {
        //                         this.hole.setAvailable();
        //                         this.destroy();
        //                     });


        //anim config
        //{name: 'mole', events: {hit: Events.MOLE_HIT, miss: Events.MOLE_MISS}}
        //{name: 'rabbit', events: {hit: Events.RABBIT_HIT, miss: Events.RABBIT_MISS}}
        //{name: 'star', events: {hit: Events.STAR_HIT, miss: Events.STAR_MISS}}

        this.load.spritesheet({
            key: configuration.tiles.spriteSheetKey,
            url: configuration.tiles.sheetAsset,
            normalMap: configuration.tiles.sheetAssetNormal,
            frameConfig: {
                frameWidth: configuration.tiles.horizontalSize,
                frameHeight: configuration.tiles.verticalSize
            }
        });
        Object.keys(sounds)
            .forEach(item => {
                const sound = sounds[item];
                this.load.audio(sound.key, sound.resource);
            });
        this.allowUpdates = true;
    }

    public async create() {
        this.sound.play(sounds.game.key, {volume: 0.15});
        this.initialTime = new Date().getTime();
        InputManager.setup(this);
        const store = Store.getInstance();

        const screenPropertiesCalculator = new ScreenPropertiesCalculator(store.strippedLayeredTileMatrix!);
        const scale = screenPropertiesCalculator
            .getScale();
        configuration.world.tileSize.horizontal = Math.trunc(configuration.tiles.horizontalSize * scale);
        configuration.world.tileSize.vertical = Math.trunc(Math.trunc(configuration.tiles.verticalSize * configuration.tiles.verticalPerspective) * scale);
        configuration.world.scale = scale;

        this.lights.enable()
            .setAmbientColor(Phaser.Display.Color.HexStringToColor(configuration.colors.ambientColor).color);

        const actorsCreator = new GameActorsFactory({
            screenPropertiesCalculator: screenPropertiesCalculator,
            scene: this,
            dynamicFeatures: store.features,
            strippedTileMatrix: store.strippedLayeredTileMatrix!
        });
        const actorMap = actorsCreator.create();

        this.gameEngine = new GameStage({
            screenPropertiesCalculator: screenPropertiesCalculator,
            scene: this,
            strippedMap: store.strippedLayeredTileMatrix!,
            actorMap: actorMap,
            solution: store.solution
        });
    }

    public async update(time: number, delta: number) {
        InputManager.getInstance().update();
        if (this.allowUpdates) {
            await this.gameEngine!.update();
            if (this.gameEngine!.isLevelComplete()) {
                this.sound.play(sounds.victory.key, {volume: 0.75});
                this.allowUpdates = false;
                setTimeout(async () => {
                    this.changeScene();
                }, 1500);
            }
        }
    }

    private changeScene() {
        // this.lights.destroy();

        const store = Store.getInstance();
        store.totalTimeInMs = new Date().getTime() - this.initialTime!;
        const playerMoves = this.gameEngine!.getPlayerMoves();
        store.movesCode = playerMoves;
        console.log('level complete: ' + playerMoves);
        // store.router.push('/next-level');
    }

}
