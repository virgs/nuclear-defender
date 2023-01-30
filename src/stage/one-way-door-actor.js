import { Tiles } from '@/levels/tiles';
import { GameObjectCreator } from './game-object-creator';
export class OneWayDoorActor {
    sprite;
    id;
    covered;
    tilePosition;
    constructor(config) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        this.sprite = new GameObjectCreator(config).createSprite();
        this.covered = false;
    }
    isCovered() {
        return this.covered;
    }
    cover() {
        this.covered = true;
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
    setTilePosition(tilePosition) {
        this.tilePosition = tilePosition;
    }
    getOrientation() {
        return undefined;
    }
    async animate() {
    }
}
