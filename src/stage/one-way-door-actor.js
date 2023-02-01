import { Tiles } from '@/levels/tiles';
import { GameObjectCreator } from './game-object-creator';
export class OneWayDoorActor {
    sprite;
    id;
    tilePosition;
    constructor(config) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        this.sprite = new GameObjectCreator(config).createSprite(config.code);
    }
    cover() {
    }
    getId() {
        return this.id;
    }
    getTileCode() {
        return Tiles.oneWayDoor;
    }
    getTilePosition() {
        return this.tilePosition;
    }
}
