import Phaser from 'phaser';
import {Store} from '@/store';
import type {StoredLevel} from '@/store';
import {sounds} from '@/game/constants/sounds';
import type {GameStage} from '@/game/engine/game-stage';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {GameStageCreator} from '../actors/game-stage-creator';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';

export class GameScene extends Phaser.Scene {
    private allowUpdates?: boolean;
    private gameStage?: GameStage;
    private initialTime?: number;
    private playableMode?: boolean;
    private router: any;

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

    public async create(config: { router: any, level: StoredLevel, playable: boolean }) {
        this.playableMode = config.playable;
        this.router = config.router;

        const screenPropertiesCalculator = new ScreenPropertiesCalculator(config.level.strippedLayeredTileMatrix!);
        const scale = screenPropertiesCalculator
            .getScale();
        configuration.world.tileSize.horizontal = Math.trunc(configuration.tiles.horizontalSize * scale);
        configuration.world.tileSize.vertical = Math.trunc(Math.trunc(configuration.tiles.verticalSize * configuration.tiles.verticalPerspective) * scale);
        configuration.world.scale = scale;

        this.lights.enable()
            .setAmbientColor(Phaser.Display.Color.HexStringToColor(configuration.colors.ambientColor).color);

        const gameStageCreator = new GameStageCreator({
            screenPropertiesCalculator: screenPropertiesCalculator,
            scene: this,
            dynamicFeatures: config.level.dynamicFeatures,
            strippedTileMatrix: config.level.strippedLayeredTileMatrix!,
        });
        this.gameStage = gameStageCreator.createGameStage();

        if (this.playableMode) {
            new InputManager().init(this);
            this.gameStage.setInitialPlayerActions(config.level.playerActions);
            this.initialTime = new Date().getTime();
        } else {
            this.input.keyboard.clearCaptures();
        }

        this.game.renderer.snapshot(image => {
            const MIME_TYPE = "image/png";
            // @ts-ignore
            const imgURL = image.src;
            const a = document.createElement("a");
            a.href = imgURL;
            a.download = config.level.level.title.toLowerCase().replace(/ /g, '-').concat('.png');
            console.log('snapshot of level: ' + a.download);
            a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
            // a.click();
            document.body.appendChild(a);
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(imgURL);
            }, 0);
        });
    }

    public async update(time: number, delta: number): Promise<void> {
        if (this.playableMode) {
            if (this.allowUpdates) {
                await this.gameStage!.update();
                if (this.gameStage!.isLevelComplete()) {
                    this.sound.play(sounds.victory.key, {volume: 0.5});
                    this.allowUpdates = false;
                    setTimeout(async () => {
                        this.changeScene();
                    }, 1500);
                }
            }
        }
    }

    private changeScene() {
        this.lights.destroy();
        const store = Store.getInstance();

        store.setLevelCompleteData({
            movesCode: this.gameStage!.getPlayerMoves(),
            totalTime: new Date().getTime() - this.initialTime!
        });
        console.log('level complete');
        store.router.push('/next-level');
    }

}
