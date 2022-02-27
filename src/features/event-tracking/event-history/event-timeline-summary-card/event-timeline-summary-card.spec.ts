import { shallowMount, VueWrapper } from '@vue/test-utils';

import { EventTimelineDto } from '../../../../core/dtos/event-timeline-dto';
import { EventType } from '../../../../core/enums/event-type.enum';

import EventTimelineSummaryCard from './event-timeline-summary-card.vue';

describe('event timeline summary card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const current: EventTimelineDto = {
            ...new EventTimelineDto(),
            eventType: EventType.Task,
            startTime: new Date().toISOString()
        };

        component = shallowMount(EventTimelineSummaryCard, { props: { current } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
