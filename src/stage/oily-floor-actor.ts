import type Phaser from 'phaser';
import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {sounds} from '@/constants/sounds';
import {GameObjectCreator} from '@/stage/game-object-creator';
import type {GameActor, GameActorConfig} from '@/stage/game-actor';

export class OilyFloorActor implements GameActor {
    private readonly scene: Phaser.Scene;
    private readonly image: Phaser.GameObjects.Image;
    private readonly id: number;
    private readonly tilePosition: Point;
    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.image = new GameObjectCreator(config).createImage(config.code);
        this.covered = false;
    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.box)) {
            this.covered = true;
            //TODO add particle effect?
        } else {
            if (this.covered) {
                this.covered = false;
                this.scene.sound.play(sounds.oil.key, {volume: 0.1});
            }
        }
    }

    public getId(): number {
        return this.id;
    }

    public getTileCode(): Tiles {
        return Tiles.oily;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

}
