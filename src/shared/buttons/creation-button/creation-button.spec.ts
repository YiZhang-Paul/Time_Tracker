import { shallowMount, VueWrapper } from '@vue/test-utils';

import CreationButton from './creation-button.vue';

describe('creation button unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(CreationButton);

        expect(component).toBeTruthy();
    });
});
