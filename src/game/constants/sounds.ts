import oil from '@/game/assets/sounds/oil.wav';
import boxOnTarget from '@/game/assets/sounds/boxOnTarget.wav';
import pushingBox from '@/game/assets/sounds/pushingBox.wav';
// @ts-ignore
import springEngage from '@/game/assets/sounds/spring-engage.m4a';
import springRelease from '@/game/assets/sounds/spring-release.wav';
import treadmil from '@/game/assets/sounds/treadmil-uncover.wav';
import victory from '@/game/assets/sounds/victory.wav';


export const sounds: {
    [proname: string]: {
        key: string,
        resource: any
    }
} = {
    oil: {
        key: 'oilKey',
        resource: oil
    },
    springEngage: {
        key: 'springEngageKey',
        resource: springEngage
    },
    springRelease: {
        key: 'springReleaseKey',
        resource: springRelease
    },
    boxOnTarget: {
        key: 'boxOnTargetKey',
        resource: boxOnTarget
    },
    treadmil: {
        key: 'treadmilKey',
        resource: treadmil
    },
    victory: {
        key: 'victoryKey',
        resource: victory
    },
    pushingBox: {
        key: 'pushingBoxKey',
        resource: pushingBox
    },
};