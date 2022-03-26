import { shallowMount, VueWrapper } from '@vue/test-utils';

import UnverifiedNoticePanel from './unverified-notice-panel.vue';

describe('unverified notice panel unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(UnverifiedNoticePanel);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
