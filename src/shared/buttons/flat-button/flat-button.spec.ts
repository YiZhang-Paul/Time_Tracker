import { shallowMount, VueWrapper } from '@vue/test-utils';

import FlatButton from './flat-button.vue';

describe('flat button unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(FlatButton);

        expect(component).toBeTruthy();
    });
});
