import type {SceneConfig} from '@/game/game';
import type {Actions} from '@/game/constants/actions';
import type {Level} from '@/game/levels/levels';
import {configuration} from '@/game/constants/configuration';

//TODO save it in solved levels array

type LevelCompleteData = {
    sceneConfig: SceneConfig,
    movesCode: Actions[],
    totalTime: number,
    timestamp: number
};

export class LongTermStore {
    public static getLevelCompleteData(): LevelCompleteData[] {
        const item = localStorage.getItem(configuration.store.resolvedLevelsKey);
        if (item) {
            return JSON.parse(item);
        }

        return [];
    }

    public static setLevelCompleteData(data: LevelCompleteData[]): void {
        localStorage.setItem(configuration.store.resolvedLevelsKey, JSON.stringify(data));
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