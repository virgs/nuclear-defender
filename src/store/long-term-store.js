import { configuration } from '@/constants/configuration';
// @ts-ignore
import customMap from '../assets/levels/custom.json';
export class LongTermStore {
    static getLevelCompleteData() {
        const item = localStorage.getItem(configuration.store.resolvedLevelsKey);
        if (item) {
            return JSON.parse(item);
        }
        return [];
    }
    static setLevelCompleteData(data) {
        localStorage.setItem(configuration.store.resolvedLevelsKey, JSON.stringify(data));
    }
    static getCustomLevel() {
        const item = localStorage.getItem(configuration.store.customLevelKey);
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
        localStorage.setItem(configuration.store.customLevelKey, JSON.stringify(newCustom));
    }
    static getCurrentSelectedIndex() {
        return Number(localStorage.getItem(configuration.store.currentSelectedIndexKey) || 0);
    }
    static setCurrentSelectedIndex(currentIndex) {
        localStorage.setItem(configuration.store.currentSelectedIndexKey, currentIndex + '');
    }
    static getNumberOfEnabledLevels() {
        const numberOfEnabledLevels = localStorage.getItem(configuration.store.numberOfEnabledLevelsKey);
        if (numberOfEnabledLevels === null) {
            LongTermStore.setNumberOfEnabledLevels(2);
            return 2; //custom + another
        }
        return Number(numberOfEnabledLevels);
    }
    static setNumberOfEnabledLevels(value) {
        localStorage.setItem(configuration.store.numberOfEnabledLevelsKey, value + '');
    }
}
