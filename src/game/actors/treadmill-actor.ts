import type Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import {Directions} from '@/game/constants/directions';
import type {GameActorConfig, GameActor} from '@/game/actors/game-actor';
import {sounds} from '@/game/constants/sounds';
import {configuration} from '@/game/constants/configuration';


export class TreadmillActor implements GameActor {
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

    public uncover(tile: GameActor): void {
        this.covered = false;
        if (tile.getTileCode() === Tiles.box) {
            this.scene.sound.play(sounds.treadmil.key, {volume: 0.2})
        }
    }

    public cover(tile: GameActor): void {
        this.covered = true;
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

    public getOrientation(): Directions | undefined {
        return this.orientation;
    }
    public async animate(nextPosition: Point, direction?: Directions): Promise<any> {
    }

}
