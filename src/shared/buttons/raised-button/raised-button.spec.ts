import { shallowMount, VueWrapper } from '@vue/test-utils';

import RaisedButton from './raised-button.vue';

describe('raised button unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(RaisedButton);
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
