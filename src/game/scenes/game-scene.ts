import Phaser from 'phaser';
import {Store} from '@/store';
import {Scenes} from './scenes';
import {Hero} from '../actors/hero';
import type {Point} from '../math/point';
import {TileCodes} from '../tiles/tile-codes';
import type {Actions} from '../constants/actions';
import {getTweenFromDirection} from '../actors/tween';
import type {Directions} from '../constants/directions';
import {configuration} from '../constants/configuration';
import {createIndefiniteProgressBar} from '../ui/htmlElements';
import {MovementCoordinator} from '../actors/movement-coordinator';
import {MapFeaturesExtractor} from '../tiles/map-features-extractor';
import type {MovementCoordinatorOutput} from '../actors/movement-coordinator';
import {StandardSokobanAnnotationMapper} from '@/game/tiles/standard-sokoban-annotation-mapper';

export type GameSceneConfiguration = {
    map: string,
    moves?: Actions[]
    currentLevel: number,
    bestMoves?: number,
    router: any
};

//TODO create memento-recorder-class com a habilidade de 'undo' entre cada action do hero que não seja standing
export class GameScene extends Phaser.Scene {
    private readonly mapFeaturesExtractor: MapFeaturesExtractor;

    private mapLayer?: Phaser.Tilemaps.TilemapLayer;
    private movementCoordinator?: MovementCoordinator;

    private hero?: Hero;
    private featuresMap?: Map<TileCodes, Phaser.GameObjects.Sprite[]>;
    private gameSceneConfiguration?: GameSceneConfiguration;
    private levelComplete?: boolean;
    private solution?: Actions[];
    private allowHeroMovement?: boolean;
    private playerMovesSoFar?: Actions[];

    constructor() {
        super(Scenes[Scenes.GAME]);
        this.mapFeaturesExtractor = new MapFeaturesExtractor();
    }

    public init(gameSceneConfiguration: GameSceneConfiguration) {
        this.levelComplete = false;
        this.gameSceneConfiguration = gameSceneConfiguration;
        this.playerMovesSoFar = [];
    }

