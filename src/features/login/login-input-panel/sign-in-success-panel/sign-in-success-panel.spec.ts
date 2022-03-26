import { shallowMount, VueWrapper } from '@vue/test-utils';

import SignInSuccessPanel from './sign-in-success-panel.vue';

describe('sign in success panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(SignInSuccessPanel);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
