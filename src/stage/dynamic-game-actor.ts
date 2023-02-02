import type {Point} from '@/math/point';
import type {GameActor} from '@/stage/game-actor';
import type {Directions} from '@/constants/directions';

export type MoveData = {
    duration: number;
    tilePosition: Point;
    spritePosition: Point,
    orientation?: Directions,
    animationPushedBox?: boolean
};

export interface DynamicGameActor extends GameActor {
    update(data: MoveData): Promise<any>;
}