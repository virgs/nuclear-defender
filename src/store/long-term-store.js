import { configuration } from '@/constants/configuration';
// @ts-ignore
import customMap from '../assets/levels/custom.json';
export class LongTermStore {
    static getLevelCompleteData() {
        const item = LongTermStore.decodeAndGet(configuration.store.resolvedLevelsKey);
        if (item) {
            return JSON.parse(item);
        }
        return [];
    }
    static setLevelCompleteData(data) {
        LongTermStore.encodeAndSet(configuration.store.resolvedLevelsKey, JSON.stringify(data));
    }
    static getCustomLevel() {
        const item = LongTermStore.decodeAndGet(configuration.store.customLevelKey);
        if (item !== null) {
            return JSON.parse(item);
        }
        else {
            const titles = ['mug tree nightmare', 'hairy keyboard', 'frozen rule'];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const customLevel = {
                ...customMap,
                title: title
            };
            LongTermStore.setCustomLevel(customLevel);
            return customLevel;
        }
    }
    static setCustomLevel(newCustom) {
        LongTermStore.encodeAndSet(configuration.store.customLevelKey, JSON.stringify(newCustom));
    }
    static getCurrentSelectedIndex() {
        return Number(LongTermStore.decodeAndGet(configuration.store.currentSelectedIndexKey) || 0);
    }
    static setCurrentSelectedIndex(currentIndex) {
        LongTermStore.encodeAndSet(configuration.store.currentSelectedIndexKey, currentIndex + '');
    }
    static getNumberOfEnabledLevels() {
        const numberOfEnabledLevels = LongTermStore.decodeAndGet(configuration.store.numberOfEnabledLevelsKey);
        if (numberOfEnabledLevels === null) {
            LongTermStore.setNumberOfEnabledLevels(2);
            return 2; //custom + another
        }
        return Number(numberOfEnabledLevels);
    }
    static setNumberOfEnabledLevels(value) {
        LongTermStore.encodeAndSet(configuration.store.numberOfEnabledLevelsKey, value + '');
    }
    static encodeAndSet(key, value) {
        //encode item and value
        //it would be nice to add some browser id immutable related stuff as key
        //https://pieroxy.net/blog/pages/lz-string/index.html
        localStorage.setItem(key, value);
    }
    static decodeAndGet(key) {
        //https://pieroxy.net/blog/pages/lz-string/index.html
        return localStorage.getItem(key);
    }
}
