import { shallowMount, VueWrapper } from '@vue/test-utils';

import HistoriesViewSelector from './histories-view-selector.vue';

describe('histories view selector unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(HistoriesViewSelector);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
