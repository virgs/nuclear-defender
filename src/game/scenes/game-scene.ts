import Phaser from 'phaser';
import type {Store} from '@/store';
import {sounds} from '@/game/constants/sounds';
import {GameStage} from '@/game/engine/game-stage';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {mapStringToAction} from '@/game/constants/actions';
import {GameActorsFactory} from '../actors/game-actors-factory';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';

export class GameScene extends Phaser.Scene {
    private allowUpdates?: boolean;
    private gameEngine?: GameStage;
    private initialTime?: number;
    private store?: Store;
    private playableMode?: boolean;

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

    public async create(config: {store: Store, playable: boolean}) {
        this.playableMode = config.playable
        this.store = config.store;
        this.initialTime = new Date().getTime();
        InputManager.init(this);
        const storedLevel = this.store.getCurrentStoredLevel()!;

        const screenPropertiesCalculator = new ScreenPropertiesCalculator(storedLevel.strippedLayeredTileMatrix!);
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
            dynamicFeatures: storedLevel.dynamicFeatures,
            strippedTileMatrix: storedLevel.strippedLayeredTileMatrix!
        });
        const actorMap = actorsCreator.create();

        this.gameEngine = new GameStage({
            screenPropertiesCalculator: screenPropertiesCalculator,
            scene: this,
            strippedMap: storedLevel.strippedLayeredTileMatrix!,
            actorMap: actorMap,
            solution: storedLevel.level.solution?.split('')
                .map(action => mapStringToAction(action))
        });
        this.game.renderer.snapshot(image => {
            console.log('snapshot of the level');
            const MIME_TYPE = "image/png";
            // @ts-ignore
            const imgURL = image.src;
            const a = document.createElement("a");
            a.href = imgURL;
            a.download = 'screenshot.png';
            a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
            // a.click();
            document.body.appendChild(a);
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(imgURL);
            }, 0);
        });
    }

    public async update(time: number, delta: number) {
        InputManager.getInstance().update();
        if (this.allowUpdates && this.playableMode) {
            await this.gameEngine!.update();
            if (this.gameEngine!.isLevelComplete()) {
                this.sound.play(sounds.victory.key, {volume: 0.5});
                this.allowUpdates = false;
                setTimeout(async () => {
                    this.changeScene();
                }, 1500);
            }
        }
    }

    private changeScene() {
        this.lights.destroy();

        this.store!.setLevelCompleteData({
            movesCode: this.gameEngine!.getPlayerMoves(),
            totalTime: new Date().getTime() - this.initialTime!

        });
        console.log('level complete');
        this.store!.router.push('/next-level');
    }

}
