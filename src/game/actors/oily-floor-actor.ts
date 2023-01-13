import type Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import {sounds} from '@/game/constants/sounds';
import {SpriteCreator} from '@/game/actors/sprite-creator';
import type {Directions} from '@/game/constants/directions';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';

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
        this.sprite = new SpriteCreator({scene: config.scene, code: this.getTileCode()}).createSprite(config.worldPosition);
        this.covered = false;
    }

    public isCovered(): boolean {
        return this.covered;
    }

    public uncover(tile: GameActor): void {
        this.covered = false;
        if (tile.getTileCode() === Tiles.box) {
            this.scene.sound.play(sounds.oil.key, {volume: 0.2})
        }
    }

    public cover(tile: GameActor): void {
        //TODO add particle effect
        this.covered = true;
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

    public async animate(nextPosition: Point, direction?: Directions): Promise<any> {
    }

}
