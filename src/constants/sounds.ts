import oil from '../assets/sounds/oil.wav';
import boxOnTarget from '../assets/sounds/boxOnTarget.wav';
import pushingBox from '../assets/sounds/pushingBox.wav';
// @ts-ignore
import springEngage from '../assets/sounds/spring-engage.m4a';
import springRelease from '../assets/sounds/spring-release.wav';
import treadmil from '../assets/sounds/treadmil-uncover.wav';
import victory from '../assets/sounds/victory.wav';


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