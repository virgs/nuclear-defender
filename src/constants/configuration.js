// import floorTexture from '../assets/tiles/floor-texture.jpg';
import floorTexture from '../assets/tiles/floor_texture.jpg'; //Pinto's
import tileSheetAsset from '../assets/tiles/sokoban_tilesheet.png';
import wallSheetAsset from '../assets/tiles/wall_sprites.png';
import selectorTexture from '../assets/tiles/transparent-selector.png';
import thumbnailTexture from '../assets/levels/thumbnail.png';
import tileSheetAssetNormal from '../assets/tiles/sokoban_tilessheet_normal.png';
import { ManhattanDistanceCalculator } from '@/math/manhattan-distance-calculator';
const verticalPerspective = .79; //cos(perspective-angle) it should be .8, however, due to rounding stuff, it makes a small pixel line between some sprites
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
        wallSheetKey: 'wallSheetKey',
        wallSheetAsset: wallSheetAsset,
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
            lines: 15,
            rows: 15,
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
        ambientColor: '#BBBBBB'
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
        sleepForInMs: 10,
        iterationPeriodToSleep: 400,
        distanceCalculator: new ManhattanDistanceCalculator(),
        distanceToTheClosestBox: false
    },
    debug: {
        mapEditorValidation: false,
        solver: {
            metrics: true,
            estimator: true,
            iterationNumber: false,
        },
    }
};
