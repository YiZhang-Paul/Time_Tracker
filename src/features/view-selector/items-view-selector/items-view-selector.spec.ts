import { shallowMount, VueWrapper } from '@vue/test-utils';

import ItemsViewSelector from './items-view-selector.vue';

describe('items view selector unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(ItemsViewSelector);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
