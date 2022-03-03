import { createRouter, createWebHistory } from 'vue-router';

import ViewSelector from './features/view-selector/view-selector.vue';
import WorkItems from './features/work-items/work-items.vue';
import EventHistory from './features/event-tracking/event-history/event-history.vue';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/views' },
        { path: '/views', name: 'views', component: ViewSelector },
        { path: '/works', name: 'works', component: WorkItems },
        { path: '/histories', name: 'histories', component: EventHistory }
    ]
});
