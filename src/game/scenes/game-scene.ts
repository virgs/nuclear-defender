import Phaser from 'phaser';
import {Store} from '@/store';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {GameEngine} from '@/game/engine/game-engine';
import {GameActorsFactory} from '../actors/game-actors-factory';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {sounds} from '@/game/constants/sounds';

export class GameScene extends Phaser.Scene {
    private allowUpdates?: boolean;
    private gameEngine?: GameEngine;
    private initialTime?: number;

    constructor() {
        super('game');
    }

    public init() {
    }

    public preload() {
        this.load.image(configuration.floorTextureKey, configuration.floorTexture);

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

        const scale = new ScreenPropertiesCalculator(store.strippedLayeredTileMatrix!)
            .getScale();
        configuration.world.tileSize.horizontal = Math.trunc(configuration.tiles.horizontalSize * scale);
        configuration.world.tileSize.vertical = Math.trunc(Math.trunc(configuration.tiles.verticalSize * configuration.tiles.verticalPerspective) * scale);

        this.lights.enable()
            .setAmbientColor(Phaser.Display.Color.HexStringToColor(configuration.colors.ambientColor).color);

        const actorsCreator = new GameActorsFactory({
            scene: this,
            dynamicFeatures: store.features,
            strippedTileMatrix: store.strippedLayeredTileMatrix!
        });
        const actorMap = actorsCreator.create();

        this.gameEngine = new GameEngine({
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
