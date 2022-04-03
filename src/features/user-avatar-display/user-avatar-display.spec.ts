import { shallowMount, VueWrapper } from '@vue/test-utils';

import UserAvatarDisplay from './user-avatar-display.vue';

describe('user avatar display unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(UserAvatarDisplay);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
