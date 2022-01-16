import { shallowMount, VueWrapper } from '@vue/test-utils';

import { InterruptionItemSummaryDto } from '../../../../../core/dtos/interruption-item-summary-dto';

import InterruptionItemCard from './interruption-item-card.vue';

describe('interruption item card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        const item = new InterruptionItemSummaryDto();
        component = shallowMount(InterruptionItemCard, { props: { item } });

        expect(component).toBeTruthy();
    });
});
