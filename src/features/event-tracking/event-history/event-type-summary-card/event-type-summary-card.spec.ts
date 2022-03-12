import { shallowMount, VueWrapper } from '@vue/test-utils';

import EventTypeSummaryCard from './event-type-summary-card.vue';

describe('event type summary card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(EventTypeSummaryCard);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
