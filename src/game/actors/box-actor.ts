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
    private tilePosition: Point;
    private isOnTarget: boolean;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly scene: Phaser.Scene;

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
            const tween = {
                x: spritePosition.x,
                y: spritePosition.y,
                duration: configuration.updateCycleInMs,
                targets: this.sprite,
                onInit: () => {
                },
                onUpdate: () => {
                    this.sprite!.setDepth(new TileDepthCalculator().calculate(Tiles.box, this.sprite.y + 1));
                },
                onComplete: () => {
                    resolve();
                }
            };
            this.tweens.add(tween);
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

    public cover(actor: GameActor): void {
        if (actor.getTileCode() === Tiles.target) {
            this.sprite.setFrame(Tiles.boxOnTarget);
            this.isOnTarget = true;
                this.scene.sound.play(sounds.boxOnTarget.key, {volume: 0.5})
        }
    }

    public uncover(actor: GameActor): void {
        if (actor.getTileCode() === Tiles.target) {
            this.sprite.setFrame(Tiles.box);
            this.isOnTarget = false;
        }
    }

    public getIsOnTarget(): boolean {
        return this.isOnTarget;
    }
}