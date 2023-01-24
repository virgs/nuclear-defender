import type {Level} from '@/game/levels/levels';
import type {Actions} from '@/game/constants/actions';

export type GameViewConfig = {
    level: Level;
    display: string;
    isCustom: boolean;
    levelIndex: number;
    playerInitialActions: string;
};

export type NextLevelViewConfig = {
    level: Level;
    isCustomLevel: boolean;
    levelIndex: number;
    totalTime: number;
    display: string;
    movesCode: Actions[];
};

export class SessionStore {

    private static gameViewConfig?: GameViewConfig;
    private static nextLevelViewConfig?: NextLevelViewConfig;

    public static getGameViewConfig(): GameViewConfig | undefined {
        return SessionStore.gameViewConfig;
    }

    public static setGameViewConfig(config: GameViewConfig): void {
        SessionStore.gameViewConfig = config;
    }

    static setNextLevelViewConfig(config: NextLevelViewConfig) {
        SessionStore.nextLevelViewConfig = config;
    }

    static getNextLevelViewConfig(): NextLevelViewConfig | undefined {
        return SessionStore.nextLevelViewConfig;
    }
}