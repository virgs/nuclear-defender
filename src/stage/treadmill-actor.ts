import type Phaser from 'phaser';
import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {sounds} from '@/constants/sounds';
import {Directions} from '@/constants/directions';
import {GameObjectCreator} from './game-object-creator';
import type {GameActor, GameActorConfig} from './game-actor';

export class TreadmillActor implements GameActor {
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly orientation: Directions;
    private readonly tilePosition: Point;
    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.orientation = config.orientation!;
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = new GameObjectCreator(config).createSprite(config.code);
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

    public getTileCode(): Tiles {
        return Tiles.treadmil;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

}
