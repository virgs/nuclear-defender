import {Directions} from '@/constants/directions';
import {configuration} from '@/constants/configuration';
import type {SpriteSheetLines} from '@/animations/animation-atlas';

export enum AnimationState {
    STANDING,
    WALKING_COVERING,
    PUSHING_UNCOVERING,
}

export type FramesData = {
    spriteSheetLine: SpriteSheetLines,
    orientation?: Directions,
    state?: AnimationState,
};


export class AnimationFramesFinder {
    private readonly data: FramesData;
    private readonly tilesDirectionOrder = [Directions.DOWN, Directions.UP, Directions.LEFT, Directions.RIGHT];

    constructor(data: FramesData) {
        this.data = data;
    }

    public getFrames(numberOfFrames: number): number[] {
        const line = configuration.tiles.numOfFramesPerLine * this.data.spriteSheetLine;
        let stateInitialPosition = configuration.tiles.framesPerAnimation * (this.data.state || 0);
        let orientationModifier = 0;
        if (this.data.orientation !== undefined) {
            stateInitialPosition *= 4;
            const directionOrder = this.tilesDirectionOrder
                .findIndex(item => item === this.data.orientation)
            orientationModifier = directionOrder * configuration.tiles.framesPerAnimation;
        }
        const initialFrame = line + stateInitialPosition + orientationModifier;
        return Array
            .from(new Array(numberOfFrames))
            .map((_, index) => initialFrame + index);
    }
}