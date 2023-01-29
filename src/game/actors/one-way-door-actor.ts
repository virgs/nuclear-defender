import type Phaser from 'phaser';
import {Tiles} from '@/game/levels/tiles';
import type {Point} from '@/game/math/point';
import type {AnimateData} from '@/game/actors/game-actor';
import {SpriteCreator} from '@/game/actors/sprite-creator';
import type {Directions} from '@/game/constants/directions';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';

export class OneWayDoorActor implements GameActor {
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

    public cover(tile: GameActor[]): void {
        this.covered = true;
    }

    public getId(): number {
        return this.id;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
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

    public async animate(data: AnimateData): Promise<any> {
    }

}
