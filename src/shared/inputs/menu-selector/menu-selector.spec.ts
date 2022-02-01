import { shallowMount, VueWrapper } from '@vue/test-utils';

import MenuSelector from './menu-selector.vue';

describe('menu selector unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(MenuSelector);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
