import { shallowMount, VueWrapper } from '@vue/test-utils';

import FlatButton from './flat-button.vue';

describe('flat button unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(FlatButton);
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
