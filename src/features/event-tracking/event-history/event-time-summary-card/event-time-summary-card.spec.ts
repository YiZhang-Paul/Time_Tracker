import { shallowMount, VueWrapper } from '@vue/test-utils';

import EventTimeSummaryCard from './event-time-summary-card.vue';

describe('event time summary card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(EventTimeSummaryCard);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
