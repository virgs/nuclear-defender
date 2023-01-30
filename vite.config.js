import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath, URL} from 'node:url';

export default defineConfig(
    {
        plugins: [vue()],
        base: "/nuclear-defender",
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
                vue: 'vue/dist/vue.esm-bundler.js',

            },
        },
        assetsInclude: ["**/*.m4a"],
        build: {
            // Do not inline images and assets to avoid the phaser error
            // "Local data URIs are not supported"
            assetsInlineLimit: 0,
            outDir: 'docs'
        },
    })