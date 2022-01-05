import { shallowMount, VueWrapper } from '@vue/test-utils';

import DialogPanel from './dialog-panel.vue';

describe('dialog panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(DialogPanel);
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
