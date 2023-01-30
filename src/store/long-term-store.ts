import type {Actions} from '@/constants/actions';
import type {Level} from '@/levels/availableLevels';
import {configuration} from '@/constants/configuration';
// @ts-ignore
import * as customMap from '../assets/levels/custom.json';

export type LevelCompleteData = {
    index: number,
    title: string,
    map: string,
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

    public static getCustomLevel(): Level {
        const item = localStorage.getItem(configuration.store.customLevelKey);
        if (item !== null) {
            return JSON.parse(item);
        } else {
            const titles = ['mug tree nightmare', 'hairy keyboard', 'frozen rule'];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const customLevel = {
                ...customMap,
                title: title
            };
            console.log(customLevel)
            LongTermStore.setCustomLevel(customLevel)
            return customLevel;
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
        const numberOfEnabledLevels = localStorage.getItem(configuration.store.numberOfEnabledLevelsKey);
        if (numberOfEnabledLevels === null) {
            LongTermStore.setNumberOfEnabledLevels(2);
            return 2; //custom + another
        }
        return Number(numberOfEnabledLevels);
    }

    public static setNumberOfEnabledLevels(value: number) {
        localStorage.setItem(configuration.store.numberOfEnabledLevelsKey, value + '');
    }

}