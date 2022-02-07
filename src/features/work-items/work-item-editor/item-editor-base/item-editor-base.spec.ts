import { shallowMount, VueWrapper } from '@vue/test-utils';

import ItemEditorBase from './item-editor-base.vue';

describe('item editor base unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(ItemEditorBase);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
