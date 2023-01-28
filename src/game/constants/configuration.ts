import floorTexture from '@/game/assets/tiles/floor-texture.jpg';
import tileSheetAsset from '@/game/assets/tiles/sokoban_tilesheet.png';
import tileSheetAssetNormal from '@/game/assets/tiles/sokoban_tilessheet_normal.png';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';

const verticalPerspective = .65;
const tileHeight = 50;
const tileWidth = 40;
export const configuration = {
    frameRate: 8,
    updateCycleInMs: 175,
    floorTextureKey: 'floorTexture',
    floorTexture: floorTexture,
    tiles: { //in tile sheet
        verticalPerspective: verticalPerspective,
        verticalSize: tileHeight,
        horizontalSize: tileWidth,
        spriteSheetKey: 'tiles',
        sheetAsset: tileSheetAsset,
        sheetAssetNormal: tileSheetAssetNormal,
        tilemapKey: 'tilemap',
        layerName: 'Level',
        tilesetName: 'sokoban',
    },
    world: {
        tileSize: { //after rescaling...
            vertical: Math.trunc(tileHeight * verticalPerspective),
            horizontal: tileWidth
        },
        scaleLimits: {
            max: 1.15,
            min: .25
        },
        scale: 0,
        mapLimits: {
            lines: 20,
            rows: 25,
            features: 30
        }
    },
    screenRatio: .7,
    gameWidth: 800,
    gameHeight: 600,
    colors: {
        foregroundColor: '#d6d6d6',
        radioactive: '#d4fa00',
        controlled: '#ff3c91',
        background: '#dddddd',
        ambientColor: '#777777'
    },
    html: {
        gameScene: {}
    },
    store: {
        numberOfEnabledLevelsKey: 'numberOfEnabledLevelsKey',
        currentSelectedIndexKey: 'currentSelectedIndexKey',
        customLevelKey: 'customLevelKey',
        resolvedLevelsKey: 'resolvedLevelsKey'

    },
    solver: {
        debug: {
            metrics: false,
            iterationNumber: false,
            estimator: false
        },
        sleepForInMs: 10,
        iterationPeriodToSleep: 100,
        distanceCalculator: new ManhattanDistanceCalculator()

    }
};