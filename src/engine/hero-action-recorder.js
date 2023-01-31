import { Actions } from '@/constants/actions';
export class HeroActionRecorder {
    engine;
    mementos;
    constructor(engine) {
        this.engine = engine;
        this.mementos = [];
    }
    getPlayerMoves() {
        return this.mementos
            .map(memento => memento.input.heroAction);
    }
    getLastActionResult() {
        return this.mementos[this.mementos.length - 1]?.output;
    }
    registerMovement(input, output) {
        this.mementos.push({ input: input, output: output });
    }
    async undo() {
        console.log('mementos: ' + this.mementos.length);
        let oneAfterTheAfterMemento;
        let oneAfterThisMemento;
        for (let index = this.mementos.length - 1; index > 0; --index) {
            const memento = this.mementos.pop();
            oneAfterTheAfterMemento = oneAfterThisMemento;
            oneAfterThisMemento = memento;
            if (!memento) {
                return;
            }
            if (memento.input.heroAction === Actions.STAND) {
                continue;
            }
            const oneBeforeThisMemento = this.mementos.pop();
            if (!oneBeforeThisMemento) {
                return;
            }
            console.log(oneBeforeThisMemento);
            console.log(memento);
            console.log(oneAfterThisMemento);
            console.log(oneAfterTheAfterMemento);
            await this.engine.updateAnimations(oneBeforeThisMemento.output);
            // await this.engine.makeMove(afterLastAction);
            return;
        }
        // let lastAction: MovementOrchestratorInput | undefined = this.mementos.pop();
        // let afterLastAction: MovementOrchestratorInput | undefined;
        // while (lastAction && lastAction?.heroAction !== Actions.STAND) {
        //     console.log(lastAction);
        //     afterLastAction = lastAction;
        //     lastAction = this.mementos.pop();
        // }
        // console.log(afterLastAction, lastAction);
        // if (afterLastAction && lastAction) {
        //     this.lastOutput = lastAction.lastActionResult;
        //     console.log('undo', afterLastAction);
        //     //
        //     // const undoLastAction: MovementOrchestratorOutput = {
        //     //     mapChanged: true,
        //     //     hero: {
        //     //         code: Tiles.hero,
        //     //         id: afterLastAction.hero.id,
        //     //         currentPosition: afterLastAction.hero.nextPosition,
        //     //         nextPosition: afterLastAction.hero.currentPosition,
        //     //         direction: lastAction.actionResult.hero.direction
        //     //     },
        //     //     boxes: lastAction.actionResult.boxes
        //     //         .map(box => ({
        //     //             code: Tiles.box,
        //     //             id: box.id,
        //     //             currentPosition: box.nextPosition,
        //     //             nextPosition: box.currentPosition,
        //     //             direction: undefined
        //     //         }))
        //     // };
        //     await this.engine.updateAnimations(lastAction.lastActionResult!);
        //     await this.engine.makeMove(afterLastAction);
        // }
    }
}
