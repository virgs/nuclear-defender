import type Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import {Directions} from '@/game/constants/directions';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';
import {sounds} from '@/game/constants/sounds';
import {configuration} from '@/game/constants/configuration';

export class SpringActor implements GameActor {
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private readonly tilePosition: Point;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly orientation: Directions;
    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.orientation = config.orientation;
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = config.scene.add.sprite(config.worldPosition.x, config.worldPosition.y, configuration.tiles.spriteSheetKey, this.getTileCode());
        this.tweens = config.scene.tweens;
        this.covered = false;

        switch (this.orientation) {
            case Directions.LEFT:
                // this.sprite.setRotation(Math.PI / 2);
                //     this.sprite.flipY = true
                break;
            case Directions.UP:
                this.sprite.flipY = true;
                // this.sprite.setRotation(Math.PI);
                break;
            case Directions.RIGHT:
                // this.sprite.setRotation(Math.PI / 2);
                this.sprite.flipX = true;
                break;
        }
    }

    public isCovered(): boolean {
        return this.covered;
    }

    public uncover(tile: GameActor): void {
        this.covered = false;
        this.scene.sound.play(sounds.springRelease.key, {volume: 0.2});
    }

    public cover(tile: GameActor): void {
        this.covered = true;
        this.scene.sound.play(sounds.springEngage.key, {volume: 0.2});
    }

    public getId(): number {
        return this.id;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getTileCode(): Tiles {
        return Tiles.spring;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public getOrientation(): Directions | undefined {
        return this.orientation;
    }

}
