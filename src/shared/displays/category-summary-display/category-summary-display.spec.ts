import { shallowMount, VueWrapper } from '@vue/test-utils';

import CategorySummaryDisplay from './category-summary-display.vue';

describe('category summary display unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(CategorySummaryDisplay);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
