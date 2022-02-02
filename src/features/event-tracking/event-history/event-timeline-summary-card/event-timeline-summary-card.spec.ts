import { shallowMount, VueWrapper } from '@vue/test-utils';

import EventTimelineSummaryCard from './event-timeline-summary-card.vue';

describe('event timeline summary card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(EventTimelineSummaryCard);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
