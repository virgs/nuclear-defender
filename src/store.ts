import type {SceneConfig} from '@/game/game';
import type {Actions} from '@/game/constants/actions';
import type {Level} from '@/game/levels/defaultLevels';
import {configuration} from '@/game/constants/configuration';

//TODO save it in solved levels array
type LevelRecords = {
    totalTime: number,
    movesCode: Actions[],
    timestamp: number
}

type LevelCompleteData = {
    sceneConfig: SceneConfig,
    movesCode: Actions[],
    totalTime: number
};

export class Store {
    private static currentSceneConfig?: Level;
    private static levelCompletedData?: LevelCompleteData;

    public static getCurrentSceneConfig(): Level | undefined {
        return Store.currentSceneConfig;
    }

    public static setCurrentSceneConfig(level: Level): void {
        Store.currentSceneConfig = level;
    }

    public static getLevelCompleteData(): LevelCompleteData | undefined {
        return Store.levelCompletedData;
    }

    public static setLevelCompleteData(data: LevelCompleteData): void {
        Store.levelCompletedData = data;
    }

    public static getCustomLevel(): Level | undefined {
        const item = localStorage.getItem(configuration.store.customLevelKey);
        if (item) {
            return JSON.parse(item);
        }
    }

    public static setCustomLevel(newCustom: Level): void {
        localStorage.setItem(configuration.store.customLevelKey, JSON.stringify(newCustom));
    }

    public static getCurrentSelectedIndex(): number {
        return Number(localStorage.getItem(configuration.store.currentSelectedIndexKey) || 0);
    }

    public static setCurrentSelectedIndex(currentIndex: number) {
        localStorage.setItem(configuration.store.currentSelectedIndexKey, currentIndex + '');
    }

    public static getNumberOfEnabledLevels(): number {
        const number = Number(localStorage.getItem(configuration.store.numberOfEnabledLevelsKey) || 0);
        return Math.max(number, 1);
    }

    public static setNumberOfEnabledLevels(value: number) {
        localStorage.setItem(configuration.store.numberOfEnabledLevelsKey, value + '');
    }

}