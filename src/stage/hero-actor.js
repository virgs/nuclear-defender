import { Tiles } from '@/levels/tiles';
import { sounds } from '@/constants/sounds';
import { GameObjectCreator } from './game-object-creator';
import { HeroAnimator } from '@/animations/hero-animator';
import { EventEmitter, EventName } from '@/events/event-emitter';
import { Actions, mapDirectionToAction } from '@/constants/actions';
import { TileDepthCalculator } from '@/scenes/tile-depth-calculator';
export class HeroActor {
    heroAnimator;
    sprite;
    id;
    scene;
    tweens;
    tilePosition;
    actionInputBuffer;
    constructor(config) {
        this.id = config.id;
        this.scene = config.scene;
        this.heroAnimator = new HeroAnimator();
        this.tweens = config.scene.tweens;
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles
        this.sprite = new GameObjectCreator(config).createSprite();
        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite.anims.create(item));
        this.tilePosition = config.tilePosition;
        EventEmitter.listenToEvent(EventName.HERO_DIRECTION_INPUT, (direction) => {
            this.actionInputBuffer = mapDirectionToAction(direction);
        });
    }
    getTilePosition() {
        return this.tilePosition;
    }
    setTilePosition(tilePosition) {
        this.tilePosition = tilePosition;
    }
    checkAction() {
        const actionInputBuffer = this.actionInputBuffer || Actions.STAND;
        this.actionInputBuffer = undefined;
        return actionInputBuffer;
    }
    async animate(data) {
        return new Promise((resolve) => {
            if (data.animationPushedBox) {
                this.scene.sound.play(sounds.pushingBox.key, { volume: 0.25 });
            }
            const heroMovement = this.heroAnimator.getAnimation(data);
            if (heroMovement) {
                this.tweens.add({
                    ...heroMovement.tween,
                    targets: this.sprite,
                    onInit: () => {
                        this.sprite.anims.play(heroMovement.walking, true);
                    },
                    onUpdate: () => {
                        this.sprite.setDepth(new TileDepthCalculator().calculate(Tiles.hero, this.sprite.y));
                    },
                    onComplete: () => {
                        this.sprite.anims.play(heroMovement.idle, true);
                        resolve();
                    },
                    onCompleteScope: this //doc purposes
                });
            }
            else {
                resolve();
            }
        });
    }
    getSprite() {
        return this.sprite;
    }
    getTileCode() {
        return Tiles.hero;
    }
    getId() {
        return this.id;
    }
    getOrientation() {
        return undefined;
    }
    isCovered() {
        return false;
    }
    cover() {
    }
}
