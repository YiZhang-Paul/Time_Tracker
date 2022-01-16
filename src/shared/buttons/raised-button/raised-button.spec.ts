import { shallowMount, VueWrapper } from '@vue/test-utils';

import RaisedButton from './raised-button.vue';

describe('raised button unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(RaisedButton);

        expect(component).toBeTruthy();
    });
});
