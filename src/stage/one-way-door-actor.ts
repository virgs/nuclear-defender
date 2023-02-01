import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {GameObjectCreator} from './game-object-creator';
import type {Directions} from '@/constants/directions';
import type {GameActor, GameActorConfig} from './game-actor';

export class OneWayDoorActor implements GameActor {
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly tilePosition: Point;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        this.sprite = new GameObjectCreator(config).createSprite(config.code);
    }

    public cover(): void {
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

}
