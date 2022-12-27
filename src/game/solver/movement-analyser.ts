import type {MovementCoordinatorOutput} from './movement-coordinator';

export enum MovementAnalyses {
    HERO_MOVED,
    BOX_MOVED,
    HERO_MOVED_BOX_ONTO_TARGET,
    HERO_MOVED_BOX_OUT_OF_TARGET
}

export class MovementAnalyser {
    public analyse(movement: MovementCoordinatorOutput): MovementAnalyses[] {
        const analysis: MovementAnalyses[] = [];
        if (!movement.hero.currentPosition.equal(movement.hero.previousPosition)) {
            analysis.push(MovementAnalyses.HERO_MOVED);
        }
        const movedBoxes = movement.boxes
            .filter(box => !box.previousPosition.equal(box.currentPosition));

        movedBoxes
            .forEach(_ => analysis.push(MovementAnalyses.BOX_MOVED));

        if (movedBoxes
            .some(box => movement.hero.currentPosition.equal(box.previousPosition) &&
                box.isCurrentlyOnTarget &&
                movement.hero.direction === box.direction)) {
            analysis.push(MovementAnalyses.HERO_MOVED_BOX_ONTO_TARGET);
        }
        if (movedBoxes
            .some(box => movement.hero.currentPosition.equal(box.previousPosition) &&
                !box.isCurrentlyOnTarget && movement.hero.isCurrentlyOnTarget &&
                movement.hero.direction === box.direction)) {
            analysis.push(MovementAnalyses.HERO_MOVED_BOX_OUT_OF_TARGET);
        }
        return analysis;
    }
}