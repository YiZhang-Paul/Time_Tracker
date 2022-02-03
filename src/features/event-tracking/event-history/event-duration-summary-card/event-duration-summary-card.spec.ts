import { shallowMount, VueWrapper } from '@vue/test-utils';

import EventDurationSummaryCard from './event-duration-summary-card.vue';

describe('event duration summary card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(EventDurationSummaryCard);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
