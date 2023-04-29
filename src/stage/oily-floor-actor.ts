import { SpriteSheetLines } from '@/animations/sprite-sheet-lines';
import { AnimationCreator, type AnimationConfig } from '@/animations/animation-creator';
import { configuration } from '@/constants/configuration';
import { sounds } from '@/constants/sounds';
import { Tiles } from '@/levels/tiles';
import type { Point } from '@/math/point';
import type { GameActor, GameActorConfig } from '@/stage/game-actor';
import type Phaser from 'phaser';

export class OilyFloorActor implements GameActor {
    private readonly scene: Phaser.Scene;
    private readonly id: number;
    private readonly tilePosition: Point;
    private readonly animationConfig: AnimationConfig;

    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.animationConfig = {
            playable: config.playable,
            scene: config.scene,
            spriteSheetLine: SpriteSheetLines.OIL,
            worldPosition: config.worldPosition,
        };

        new AnimationCreator(this.animationConfig)
            .createImage(this.animationConfig.spriteSheetLine * configuration.tiles.numOfFramesPerLine + 
                Math.floor(Math.random() * configuration.tiles.oilFramesNum));

        this.covered = false;
    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.box)) {
            this.covered = true;
            //TODO add particle effect?
        } else {
            if (this.covered) {
                this.covered = false;
                this.scene.sound.play(sounds.oil.key, { volume: 0.1 });
            }
        }
    }

    public getId(): number {
        return this.id;
    }

    public getTileCode(): Tiles {
        return Tiles.oily;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

}
