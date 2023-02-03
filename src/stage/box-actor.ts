import type Phaser from 'phaser';
import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {sounds} from '@/constants/sounds';
import {GameObjectCreator} from '@/stage/game-object-creator';
import {TileDepthCalculator} from '@/scenes/tile-depth-calculator';
import type {GameActor, GameActorConfig} from '@/stage/game-actor';
import type {DynamicGameActor, MoveData} from '@/stage/dynamic-game-actor';

export class BoxActor implements DynamicGameActor {
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly image: Phaser.GameObjects.Image;
    private readonly id: number;
    private readonly scene: Phaser.Scene;
    private tilePosition: Point;
    private isOnTarget: boolean;
    private currentTween?: {
        tween: Phaser.Tweens.Tween,
        resolve: () => any
    };

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.tweens = config.scene.tweens;
        this.image = new GameObjectCreator(config)
            .createImage(config.code);
        this.isOnTarget = false;
    }

    public getTilePosition() {
        return this.tilePosition;
    }

    public getId(): number {
        return this.id;
    }

    public async update(data: MoveData) {
        if (this.tilePosition.isEqualTo(data.tilePosition)) {
            return;
        }
        return new Promise<void>(resolve => {
            this.tilePosition = data.tilePosition;
            if (this.currentTween) {
                console.log('abort ', this.id, this.tilePosition);
                // this.currentTween?.tween.complete();
                this.currentTween?.tween.stop();
                console.log('stopped')
                this.currentTween?.resolve();
                this.currentTween = undefined;
            }
            const tween = {
                targets: this.image,
                x: data.spritePosition.x,
                y: data.spritePosition.y,
                duration: data.duration,
                onUpdate: () => {
                    this.image.setDepth(new TileDepthCalculator().calculate(Tiles.box, this.image.y));
                },
                onComplete: () => {
                    resolve();
                    this.currentTween = undefined;
                }
            };
            this.currentTween = {
                tween: this.tweens.add(tween),
                resolve: resolve
            };

        });

    }

    public getTileCode(): Tiles {
        return Tiles.box;
    }

    public cover(staticActors: GameActor[]): void {
        if (staticActors
            .some(actor => actor.getTileCode() === Tiles.target)) {
            this.image.setFrame(Tiles.boxOnTarget);

            if (!this.isOnTarget) {
                this.isOnTarget = true;
                this.scene.sound.play(sounds.boxOnTarget.key, {volume: 0.5});
            }
        } else {
            if (this.isOnTarget) {
                this.isOnTarget = false;
                this.image.setFrame(Tiles.box);
            }
        }
    }

    public getIsOnTarget(): boolean {
        return this.isOnTarget;
    }
}