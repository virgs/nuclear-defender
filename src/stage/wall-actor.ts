import type Phaser from 'phaser';
import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import type {Directions} from '@/constants/directions';
import type {GameActor, GameActorConfig} from './game-actor';
import {GameObjectCreator} from '@/stage/game-object-creator';

export class WallActor implements GameActor {
    private readonly id: number;
    private readonly picture: Phaser.GameObjects.GameObject;
    private tilePosition: Point;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;


        this.picture = new GameObjectCreator(config).createImage();

        // const wallOnTop: boolean = config.contentAround[0][1]
        //     .some(item => item.code === Tiles.wall);
        // const wallOnLeft: boolean = config.contentAround[1][0]
        //     .some(item => item.code === Tiles.wall);
        // const wallOnRight: boolean = config.contentAround[1][2]
        //     .some(item => item.code === Tiles.wall);
        // const wallOnBottom: boolean = config.contentAround[2][1]
        //     .some(item => item.code === Tiles.wall);
    }

    public getId(): number {
        return this.id;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
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

    public cover(): void {
    }

    public async animate(): Promise<any> {
    }

}