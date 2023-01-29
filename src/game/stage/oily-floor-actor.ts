import type Phaser from 'phaser';
import {Tiles} from '@/game/levels/tiles';
import type {Point} from '@/game/math/point';
import {sounds} from '@/game/constants/sounds';
import {SpriteCreator} from '@/game/stage/sprite-creator';
import type {Directions} from '@/game/constants/directions';
import type {AnimateData, GameActor, GameActorConfig} from '@/game/stage/game-actor';

export class OilyFloorActor implements GameActor {
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private covered: boolean;
    private tilePosition: Point;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = new SpriteCreator(config).createSprite();
        this.covered = false;
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
                this.scene.sound.play(sounds.oil.key, {volume: 0.1});
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
        return Tiles.oily;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public setTilePosition(tilePosition: Point): void {
        this.tilePosition = tilePosition;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public async animate(data: AnimateData): Promise<any> {
    }

}
