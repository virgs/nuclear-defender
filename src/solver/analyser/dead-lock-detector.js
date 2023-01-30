//http://sokobano.de/wiki/index.php?title=Sokoban_solver_%22scribbles%22_by_Brian_Damgaard_about_the_YASS_solver
export class DeadLockDetector {
    staticMap;
    constructor(config) {
        this.staticMap = config.strippedStaticMapMap;
    }
    getStaticFeaturesAtPosition(position) {
        if (position.x < this.staticMap.width && position.y < this.staticMap.height
            && position.x >= 0 && position.y >= 0) {
            return this.staticMap.strippedFeatureLayeredMatrix[position.y][position.x];
        }
        return [];
    }
}
