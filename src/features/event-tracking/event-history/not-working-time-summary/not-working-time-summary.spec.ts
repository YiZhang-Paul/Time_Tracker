import { shallowMount, VueWrapper } from '@vue/test-utils';

import NotWorkingTimeSummary from './not-working-time-summary.vue';

describe('not working time summary unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(NotWorkingTimeSummary);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
