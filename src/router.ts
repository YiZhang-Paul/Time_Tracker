import { createRouter, createWebHistory } from 'vue-router';

import { useUserStore } from './stores/user/user.store';
import Login from './features/login/login.vue';
import ViewSelector from './features/view-selector/view-selector.vue';
import WorkItems from './features/work-items/work-items.vue';
import EventHistory from './features/event-tracking/event-history/event-history.vue';
import Settings from './features/settings/settings.vue';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/views' },
        { path: '/login', name: 'login', component: Login },
        { path: '/views', name: 'views', component: ViewSelector },
        { path: '/works', name: 'works', component: WorkItems },
        { path: '/histories', name: 'histories', component: EventHistory },
        { path: '/settings', name: 'settings', component: Settings }
    ]
});

router.beforeEach(async to => {
    const userStore = useUserStore();

    if (to.name === 'login' || userStore.isLoggedIn) {
        return true;
    }

    await userStore.silentSignIn();

    if (!userStore.isLoggedIn) {
        router.push('/login');

        return false;
    }
});
