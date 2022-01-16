import { shallowMount, VueWrapper } from '@vue/test-utils';

import App from './app.vue';

describe('app unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(App);

        expect(component).toBeTruthy();
    });
});
