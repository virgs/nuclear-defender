import Phaser from 'phaser';

import WebFontLoader from 'webfontloader';

export default class WebFontFileLoader extends Phaser.Loader.File {
    private readonly fontNames: string[] = [];
    private readonly service: string = '';

    constructor(loader: Phaser.Loader.LoaderPlugin, service: string, fontNames: string | string[]) {
        super(loader, {
            type: 'webfont',
            key: fontNames.toString()
        });

        this.service = service;
        this.fontNames = Array.isArray(fontNames) ? fontNames : [fontNames];
    }

    load() {
        const config = {
            active: () => {
                this.loader.nextFile(this, true);
            }
        };

        switch (this.service) {
            case 'google':
                config['google'] = {
                    families: this.fontNames
                };
                break;

            default:
                throw new Error('Unsupported font service');
        }

        WebFontLoader.load(config);
    }
}