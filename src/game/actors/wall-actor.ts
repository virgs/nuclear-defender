import type Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';
import {SpriteCreator} from '@/game/actors/sprite-creator';

export class WallActor implements GameActor {
    private readonly id: number;
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private tilePosition: Point;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;

        this.sprite = new SpriteCreator({scene: config.scene, code: this.getTileCode()}).createSprite(config.worldPosition);
        const wallOnTop: boolean = config.contentAround[0][1]
            .some(item => item.code === Tiles.wall);
        const wallOnLeft: boolean = config.contentAround[1][0]
            .some(item => item.code === Tiles.wall);
        const wallOnRight: boolean = config.contentAround[1][2]
            .some(item => item.code === Tiles.wall);
        const wallOnBottom: boolean = config.contentAround[2][1]
            .some(item => item.code === Tiles.wall);
        if (this.tilePosition.isEqualTo(new Point(0, 1))) {
            console.log(config.contentAround);
            console.log(wallOnLeft, wallOnTop, wallOnRight, wallOnBottom);
        }
    }

    public getId(): number {
        return this.id;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getTileCode(): Tiles {
        return Tiles.wall;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public setTilePosition(tilePosition: Point): void {
        this.tilePosition = tilePosition;
    }

    public isCovered(): boolean {
        return false;
    }

    public cover(tile: GameActor): void {
    }

    public uncover(tile: GameActor): void {
    }

    public async animate(nextPosition: Point, direction?: Directions): Promise<any> {
    }

}