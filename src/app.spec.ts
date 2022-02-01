import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

import App from './app.vue';

describe('app unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const router = createRouter({
            history: createWebHistory(),
            routes: [{ path: '/', component: { template: '<span></span>' } }]
        });

        component = shallowMount(App, { global: { plugins: [router] } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
