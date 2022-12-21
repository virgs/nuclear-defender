import GameView from '../views/GameView.vue';
import SplashScreenView from '../views/SplashScreenView.vue';
import {createRouter, createWebHistory} from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/splash',
            component: SplashScreenView,
            meta: {transition: 'slide-left'}
        },
        {
            path: '/game',
            name: 'game',
            component: GameView,
            meta: {transition: 'slide-left'},
        }
    ],
});

export default router;
