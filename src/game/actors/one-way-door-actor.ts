import type {Point} from '@/game/math/point';
import type Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';
import type {GameActorConfig, GameActor} from '@/game/actors/game-actor';
import {configuration} from '@/game/constants/configuration';

export class OneWayDoorActor implements GameActor {
    private readonly scene: Phaser.Scene;
    private readonly tilePosition: Point;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = config.scene.add.sprite(config.worldPosition.x, config.worldPosition.y, configuration.tiles.spriteSheetKey, this.getTileCode());
        this.covered = false;
    }

    public isCovered(): boolean {
        return this.covered;
    }

    public uncover(tile: GameActor): void {
        this.covered = false;
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
        return Tiles.oneWayDoor;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

}
