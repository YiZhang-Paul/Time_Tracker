import { shallowMount, VueWrapper } from '@vue/test-utils';

import DialogPanel from './dialog-panel.vue';

describe('dialog panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(DialogPanel);

        expect(component).toBeTruthy();
    });
});
