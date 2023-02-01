import { Tiles } from '@/levels/tiles';
import { sounds } from '@/constants/sounds';
import { configuration } from '@/constants/configuration';
import { GameObjectCreator } from '@/stage/game-object-creator';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
export class BoxActor {
    tweens;
    image;
    id;
    scene;
    tilePosition;
    isOnTarget;
    currentTween;
    constructor(config) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.tweens = config.scene.tweens;
        this.image = new GameObjectCreator(config).createImage(config.code);
        this.isOnTarget = false;
    }
    getTilePosition() {
        return this.tilePosition;
    }
    getId() {
        return this.id;
    }
    async move(data) {
        return new Promise(resolve => {
            this.tilePosition = data.tilePosition;
            console.log(this.currentTween, this.tweens.getAllTweens().length);
            if (this.currentTween) {
                console.log('abort ', this.id, this.tilePosition);
                // this.currentTween?.tween.complete();
                this.currentTween?.tween.stop();
                console.log('stopped');
                this.currentTween?.resolve();
                this.currentTween = undefined;
            }
            const tween = {
                x: data.spritePosition.x,
                y: data.spritePosition.y,
                duration: configuration.updateCycleInMs,
                targets: this.image,
                onInit: () => {
                },
                onUpdate: () => {
                    this.image.setDepth(new TileDepthCalculator().calculate(Tiles.box, this.image.y));
                },
                onComplete: () => {
                    resolve();
                    this.currentTween = undefined;
                }
            };
            this.currentTween = {
                tween: this.tweens.add(tween),
                resolve: resolve
            };
        });
    }
    getTileCode() {
        return Tiles.box;
    }
    cover(staticActors) {
        if (staticActors
            .some(actor => actor.getTileCode() === Tiles.target)) {
            this.image.setFrame(Tiles.boxOnTarget);
            if (!this.isOnTarget) {
                this.isOnTarget = true;
                this.scene.sound.play(sounds.boxOnTarget.key, { volume: 0.5 });
            }
        }
        else {
            if (this.isOnTarget) {
                this.isOnTarget = false;
                this.image.setFrame(Tiles.box);
            }
        }
    }
    getIsOnTarget() {
        return this.isOnTarget;
    }
}
