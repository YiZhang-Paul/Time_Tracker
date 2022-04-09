import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { useUserStore } from '../../../../stores/user/user.store';
import { SignInResponse } from '../../../../core/models/authentication/sign-in-response';
import { UserProfile } from '../../../../core/models/user/user-profile';

import DailyGoalSummary from './daily-goal-summary.vue';

describe('daily goal summary unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const pinia = createTestingPinia();
        useUserStore().signInResponse = { profile: new UserProfile() } as SignInResponse;
        component = shallowMount(DailyGoalSummary, { global: { plugins: [pinia] } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
