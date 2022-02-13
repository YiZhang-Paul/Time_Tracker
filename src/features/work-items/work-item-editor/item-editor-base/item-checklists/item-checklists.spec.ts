import { shallowMount, VueWrapper } from '@vue/test-utils';

import ItemChecklists from './item-checklists.vue';

describe('item checklists unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(ItemChecklists);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
