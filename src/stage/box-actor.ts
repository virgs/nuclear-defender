import { SpriteSheetLines } from '@/animations/sprite-sheet-lines';
import { AnimationCreator, type AnimationConfig } from '@/animations/animation-creator';
import { configuration } from '@/constants/configuration';
import { sounds } from '@/constants/sounds';
import { Tiles } from '@/levels/tiles';
import type { Point } from '@/math/point';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
import type { DynamicGameActor, MoveData } from '@/stage/dynamic-game-actor';
import type { GameActor, GameActorConfig } from '@/stage/game-actor';
import type Phaser from 'phaser';

enum SpriteAnimation {
    OFF_TARGET = 0,
    ON_TARGET = 1,
}

export class BoxActor implements DynamicGameActor {
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly animationConfig: AnimationConfig;
    private tilePosition: Point;
    private onTarget?: number;
    private currentTween?: {
        tween: Phaser.Tweens.Tween,
        resolve: () => any
    };


    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        this.tweens = config.scene.tweens;

        this.animationConfig = {
            playable: config.playable,
            scene: config.scene,
            spriteSheetLine: SpriteSheetLines.BOX,
            worldPosition: config.worldPosition,
        };

        const animationCreator = new AnimationCreator(this.animationConfig);
        this.sprite = animationCreator
            .createSprite(animationCreator.getCurrentInitialFrame(SpriteSheetLines.BOX, 0, SpriteAnimation.OFF_TARGET));

        const states = Object.keys(SpriteAnimation)
            .filter(key => !isNaN(Number(key)))
            .map(key => SpriteAnimation[Number(key) as SpriteAnimation])

        animationCreator.createAnimations(SpriteSheetLines.BOX, states, ['IDLE'])
            .forEach(animation => {
                // animation.key = animation.key.split('.')[0];
                console.log(animation)
                return this.sprite!.anims.create(animation);
            });
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
                targets: this.sprite,
                x: data.spritePosition.x,
                y: data.spritePosition.y,
                duration: data.duration,
                onUpdate: () => {
                    this.sprite.setDepth(new TileDepthCalculator().newCalculate(SpriteSheetLines.BOX, this.sprite.y));
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
        const onTarget = staticActors
            .find(actor => actor.getTileCode() === Tiles.target);
        if (onTarget) {
            this.sprite.anims.play({ key: 'IDLE.' + SpriteAnimation[SpriteAnimation.ON_TARGET], repeat: -1, duration: configuration.updateCycleInMs }, true);
            const targetId = onTarget.getId();

            if (this.onTarget !== targetId) {
                this.onTarget = targetId;
                this.animationConfig.scene.sound.play(sounds.boxOnTarget.key, { volume: 0.5 });
            }
        } else {
            if (this.onTarget !== undefined) {
                this.onTarget = undefined;
                this.sprite.anims.play({ key: 'IDLE.' + SpriteAnimation[SpriteAnimation.OFF_TARGET], repeat: -1, duration: configuration.updateCycleInMs }, true);
            }
        }
    }

    public getIsOnTarget(): boolean {
        return this.onTarget !== undefined;
    }
}