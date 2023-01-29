import {Tiles} from '@/game/levels/tiles';
import type {Point} from '@/game/math/point';
import {sounds} from '@/game/constants/sounds';
import type {Directions} from '../constants/directions';
import {EventEmitter, EventName} from '@/event-emitter';
import {HeroAnimator} from '../animations/hero-animator';
import {SpriteCreator} from '@/game/stage/sprite-creator';
import {Actions, mapDirectionToAction} from '../constants/actions';
import {TileDepthCalculator} from '@/game/scenes/tile-depth-calculator';
import type {AnimateData, GameActor, GameActorConfig} from '@/game/stage/game-actor';

export class HeroActor implements GameActor {
    private readonly heroAnimator: HeroAnimator;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly scene: Phaser.Scene;
    private readonly tweens: Phaser.Tweens.TweenManager;

    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private tilePosition: Point;
    private actionInputBuffer?: Actions;

    public constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;

        this.heroAnimator = new HeroAnimator();

        this.tweens = config.scene.tweens;
        this.cursors = config.scene.input.keyboard.createCursorKeys();
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles

        this.sprite = new SpriteCreator(config).createSprite();

        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite!.anims.create(item));
        this.tilePosition = config.tilePosition;

        EventEmitter.listenToEvent(EventName.HERO_DIRECTION_INPUT, (direction: Directions) => {
            this.actionInputBuffer = mapDirectionToAction(direction);
        });

    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public setTilePosition(tilePosition: Point): void {
        this.tilePosition = tilePosition;
    }

    public checkAction(): Actions {
        const actionInputBuffer = this.actionInputBuffer || Actions.STAND;
        this.actionInputBuffer = undefined;
        return actionInputBuffer;
    }

    public async animate(data: AnimateData): Promise<void> {
        return new Promise<void>((resolve) => {
            if (data.animationPushedBox) {
                this.scene.sound.play(sounds.pushingBox.key, {volume: 0.25});
            }

            const heroMovement = this.heroAnimator.getAnimation(data);
            if (heroMovement) {
                this.tweens!.add({
                    ...heroMovement.tween,
                    targets: this.sprite,
                    onInit: () => {
                        this.sprite!.anims.play(heroMovement.walking, true);
                    },
                    onUpdate: () => {
                        this.sprite!.setDepth(new TileDepthCalculator().calculate(Tiles.hero, this.sprite.y));
                    },
                    onComplete: () => {
                        this.sprite!.anims.play(heroMovement.idle, true);
                        resolve();
                    },
                    onCompleteScope: this //doc purposes
                });
            } else {
                resolve();
            }
        });
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getTileCode(): Tiles {
        return Tiles.hero;
    }

    public getId(): Tiles {
        return this.id;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public isCovered(): boolean {
        return false;
    }

    public cover(tiles: GameActor[]): void {
    }
}