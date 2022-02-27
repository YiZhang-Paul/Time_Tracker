import { shallowMount, VueWrapper } from '@vue/test-utils';

import WorkingTimeSummary from './working-time-summary.vue';

describe('working time summary unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(WorkingTimeSummary);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