    public preload() {
        this.load.html(configuration.html.gameScene.key, configuration.html.gameScene.file);
        this.load.tilemapTiledJSON(configuration.tiles.tilemapKey, configuration.tiles.tilesheets[0]);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tiles.tilemapKey);
        });

        this.load.spritesheet(configuration.spriteSheetKey, configuration.tiles.sheetAsset, {
            frameWidth: configuration.tiles.horizontalSize,
            startFrame: 0
        });
    }

    public async create() {
        const codedMap: string = Store.getInstance().map;

        const data = new StandardSokobanAnnotationMapper().map(codedMap);
        const map = this.make.tilemap({
            data: data,
            tileWidth: configuration.tiles.horizontalSize,
            tileHeight: configuration.tiles.verticalSize
        });
        const tilesetImage = map.addTilesetImage(configuration.spriteSheetKey);
        this.mapLayer = map.createLayer(0, tilesetImage);

        const mapFeaturesExtractor = new MapFeaturesExtractor();
        this.featuresMap = mapFeaturesExtractor.extractFeatures(this, this.mapLayer);

        //TODO move this to its own specific GameActor class
        [...this.featuresMap.get(TileCodes.target)!,
            ...this.featuresMap.get(TileCodes.empty)!,
            ...this.featuresMap.get(TileCodes.floor)!]
            .forEach(item => item.setDepth(0));

        this.hero = new Hero();
        this.hero.init({
            scene: this,
            sprite: this.featuresMap.get(TileCodes.hero)![0]
        });
        this.movementCoordinator = new MovementCoordinator();

        const loading = this.add.dom(configuration.gameWidth * 0.5, configuration.gameHeight * 0.25, createIndefiniteProgressBar())
            .setOrigin(0.5);
        // this.solution = input.moves;
        loading.removeElement();
        this.allowHeroMovement = true;
    }

    public async update(time: number, delta: number) {
        if (this.levelComplete) {
            return;
        }

        if (this.allowHeroMovement) {
            let heroAction: Actions = this.hero!.checkAction();
            if (this.solution && this.solution.length > 0) {
                heroAction = this.solution.shift()!;
            }
            this.playerMovesSoFar!.push(heroAction);

            const mapState = this.createMapState();
            const movementCoordinatorOutput = this.movementCoordinator!.update({
                heroAction: heroAction,
                mapState: mapState
            });
            if (movementCoordinatorOutput.mapChanged) {
                this.allowHeroMovement = false;
                await this.moveMapFeatures(movementCoordinatorOutput);
            }
        }
    }

    private async moveMapFeatures(movementCoordinatorOutput: MovementCoordinatorOutput) {
        const boxMovements = movementCoordinatorOutput.featuresMovementMap.get(TileCodes.box)!
            .map(async movedBox => {
                const worldXY = this.mapLayer!.tileToWorldXY(movedBox.currentPosition.x, movedBox.currentPosition.y);
                const boxToMove = this.featuresMap!
                    .get(TileCodes.box)!
                    .find(worldBox => worldBox.x === worldXY.x && worldBox.y === worldXY.y);
                await this.moveBox(boxToMove!, movedBox.direction!);
                this.onBoxesMovementComplete();
            });
        const playerMovement = movementCoordinatorOutput.featuresMovementMap.get(TileCodes.hero)!
            .map(async heroMovement => {
                await this.hero!.move(heroMovement.direction!);
                this.allowHeroMovement = true;
            });
        await Promise.all([playerMovement, boxMovements]);
    }

    private createMapState(): Map<TileCodes, Point[]> {
        const mapState: Map<TileCodes, Point[]> = new Map<TileCodes, Point[]>();
        for (let [key, value] of this.featuresMap!) {
            mapState.set(key, value
                .map(sprite => this.mapLayer!.worldToTileXY(sprite.x, sprite.y)));
        }
        return mapState;
    }

    public async moveBox(box: Phaser.GameObjects.Sprite, direction: Directions): Promise<void> {
        return new Promise<void>(resolve => {
            const tween = {
                ...getTweenFromDirection(direction),
                targets: box,
                onComplete: () => resolve(),
                onCompleteScope: this
            };
            this.addTween(tween);
        });
    }

    private onBoxesMovementComplete(): void {
        this.updateBoxesColor();
        this.checkLevelComplete();
    }

    private updateBoxesColor() {
        this.featuresMap!
            .get(TileCodes.box)!
            .forEach(box => {
                const boxPosition = this.mapLayer!.worldToTileXY(box.x, box.y);
                if (this.featuresMap!
                    .get(TileCodes.target)!
                    .some(target => {
                        const targetPosition = this.mapLayer!.worldToTileXY(target.x, target.y);
                        return boxPosition.x === targetPosition.x && boxPosition.y === targetPosition.y;
                    })) {
                    box.setFrame(TileCodes.boxOnTarget);
                } else {
                    box.setFrame(TileCodes.box);
                }
            });
    }

    private checkLevelComplete() {
        if (this.featuresMap!.get(TileCodes.box)!
            .every(box => {
                const boxTilePosition = this.mapLayer!.worldToTileXY(box.x, box.y);
                return this.featuresMap!.get(TileCodes.target)!
                    .some(target => {
                        const targetTilePosition = this.mapLayer!.worldToTileXY(target.x, target.y);
                        return targetTilePosition.x === boxTilePosition.x &&
                            targetTilePosition.y === boxTilePosition.y;
                    });
            })) {
            this.levelComplete = true;
            console.log('currentLevel complete');
            setTimeout(async () => {
                Store.getInstance().router.push('/next-level');
                // const input: NextLevelSceneInput = {
                //     currentLevel: this.gameSceneConfiguration!.currentLevel,
                //     moves: this.playerMovesSoFar!,
                //     totalTime: this.elapsedTime!
                // };
                // this.scene.start(Scenes[Scenes.NEXT_LEVEL], input);
            }, 1500);
        }
    }

    public addTween(tween: Phaser.Types.Tweens.TweenBuilderConfig) {
        this.tweens.add(tween);
    }

    // private createFormButtons() {
    //     // let text = this.add.text(10, 10, 'Please login to play', {color: 'white', fontFamily: 'Arial', fontSize: '32px '});
    //     const element = this.add.dom(configuration.gameWidth * 0.5, configuration.gameHeight * .9)
    //         .createFromCache(configuration.html.gameScene.key);
    //     console.log(element);
    //     // element.setPerspective(800);
    //     element.addListener('click');
    //
    //     element.on('click', (event: any) => {
    //         if (event.target.id === 'game-scene-undo-button') {
    //             console.log('undo');
    //         }
    //         if (event.target.id === 'game-scene-retry-button') {
    //             console.log('retry');
    //         }
    //     });
    //
    // }
}
