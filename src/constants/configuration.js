import floorTexture from '../assets/tiles/floor-texture.jpg';
import tileSheetAsset from '../assets/tiles/sokoban_tilesheet.png';
import selectorTexture from '../assets/tiles/transparent-selector.png';
import thumbnailTexture from '../assets/levels/thumbnail.png';
import tileSheetAssetNormal from '../assets/tiles/sokoban_tilessheet_normal.png';
import { ManhattanDistanceCalculator } from '@/math/manhattan-distance-calculator';
const verticalPerspective = .65;
const tileHeight = 50;
const tileWidth = 40;
export const configuration = {
    frameRate: 8,
    updateCycleInMs: 175,
    floorTextureKey: 'floorTexture',
    floorTexture: floorTexture,
    selectorTextureKey: 'selectorTextureKey',
    selectorTextureFile: selectorTexture,
    thumbnailTextureKey: 'thumbNailTextureKey',
    thumbnailTextureFile: thumbnailTexture,
    tiles: {
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
        tileSize: {
            vertical: Math.trunc(tileHeight * verticalPerspective),
            horizontal: tileWidth
        },
        scaleLimits: {
            max: 1.15,
            min: .15
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
            metrics: true,
            estimator: true,
            iterationNumber: false,
        },
        sleepForInMs: 10,
        iterationPeriodToSleep: 400,
        distanceCalculator: new ManhattanDistanceCalculator()
    },
    debug: {
        mapEditorValidation: true
    }
};
