import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {GameObjectCreator} from './game-object-creator';
import type {Directions} from '@/constants/directions';
import type {GameActor, GameActorConfig} from './game-actor';

export class OneWayDoorActor implements GameActor {
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private covered: boolean;
    private tilePosition: Point;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        this.sprite = new GameObjectCreator(config).createSprite();
        this.covered = false;
    }

    public isCovered(): boolean {
        return this.covered;
    }

    public cover(): void {
        this.covered = true;
    }

    public getId(): number {
        return this.id;
    }

    public getTileCode(): Tiles {
        return Tiles.oneWayDoor;
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

    public async animate(): Promise<any> {
    }

}
