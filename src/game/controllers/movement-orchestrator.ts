import {Point} from '../math/point';
import {Tiles} from '../tiles/tiles';
import type {Actions} from '../constants/actions';
import type {Directions} from '../constants/directions';
import {SpringMovementHandler} from '@/game/controllers/spring-movement-handler';
import type {FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';
import type {OrientedTile, StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import {HeroMovementHandler} from '@/game/controllers/hero-movement-handler';

export type Movement = {
    currentPosition: Point,
    nextPosition: Point,
    isCurrentlyOnTarget: boolean,
    isCurrentlyOnSpring: boolean,
    direction: Directions | undefined
};

export type OrientedPoint = {
    point: Point,
    orientation: Directions
}

export type MovementCoordinatorOutput = {
    mapChanged: boolean;
    boxes: Movement[];
    hero: Movement;
};

export type MovementCoordinatorInput = {
    heroAction: Actions;
};

export class MovementOrchestrator {
    private readonly blockerTiles: Set<Tiles> = new Set<Tiles>([Tiles.box, Tiles.wall, Tiles.empty]);

    private readonly staticMap: StaticMap;
    private readonly hero: Movement;
    private readonly boxes: Movement[];
    private readonly movementHandlers: FeatureMovementHandler[] = [];

    constructor(config: { boxes: Point[]; staticMap: StaticMap; hero: Point }) {
        this.staticMap = config.staticMap;
        this.hero = this.initializeFeature(config.hero);
        this.boxes = config.boxes
            .map(box => this.initializeFeature(box));
        this.movementHandlers.push(new HeroMovementHandler({coordinator: this, position: this.hero.nextPosition}));
        this.movementHandlers.push(...this.findTiles(Tiles.spring)
            .map(feature =>
                new SpringMovementHandler({
                    spring: feature,
                    coordinator: this
                })));
    }

    private initializeFeature(point: Point): Movement {
        return {
            currentPosition: point,
            nextPosition: point,
            isCurrentlyOnTarget: this.getFeatureAtPosition(point)
                .some(feature => feature.code === Tiles.target),
            isCurrentlyOnSpring: this.getFeatureAtPosition(point)
                .some(feature => feature.code === Tiles.spring),
            direction: undefined
        };
    }

    public moveHero(direction: Directions): void {
        this.moveFeature(this.hero, direction);
    }

    public moveFeature(movement: Movement, direction: Directions) {
        movement.direction = direction;
        movement.currentPosition = movement.nextPosition;
        movement.nextPosition = movement.currentPosition.calculateOffset(direction);
        movement.isCurrentlyOnTarget = this.getFeatureAtPosition(movement.nextPosition)
            .some(feature => feature.code === Tiles.target);
        movement.isCurrentlyOnSpring = this.getFeatureAtPosition(movement.nextPosition)
            .some(feature => feature.code === Tiles.spring);
    }

    public async update(input: MovementCoordinatorInput): Promise<MovementCoordinatorOutput> {
        this.hero.currentPosition = this.hero.nextPosition;
        this.boxes
            .forEach(box => box.currentPosition = box.nextPosition);

        let mapChanged = false;
        for (let i = 0; i < this.movementHandlers.length; ++i) {
            mapChanged = await this.movementHandlers[i]
                .act({hero: {action: input.heroAction, position: this.hero.nextPosition}}) || mapChanged;
        }

        return {
            hero: this.hero,
            boxes: this.boxes,
            mapChanged: true
        };
    }

    public getBoxes(): Movement[] {
        return this.boxes;
    }

    public canFeatureLeavePosition(move: OrientedPoint): boolean {
        const positionFeatures = this.getFeatureAtPosition(move.point);
        const featureMovementHandlers = this.movementHandlers
            .filter(handler => positionFeatures
                .some(feature =>
                    feature.code === handler.getTile() &&
                    move.point.isEqualTo(handler.getPosition())));
        return featureMovementHandlers
            .every(handler => handler.allowLeavingMovement(move.orientation));
    }

    public canFeatureEnterPosition(move: OrientedPoint): boolean {
        const positionFeatures = this.getFeatureAtPosition(move.point);
        if (positionFeatures
            .some(feature => this.blockerTiles.has(feature.code))) {
            return false;
        }
        if (this.movementHandlers
            .filter(handler => positionFeatures
                .some(feature => feature.code === handler.getTile() && move.point.isEqualTo(handler.getPosition())))
            .every(handler => handler.allowEnteringMovement(move.orientation))) {
            return true;
        }
        return false;
    }

    public getFeatureAtPosition(position: Point): OrientedTile[] {
        const result: OrientedTile[] = [];
        if (this.hero?.nextPosition.isEqualTo(position)) {
            result.push({
                code: Tiles.hero,
                orientation: undefined
            });
        }
        if (this.boxes
            ?.some(box => box.nextPosition.isEqualTo(position))) {
            result.push({
                code: Tiles.box,
                orientation: undefined
            });
        }
        if (position.x < this.staticMap.width && position.y < this.staticMap.height
            && position.x >= 0 && position.y >= 0) {
            result.push(this.staticMap.tiles[position.y][position.x]);
        }
        return result;
    }

    private findTiles(code: Tiles): OrientedPoint[] {
        const orientedPoints: OrientedPoint[] = [];
        this.staticMap.tiles
            .forEach((line, y) => line
                .forEach((tile, x) => {
                    if (tile.code === code) {
                        orientedPoints.push({point: new Point(x, y), orientation: tile.orientation!});
                    }
                }));
        return orientedPoints;
    }
}