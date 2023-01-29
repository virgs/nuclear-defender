import Phaser from 'phaser';
import type {SceneConfig} from '@/game/game-launcher';
import {sounds} from '@/game/constants/sounds';
import type {GameStage} from '@/game/engine/game-stage';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {GameStageCreator} from '../engine/game-stage-creator';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {SessionStore} from '@/store/session-store';

export class GameScene extends Phaser.Scene {
    private allowUpdates?: boolean;
    private gameStage?: GameStage;
    private initialTime?: number;
    private router: any;
    private sceneConfig?: SceneConfig;
    private readonly inputManager: InputManager;

    constructor() {
        super('game');
        this.inputManager = new InputManager();
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

    public async create(data: { router: any, config: SceneConfig }) {
        this.sceneConfig = data.config;
        this.router = data.router;

        const screenPropertiesCalculator = new ScreenPropertiesCalculator(data.config.strippedLayeredTileMatrix!);
        const scale = screenPropertiesCalculator
            .getScale();
        configuration.world.tileSize.horizontal = Math.trunc(configuration.tiles.horizontalSize * scale);
        configuration.world.tileSize.vertical = Math.trunc(Math.trunc(configuration.tiles.verticalSize * configuration.tiles.verticalPerspective) * scale);
        configuration.world.scale = scale;

        this.lights.enable()
            .setAmbientColor(Phaser.Display.Color.HexStringToColor(configuration.colors.ambientColor).color);

        const gameStageCreator = new GameStageCreator({
            playable: this.sceneConfig.playable,
            screenPropertiesCalculator: screenPropertiesCalculator,
            scene: this,
            dynamicFeatures: data.config.dynamicFeatures,
            strippedTileMatrix: data.config.strippedLayeredTileMatrix!,
        });
        this.gameStage = gameStageCreator.createGameStage();

        if (this.sceneConfig.playable) {
            this.inputManager.init(this);
            this.gameStage.setInitialPlayerActions(data.config.playerInitialActions);
            this.initialTime = new Date().getTime();
        } else {
            this.input.keyboard.clearCaptures();
        }

    }

    public async update(time: number, delta: number): Promise<void> {
        if (this.sceneConfig?.playable) {
            if (this.allowUpdates) {
                await this.gameStage!.update();
                if (this.gameStage!.isLevelComplete()) {
                    this.inputManager.clear();
                    this.sound.play(sounds.victory.key, {volume: 0.5});
                    this.allowUpdates = false;
                    this.input.keyboard.clearCaptures();
                    setTimeout(async () => {
                        this.changeScene();
                    }, 1250);
                }
            }
        }
    }

    private changeScene() {
        this.lights.destroy();
        const sceneConfig = this.sceneConfig!;
        const config = {
            movesCode: this.gameStage!.getPlayerMoves(),
            isCustomLevel: sceneConfig.isCustomLevel,
            level: sceneConfig.level,
            display: sceneConfig.displayNumber,
            levelIndex: sceneConfig.levelIndex,
            totalTime: new Date().getTime() - this.initialTime!
        };
        SessionStore.setNextLevelViewConfig(config);
        console.log('level complete', config);
        this.router.push('/next-level');
    }

}
