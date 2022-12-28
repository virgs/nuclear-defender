export class ShadowObject extends Phaser.GameObjects.Sprite {
    private readonly lightSources: Phaser.GameObjects.Sprite[];

    constructor(scene: Phaser.Scene, x: number, y: number, lightSources: Phaser.GameObjects.Sprite[]) {
        super(scene, x, y, 'shadow-object');

        this.setOrigin(.5).setScale(10);
        this.lightSources = lightSources;
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        if (!this.lightSources) {
            return;
        }

        this.lightSources.forEach(lightSource => {
            const angle = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(
                    this.x,
                    this.y,
                    lightSource.x,
                    lightSource.y)
            );

            if (angle > 0) {
                if (angle > 110) {
                    this.setFrame(2);
                } else if (angle > 80) {
                    this.setFrame(1);
                } else {
                    this.setFrame(0);
                }
            } else {
                if (angle < -110) {
                    this.setFrame(5);
                } else if (angle < -80) {
                    this.setFrame(4);
                } else {
                    this.setFrame(3);
                }
            }
        });

    }
}