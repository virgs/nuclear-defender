import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {sounds} from '@/constants/sounds';
import type {GameActorConfig} from './game-actor';
import {Directions} from '@/constants/directions';
import {GameObjectCreator} from './game-object-creator';
import {HeroAnimator} from '@/animations/hero-animator';
import {EventEmitter, EventName} from '@/events/event-emitter';
import {TileDepthCalculator} from '@/scenes/tile-depth-calculator';
import type {DynamicGameActor, MoveData} from '@/stage/dynamic-game-actor';
import {Actions, mapActionToDirection, mapDirectionToAction} from '@/constants/actions';

export class HeroActor implements DynamicGameActor {
    private readonly heroAnimator: HeroAnimator;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly scene: Phaser.Scene;
    private readonly tweens: Phaser.Tweens.TweenManager;

    private tilePosition: Point;
    private orientation: Directions;
    private actionInputBuffer?: Actions;

    public constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.heroAnimator = new HeroAnimator();
        this.orientation = Directions.DOWN;

        this.tweens = config.scene.tweens;
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles

        this.sprite = new GameObjectCreator(config).createSprite(config.code);

        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite!.anims.create(item));
        this.tilePosition = config.tilePosition;

        EventEmitter.listenToEvent(EventName.HERO_DIRECTION_INPUT,
            (direction: Directions) => this.actionInputBuffer = mapDirectionToAction(direction));

    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public checkAction(): Actions {
        const actionInputBuffer: Actions = this.actionInputBuffer || Actions.STAND;
        if (actionInputBuffer !== Actions.STAND) {
            this.orientation = mapActionToDirection(actionInputBuffer)!
            const animation = this.heroAnimator.getAnimation(this.orientation)!;
            this.sprite.anims.play(animation.idle, true);
        }
        this.actionInputBuffer = undefined;
        return actionInputBuffer;
    }

    public async update(data: MoveData): Promise<void> {
        return new Promise<void>((resolve) => {
            this.tilePosition = data.tilePosition;
            if (data.animationPushedBox) {
                this.scene.sound.play(sounds.pushingBox.key, {volume: 0.25});
            }

            this.tweens!.add({
                targets: this.sprite,
                x: data.spritePosition.x,
                y: data.spritePosition.y,
                duration: data.duration,
                onInit: () => {
                    this.sprite!.anims.play(this.heroAnimator.getAnimation(this.orientation)!.walking, true);
                },
                onUpdate: () => {
                    this.sprite!.setDepth(new TileDepthCalculator().calculate(Tiles.hero, this.sprite.y));
                },
                onComplete: () => {
                    this.sprite!.anims.play(this.heroAnimator.getAnimation(this.orientation)!.idle, true);
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