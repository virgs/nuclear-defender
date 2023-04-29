import { Tiles } from '@/levels/tiles';
import type { Point } from '@/math/point';
import { sounds } from '@/constants/sounds';
import type { GameActorConfig } from './game-actor';
import { Directions, getDirectionsAsString } from '@/constants/directions';
import { EventEmitter, EventName } from '@/events/event-emitter';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
import type { DynamicGameActor, MoveData } from '@/stage/dynamic-game-actor';
import { Actions, mapActionToDirection, mapDirectionToAction } from '@/constants/actions';
import { AnimationCreator, type AnimationConfig } from '@/animations/animation-creator';
import { SpriteSheetLines } from '@/animations/sprite-sheet-lines';
import { configuration } from '@/constants/configuration';

enum SpriteAnimation {
    IDLE = 0,
    WALKING = 1,
    PUSHING = 2
}


export class HeroActor implements DynamicGameActor {
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly scene: Phaser.Scene;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly animationConfig: AnimationConfig;

    private tilePosition: Point;
    private orientation: Directions;
    private actionInputBuffer?: Actions;

    public constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.orientation = Directions.DOWN;
        this.tilePosition = config.tilePosition;

        this.animationConfig = {
            playable: config.playable,
            scene: config.scene,
            spriteSheetLine: SpriteSheetLines.HERO,
            worldPosition: config.worldPosition,
        };

        EventEmitter.listenToEvent(EventName.HERO_DIRECTION_INPUT,
            (direction: Directions) => this.actionInputBuffer = mapDirectionToAction(direction));


        const animationCreator = new AnimationCreator(this.animationConfig);
        this.sprite = animationCreator
            .createSprite(animationCreator.getCurrentInitialFrame(SpriteSheetLines.HERO, this.orientation, SpriteAnimation.IDLE));

        const states = Object.keys(SpriteAnimation)
            .filter(key => !isNaN(Number(key)))
            .map(key => SpriteAnimation[Number(key) as SpriteAnimation])

        animationCreator.createAnimations(SpriteSheetLines.HERO, getDirectionsAsString(), states)
            .forEach(animation => this.sprite!.anims.create(animation));


        this.tweens = config.scene.tweens;
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public checkAction(): Actions {
        const actionInputBuffer: Actions = this.actionInputBuffer || Actions.STAND;
        if (actionInputBuffer !== Actions.STAND) {
            this.orientation = mapActionToDirection(actionInputBuffer)!
            this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.IDLE] + '.' + Directions[this.orientation], repeat: -1, duration: configuration.updateCycleInMs }, true);
        }
        this.actionInputBuffer = undefined;
        return actionInputBuffer;
    }

    public async update(data: MoveData): Promise<void> {
        if (this.tilePosition.isEqualTo(data.tilePosition)) {
            return;
        }
        return new Promise<void>((resolve) => {
            this.tilePosition = data.tilePosition;
            if (data.animationPushedBox) {
                this.scene.sound.play(sounds.pushingBox.key, { volume: 0.25 });
                //TODO change animation to pushing
                console.log(SpriteAnimation[SpriteAnimation.PUSHING] + '.' + Directions[this.orientation])
            }
            if (data.orientation !== undefined) {
                this.orientation = data.orientation
            }

            this.tweens!.add({
                targets: this.sprite,
                x: data.spritePosition.x,
                y: data.spritePosition.y,
                duration: data.duration,
                onInit: () => {
                    this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.WALKING] + '.' + Directions[this.orientation], repeat: -1, duration: configuration.updateCycleInMs }, true);
                },
                onUpdate: () => {
                    this.sprite!.setDepth(new TileDepthCalculator().newCalculate(SpriteSheetLines.HERO, this.sprite.y));
                },
                onComplete: () => {
                    this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.IDLE] + '.' + Directions[this.orientation], repeat: -1, duration: configuration.updateCycleInMs }, true);
                    resolve();
                },
                onCompleteScope: this //doc purposes
            });
        });
    }

    public getTileCode(): Tiles {
        return Tiles.hero;
    }

    public getId(): Tiles {
        return this.id;
    }

    public cover(): void {
    }
}