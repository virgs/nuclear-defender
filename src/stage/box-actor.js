import { Tiles } from '../levels/tiles';
import { sounds } from '../constants/sounds';
import { SpriteCreator } from '../stage/sprite-creator';
import { configuration } from '../constants/configuration';
import { TileDepthCalculator } from '../scenes/tile-depth-calculator';
export class BoxActor {
    tweens;
    sprite;
    id;
    scene;
    tilePosition;
    isOnTarget;
    currentAnimation;
    constructor(config) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.tweens = config.scene.tweens;
        this.sprite = new SpriteCreator(config).createSprite();
        this.isOnTarget = false;
    }
    getTilePosition() {
        return this.tilePosition;
    }
    setTilePosition(tilePosition) {
        this.tilePosition = tilePosition;
    }
    getSprite() {
        return this.sprite;
    }
    getId() {
        return this.id;
    }
    async animate(data) {
        return new Promise(resolve => {
            if (this.currentAnimation) {
                console.log('abort ', this.id, this.tilePosition);
                this.currentAnimation?.tween.complete();
                this.currentAnimation?.tween.stop();
                this.currentAnimation?.resolve();
                this.currentAnimation = undefined;
            }
            const tween = {
                x: data.spritePosition.x,
                y: data.spritePosition.y,
                duration: configuration.updateCycleInMs,
                targets: this.sprite,
                onInit: () => {
                },
                onUpdate: () => {
                    this.sprite.setDepth(new TileDepthCalculator().calculate(Tiles.box, this.sprite.y));
                },
                onComplete: () => {
                    resolve();
                    this.currentAnimation = undefined;
                }
            };
            this.currentAnimation = {
                tween: this.tweens.add(tween),
                resolve: resolve
            };
        });
    }
    getTileCode() {
        return Tiles.box;
    }
    getOrientation() {
        return undefined;
    }
    isCovered() {
        return false;
    }
    cover(staticActors) {
        if (staticActors
            .some(actor => actor.getTileCode() === Tiles.target)) {
            this.sprite.setFrame(Tiles.boxOnTarget);
            if (!this.isOnTarget) {
                this.isOnTarget = true;
                this.scene.sound.play(sounds.boxOnTarget.key, { volume: 0.5 });
            }
        }
        else {
            if (this.isOnTarget) {
                this.isOnTarget = false;
                this.sprite.setFrame(Tiles.box);
            }
        }
    }
    getIsOnTarget() {
        return this.isOnTarget;
    }
}
