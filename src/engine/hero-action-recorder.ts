import {Actions} from '@/constants/actions';
import type {GameStage} from '@/stage/game-stage';
import type {MovementOrchestratorInput, MovementOrchestratorOutput} from '@/engine/movement-orchestrator';

type Memento = {
    input: MovementOrchestratorInput,
    output: MovementOrchestratorOutput,
};

export class HeroActionRecorder {
    private readonly engine: GameStage;
    private readonly mementos: Memento[];

    constructor(engine: GameStage) {
        this.engine = engine;
        this.mementos = [];
    }

    public getPlayerMoves(): Actions[] {
        return this.mementos
            .map(memento => memento.input.heroAction);
    }

    public getLastActionResult(): MovementOrchestratorOutput | undefined {
        return this.mementos[this.mementos.length - 1]?.output;
    }

    public registerMovement(input: MovementOrchestratorInput, output: MovementOrchestratorOutput) {
        const memento = {input: input, output: output};
        console.log(memento)
        this.mementos.push(memento);
    }

    async undo(): Promise<void> {
        console.log('mementos: ' + this.mementos.length)
        let oneAfterTheAfterMemento: Memento | undefined;
        let oneAfterThisMemento: Memento | undefined;
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
            // const oneBeforeThisMemento = this.mementos.pop();
            // if (!oneBeforeThisMemento) {
            //     return;
            // }
            // console.log(oneBeforeThisMemento)
            const output: MovementOrchestratorOutput = {
                boxes: memento.output.boxes
                    .map(box => ({
                        id: box.id,
                        currentPosition: box.nextPosition,
                        code: box.code,
                        nextPosition: box.currentPosition,
                        direction: box.direction,
                    })),
                hero: {
                    id: memento.output.hero.id,
                    code: memento.output.hero.code,
                    currentPosition: memento.output.hero.nextPosition,
                    nextPosition: memento.output.hero.currentPosition,
                    direction: memento.output.hero.direction
                    // direction: getOppositeDirectionOf(memento.output.hero.direction!)
                },
                mapChanged: true
            }
            console.log(memento)
            // console.log(oneAfterThisMemento)
            // console.log(oneAfterTheAfterMemento)
            // await this.engine.updateAnimations(oneBeforeThisMemento.output);
            // oneBeforeThisMemento.output.mapChanged = true;
            await this.engine.updateAnimations(output);
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