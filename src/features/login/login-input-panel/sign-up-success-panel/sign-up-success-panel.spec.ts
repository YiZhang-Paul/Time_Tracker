import { shallowMount, VueWrapper } from '@vue/test-utils';

import SignUpSuccessPanel from './sign-up-success-panel.vue';

describe('sign up success panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(SignUpSuccessPanel);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
