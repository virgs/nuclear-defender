import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath, URL} from 'node:url';

// https://www.youtube.com/watch?v=yo2bMGnIKE8
// https://dev.to/shashannkbawa/deploying-vite-app-to-github-pages-3ane
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    assetsInclude: ["**/*.m4a"],
    base: "/chernobyl-defender",
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            vue: 'vue/dist/vue.esm-bundler.js',

        },
    }
});
