import { shallowMount, VueWrapper } from '@vue/test-utils';

import DailyGoalSummary from './daily-goal-summary.vue';

describe('daily goal summary unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(DailyGoalSummary);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
