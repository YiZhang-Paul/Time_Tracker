import { shallowMount, VueWrapper } from '@vue/test-utils';

import ShowCasePanel from './show-case-panel.vue';

describe('show case panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(ShowCasePanel);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
