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
        this.mementos.push({input: input, output: output});
    }

    async undo(): Promise<void> {
        for (let index = this.mementos.length - 1; index > 0; --index) {
            const memento = this.mementos.pop();
            if (!memento) {
                return;
            }
            if (memento.input.heroAction === Actions.STAND) {
                continue;
            }
            console.log(memento.input)
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