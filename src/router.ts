import { createRouter, createWebHistory } from 'vue-router';

import WorkItems from './features/work-items/work-items.vue';
import EventHistory from './features/event-tracking/event-history/event-history.vue';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/work-items' },
        { path: '/work-items', component: WorkItems },
        { path: '/histories', component: EventHistory }
    ]
});
