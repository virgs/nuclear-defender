import { Actions } from '../constants/actions';
//
// type Memento = {
//     heroAction: Actions
//     actionResult: MovementOrchestratorOutput,
//     previousActionResult?: MovementOrchestratorOutput,
// };
export class HeroActionRecorder {
    engine;
    mementos;
    lastOutput;
    constructor(engine) {
        this.engine = engine;
        this.mementos = [];
    }
    getPlayerMoves() {
        return this.mementos
            .map(memento => memento.heroAction);
    }
    getLastActionResult() {
        return this.lastOutput;
    }
    registerMovement(input, output) {
        this.lastOutput = output;
        this.mementos.push(input);
    }
    async undo() {
        let lastAction = this.mementos.pop();
        let afterLastAction;
        while (lastAction && lastAction?.heroAction !== Actions.STAND) {
            console.log(lastAction);
            afterLastAction = lastAction;
            lastAction = this.mementos.pop();
        }
        console.log(afterLastAction, lastAction);
        if (afterLastAction && lastAction) {
            this.lastOutput = lastAction.lastActionResult;
            console.log('undo', afterLastAction);
            //
            // const undoLastAction: MovementOrchestratorOutput = {
            //     mapChanged: true,
            //     hero: {
            //         code: Tiles.hero,
            //         id: afterLastAction.hero.id,
            //         currentPosition: afterLastAction.hero.nextPosition,
            //         nextPosition: afterLastAction.hero.currentPosition,
            //         direction: lastAction.actionResult.hero.direction
            //     },
            //     boxes: lastAction.actionResult.boxes
            //         .map(box => ({
            //             code: Tiles.box,
            //             id: box.id,
            //             currentPosition: box.nextPosition,
            //             nextPosition: box.currentPosition,
            //             direction: undefined
            //         }))
            // };
            await this.engine.updateAnimations(lastAction.lastActionResult);
            await this.engine.makeMove(afterLastAction);
        }
    }
}
