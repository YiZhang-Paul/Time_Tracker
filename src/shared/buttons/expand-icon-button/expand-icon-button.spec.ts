import { shallowMount, VueWrapper } from '@vue/test-utils';

import ExpandIconButton from './expand-icon-button.vue';

describe('expand icon button unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(ExpandIconButton);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
