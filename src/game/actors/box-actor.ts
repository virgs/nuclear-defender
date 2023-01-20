import type Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import {sounds} from '@/game/constants/sounds';
import {SpriteCreator} from '@/game/actors/sprite-creator';
import type {Directions} from '@/game/constants/directions';
import {configuration} from '@/game/constants/configuration';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';

export class BoxActor implements GameActor {
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly scene: Phaser.Scene;
    private tilePosition: Point;
    private isOnTarget: boolean;
    private currentAnimation?: {
        tween: Phaser.Tweens.Tween,
        resolve: () => any
    };

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.tweens = config.scene.tweens;
        this.sprite = new SpriteCreator({scene: config.scene, code: this.getTileCode()}).createSprite(config.worldPosition);
        this.isOnTarget = false;
    }

    public getTilePosition() {
        return this.tilePosition;
    }

    public setTilePosition(tilePosition: Point): void {
        this.tilePosition = tilePosition;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getId(): number {
        return this.id;
    }

    public async animate(spritePosition: Point, direction?: Directions) {
        return new Promise<void>(resolve => {
            if (this.currentAnimation) {
                console.log('abort ', this.id, this.tilePosition);
                this.currentAnimation?.tween.complete();
                this.currentAnimation?.tween.stop();
                this.currentAnimation?.resolve();
                this.currentAnimation = undefined;
            }
            const tween = {
                x: spritePosition.x,
                y: spritePosition.y,
                duration: configuration.updateCycleInMs,
                targets: this.sprite,
                onInit: () => {
                },
                onUpdate: () => {
                    this.sprite!.setDepth(new TileDepthCalculator().calculate(Tiles.box, this.sprite.y));
                },
                onComplete: () => {
                    resolve();
                    this.currentAnimation = undefined;
                }
            };
            this.currentAnimation = {
                tween: this.tweens.add(tween),
                resolve: resolve
            };

        });

    }

    public getTileCode(): Tiles {
        return Tiles.box;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public isCovered(): boolean {
        return false;
    }

    public cover(staticActors: GameActor[]): void {
        if (staticActors
            .some(actor => actor.getTileCode() === Tiles.target)) {
            this.sprite.setFrame(Tiles.boxOnTarget);

            if (!this.isOnTarget) {
                this.isOnTarget = true;
                this.scene.sound.play(sounds.boxOnTarget.key, {volume: 0.5});
            }
        } else {
            if (this.isOnTarget) {
                this.isOnTarget = false;
                this.sprite.setFrame(Tiles.box);
            }
        }
    }

    public getIsOnTarget(): boolean {
        return this.isOnTarget;
    }
}