import GameView from '../views/GameView.vue';
import NextLevelView from '../views/NextLevelView.vue';
import SplashScreenView from '../views/SplashScreenView.vue';
import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: SplashScreenView,
            meta: { transition: 'slide-left' }
        },
        {
            path: '/game',
            component: GameView,
            meta: { transition: 'slide-left' },
        },
        {
            path: '/next-level',
            component: NextLevelView,
            meta: { transition: 'slide-left' },
            props: true
        }
    ],
});
export default router;
