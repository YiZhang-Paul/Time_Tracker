import { shallowMount, VueWrapper } from '@vue/test-utils';

import { EventSelection } from '../../../../../core/models/event/event-selection';
import { EventType } from '../../../../../core/enums/event-type.enum';

import EventSelector from './event-selector.vue';

describe('event selector unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const selected = new EventSelection(-1, EventType.Idling, '');
        component = shallowMount(EventSelector, { props: { selected } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
