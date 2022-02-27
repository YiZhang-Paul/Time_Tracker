import { shallowMount, VueWrapper } from '@vue/test-utils';

import TooltipPanel from './tooltip-panel.vue';

describe('tooltip panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(TooltipPanel);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
