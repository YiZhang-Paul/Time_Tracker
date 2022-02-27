import { shallowMount, VueWrapper } from '@vue/test-utils';

import { EventDurationDto } from '../../../../core/dtos/event-duration-dto';
import { EventType } from '../../../../core/enums/event-type.enum';

import EventDurationSummaryCard from './event-duration-summary-card.vue';

describe('event duration summary card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const summary: EventDurationDto = { ...new EventDurationDto(), eventType: EventType.Task };
        component = shallowMount(EventDurationSummaryCard, { props: { summary } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
