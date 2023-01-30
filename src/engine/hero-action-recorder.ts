import {Actions} from '../constants/actions';
import type {GameStage} from '../stage/game-stage';
import type {MovementOrchestratorInput, MovementOrchestratorOutput} from '../engine/movement-orchestrator';
//
// type Memento = {
//     heroAction: Actions
//     actionResult: MovementOrchestratorOutput,
//     previousActionResult?: MovementOrchestratorOutput,
// };

export class HeroActionRecorder {
    private readonly engine: GameStage;
    private readonly mementos: MovementOrchestratorInput[];
    private lastOutput?: MovementOrchestratorOutput;

    constructor(engine: GameStage) {
        this.engine = engine;
        this.mementos = [];
    }

    public getPlayerMoves(): Actions[] {
        return this.mementos
            .map(memento => memento.heroAction);
    }

    public getLastActionResult(): MovementOrchestratorOutput | undefined {
        return this.lastOutput;
    }

    public registerMovement(input: MovementOrchestratorInput, output: MovementOrchestratorOutput) {
        this.lastOutput = output;
        this.mementos.push(input);
    }

    async undo(): Promise<void> {
        let lastAction: MovementOrchestratorInput | undefined = this.mementos.pop();
        let afterLastAction: MovementOrchestratorInput | undefined;
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
            await this.engine.updateAnimations(lastAction.lastActionResult!);
            await this.engine.makeMove(afterLastAction);
        }

    }
}