import { Tiles } from '@/levels/tiles';
import { sounds } from '@/constants/sounds';
import { GameObjectCreator } from '@/stage/game-object-creator';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
export class BoxActor {
    tweens;
    image;
    id;
    scene;
    tilePosition;
    onTarget;
    currentTween;
    constructor(config) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.tweens = config.scene.tweens;
        this.image = new GameObjectCreator(config)
            .createImage(config.code);
    }
    getTilePosition() {
        return this.tilePosition;
    }
    getId() {
        return this.id;
    }
    async update(data) {
        if (this.tilePosition.isEqualTo(data.tilePosition)) {
            return;
        }
        return new Promise(resolve => {
            this.tilePosition = data.tilePosition;
            if (this.currentTween) {
                console.log('abort ', this.id, this.tilePosition);
                // this.currentTween?.tween.complete();
                this.currentTween?.tween.stop();
                console.log('stopped');
                this.currentTween?.resolve();
                this.currentTween = undefined;
            }
            const tween = {
                targets: this.image,
                x: data.spritePosition.x,
                y: data.spritePosition.y,
                duration: data.duration,
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
        const onTarget = staticActors
            .find(actor => actor.getTileCode() === Tiles.target);
        if (onTarget) {
            this.image.setFrame(Tiles.boxOnTarget);
            const targetId = onTarget.getId();
            if (this.onTarget !== targetId) {
                this.onTarget = targetId;
                this.scene.sound.play(sounds.boxOnTarget.key, { volume: 0.5 });
            }
        }
        else {
            if (this.onTarget !== undefined) {
                this.onTarget = undefined;
                this.image.setFrame(Tiles.box);
            }
        }
    }
    getIsOnTarget() {
        return this.onTarget !== undefined;
    }
}
