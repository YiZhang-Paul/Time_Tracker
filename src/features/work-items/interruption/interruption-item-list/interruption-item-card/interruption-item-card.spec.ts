import { shallowMount, VueWrapper } from '@vue/test-utils';

import { InterruptionItemSummaryDto } from '../../../../../core/dtos/interruption-item-summary-dto';

import InterruptionItemCard from './interruption-item-card.vue';

describe('interruption item card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const item = new InterruptionItemSummaryDto();
        component = shallowMount(InterruptionItemCard, { props: { item } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
