import Phaser from 'phaser';
import {Store} from '@/store';
import {Scenes} from './scenes';
import type {Box} from '@/game/actors/box';
import type {Hero} from '@/game/actors/hero';
import {TileCodes} from '../tiles/tile-codes';
import type {Actions} from '../constants/actions';
import {configuration} from '../constants/configuration';
import type {MovementCoordinatorOutput} from '../actors/movement-coordinator';
import {MovementCoordinator} from '../actors/movement-coordinator';
import {MapFeaturesExtractor} from '../tiles/map-features-extractor';
import {StandardSokobanAnnotationMapper} from '@/game/tiles/standard-sokoban-annotation-mapper';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';

export type GameSceneConfiguration = {
    map: string,
    moves?: Actions[]
    currentLevel: number,
    bestMoves?: number,
    router: any
};

//TODO create memento-recorder-class com a habilidade de 'undo' entre cada action do hero que não seja standing
export class GameScene extends Phaser.Scene {
    private movementCoordinator?: MovementCoordinator;
    private levelComplete?: boolean;
    private allowHeroMovement?: boolean;
    private playerMovesSoFar?: Actions[];

    private hero?: Hero;
    private boxes: Box[] = [];
    private staticMap?: { width: number, height: number, tiles: TileCodes[][] };

    constructor() {
        super(Scenes[Scenes.GAME]);
    }

    public init() {
        this.levelComplete = false;
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
        const output = new ScreenPropertiesCalculator().calculate(data.staticMap);
        configuration.world.tileSize.horizontal = Math.trunc(configuration.world.tileSize.horizontal * output.scale);
        configuration.world.tileSize.vertical = Math.trunc(configuration.world.tileSize.vertical * output.scale);

        const mapFeaturesExtractor = new MapFeaturesExtractor(this, output.scale);
        const featuresMap = mapFeaturesExtractor.extractFeatures(data, output);
        this.hero = featuresMap.hero;
        this.boxes = featuresMap.boxes;

        this.staticMap = data.staticMap;
        this.movementCoordinator = new MovementCoordinator(data.staticMap);
        this.allowHeroMovement = true;
    }

    public async update(time: number, delta: number) {
        if (this.levelComplete) {
            return;
        }

        if (this.allowHeroMovement) {
            let heroAction: Actions = this.hero!.checkAction();
            // if (this.solution && this.solution.length > 0) {
            //     heroAction = this.solution.shift()!;
            // }
            this.playerMovesSoFar!.push(heroAction);

            // const mapState = this.createMapState();
            const movementCoordinatorOutput = this.movementCoordinator!.update({
                heroAction: heroAction,
                staticMap: this.staticMap!,
                hero: this.hero!.getTilePosition(),
                boxes: this.boxes!.map(box => box.getTilePosition())
            });
            if (movementCoordinatorOutput.mapChanged) {
                this.allowHeroMovement = false;
                await this.moveMapFeatures(movementCoordinatorOutput);
                this.onMovementsComplete();
            }
        }
    }

    private async moveMapFeatures(movementCoordinatorOutput: MovementCoordinatorOutput) {
        const boxMovementPromises = movementCoordinatorOutput.featuresMovementMap.get(TileCodes.box)!
            .map(async movedBox => {
                const tileBoxToMove = this.boxes
                    .find(tileBox => movedBox.currentPosition.x === tileBox.getTilePosition().x &&
                        movedBox.currentPosition.y === tileBox.getTilePosition().y);
                await tileBoxToMove!.move(movedBox.direction!);
                const onTarget = this.staticMap?.tiles[movedBox.newPosition.y][movedBox.newPosition.x] === TileCodes.target;
                tileBoxToMove!.setIsOnTarget(onTarget);
            });
        const playerMovementPromise = movementCoordinatorOutput.featuresMovementMap.get(TileCodes.hero)!
            .map(async heroMovement => {
                await this.hero!.move(heroMovement.direction!);
                this.allowHeroMovement = true;
            });
        await Promise.all([playerMovementPromise, boxMovementPromises]);
    }

    private onMovementsComplete(): void {
        this.checkLevelComplete();
    }

    private checkLevelComplete() {
        if (this.boxes.every(box => box.getIsOnTarget())) {
            this.levelComplete = true;
            console.log('currentLevel complete');
            setTimeout(async () => {
                Store.getInstance().router.push('/next-level');
            }, 1500);
            // }
        }
    }

}
