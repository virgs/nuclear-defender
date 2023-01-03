import type Phaser from 'phaser';
import type {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import type {GameActor} from '@/game/actors/game-actor';
import {getTweenFromDirection} from '@/game/animations/tween';
import type {Directions} from '@/game/constants/directions';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';

export class BoxActor implements GameActor {
    private tilePosition: Point;
    private isOnTarget: boolean;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;

    constructor(boxConfig: { scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, tilePosition: Point, id: number }) {
        this.id = boxConfig.id;
        this.tilePosition = boxConfig.tilePosition;
        this.tweens = boxConfig.scene.tweens;
        this.sprite = boxConfig.sprite;
        this.isOnTarget = false;
    }

    public getTilePosition() {
        return this.tilePosition;
    }

    public setIsOnTarget(isOnTarget: boolean) {
        if (isOnTarget) {
            this.sprite.setFrame(Tiles.boxOnTarget);
        } else {
            this.sprite.setFrame(Tiles.box);
        }

        return this.isOnTarget = isOnTarget;
    }

    public getIsOnTarget(): boolean {
        return this.isOnTarget;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getId(): number {
        return this.id;
    }

    public async move(direction: Directions) {
        this.tilePosition = this.tilePosition.calculateOffset(direction);
        return new Promise<void>(resolve => {
            const tween = {
                ...getTweenFromDirection(direction),
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

    public cover() {
        console.error('box being covered')
    }

    public uncover() {
        console.error('box being uncovered')
    }

}