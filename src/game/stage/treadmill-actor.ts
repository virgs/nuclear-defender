import type Phaser from 'phaser';
import {Tiles} from '@/game/levels/tiles';
import type {Point} from '@/game/math/point';
import {sounds} from '@/game/constants/sounds';
import {Directions} from '@/game/constants/directions';
import {SpriteCreator} from '@/game/stage/sprite-creator';
import type {AnimateData, GameActor, GameActorConfig} from '@/game/stage/game-actor';

export class TreadmillActor implements GameActor {
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly orientation: Directions;
    private covered: boolean;
    private tilePosition: Point;

    constructor(config: GameActorConfig) {
        this.orientation = config.orientation;
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = new SpriteCreator(config).createSprite();
        this.tweens = config.scene.tweens;
        this.covered = false;

        switch (this.orientation) {
            case Directions.LEFT:
                this.sprite.flipX = true;
                break;
            case Directions.UP:
                // this.sprite.flipY = true
                break;
            case Directions.DOWN:
                // this.sprite.flipY = true
                break;
            case Directions.RIGHT:
                break;
        }
    }

    public isCovered(): boolean {
        return this.covered;
    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.box)) {
            this.covered = true;
            //TODO add particle effect?
        } else {
            if (this.covered) {
                this.covered = false;
                this.scene.sound.play(sounds.treadmil.key, {volume: 0.35});
            }
        }
    }

    public getId(): number {
        return this.id;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getTileCode(): Tiles {
        return Tiles.treadmil;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public setTilePosition(tilePosition: Point): void {
        this.tilePosition = tilePosition;
    }

    public getOrientation(): Directions | undefined {
        return this.orientation;
    }

    public async animate(data: AnimateData): Promise<any> {
    }

}
