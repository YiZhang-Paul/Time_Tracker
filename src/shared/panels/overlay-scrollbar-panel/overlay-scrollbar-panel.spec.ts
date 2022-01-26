import { shallowMount, VueWrapper } from '@vue/test-utils';

import OverlayScrollbarPanel from './overlay-scrollbar-panel.vue';

describe('overlay scrollbar panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(OverlayScrollbarPanel);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
