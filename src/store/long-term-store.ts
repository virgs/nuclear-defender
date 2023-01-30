import type {Actions} from '@/constants/actions';
import type {Level} from '@/levels/levels';
import {configuration} from '@/constants/configuration';
// @ts-ignore
import customMap from '../assets/levels/custom.json';

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
        const item = LongTermStore.decodeAndGet(configuration.store.resolvedLevelsKey);
        if (item) {
            return JSON.parse(item);
        }

        return [];
    }

    public static setLevelCompleteData(data: LevelCompleteData[]): void {
        LongTermStore.encodeAndSet(configuration.store.resolvedLevelsKey, JSON.stringify(data));
    }

    public static getCustomLevel(): Level {
        const item = LongTermStore.decodeAndGet(configuration.store.customLevelKey);
        if (item !== null) {
            return JSON.parse(item);
        } else {
            const titles = ['mug tree nightmare', 'hairy keyboard', 'frozen rule'];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const customLevel = {
                ...customMap,
                title: title
            };
            LongTermStore.setCustomLevel(customLevel)
            return customLevel;
        }
    }

    public static setCustomLevel(newCustom: Level): void {
        LongTermStore.encodeAndSet(configuration.store.customLevelKey, JSON.stringify(newCustom));
    }

    public static getCurrentSelectedIndex(): number {
        return Number(LongTermStore.decodeAndGet(configuration.store.currentSelectedIndexKey) || 0);
    }

    public static setCurrentSelectedIndex(currentIndex: number) {
        LongTermStore.encodeAndSet(configuration.store.currentSelectedIndexKey, currentIndex + '');
    }

    public static getNumberOfEnabledLevels(): number {
        const numberOfEnabledLevels = LongTermStore.decodeAndGet(configuration.store.numberOfEnabledLevelsKey);
        if (numberOfEnabledLevels === null) {
            LongTermStore.setNumberOfEnabledLevels(2);
            return 2; //custom + another
        }
        return Number(numberOfEnabledLevels);
    }

    public static setNumberOfEnabledLevels(value: number) {
        LongTermStore.encodeAndSet(configuration.store.numberOfEnabledLevelsKey, value + '');
    }

    private static encodeAndSet(key: string, value: string): void {
        //encode item and value
        //it would be nice to add some browser id immutable related stuff as key
        //https://pieroxy.net/blog/pages/lz-string/index.html
        localStorage.setItem(key, value);
    }

    private static decodeAndGet(key: string): string | null {
        //https://pieroxy.net/blog/pages/lz-string/index.html
        return localStorage.getItem(key);
    }

}

