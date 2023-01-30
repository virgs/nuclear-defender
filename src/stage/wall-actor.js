import { Tiles } from '../levels/tiles';
import { SpriteCreator } from './sprite-creator';
export class WallActor {
    id;
    sprite;
    tilePosition;
    constructor(config) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        this.sprite = new SpriteCreator(config).createSprite();
        // const wallOnTop: boolean = config.contentAround[0][1]
        //     .some(item => item.code === Tiles.wall);
        // const wallOnLeft: boolean = config.contentAround[1][0]
        //     .some(item => item.code === Tiles.wall);
        // const wallOnRight: boolean = config.contentAround[1][2]
        //     .some(item => item.code === Tiles.wall);
        // const wallOnBottom: boolean = config.contentAround[2][1]
        //     .some(item => item.code === Tiles.wall);
    }
    getId() {
        return this.id;
    }
    getOrientation() {
        return undefined;
    }
    getSprite() {
        return this.sprite;
    }
    getTileCode() {
        return Tiles.wall;
    }
    getTilePosition() {
        return this.tilePosition;
    }
    setTilePosition(tilePosition) {
        this.tilePosition = tilePosition;
    }
    isCovered() {
        return false;
    }
    cover() {
    }
    async animate() {
    }
}
