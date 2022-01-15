import { shallowMount, VueWrapper } from '@vue/test-utils';

import { TaskItemSummaryDto } from '../../../../../core/dtos/task-item-summary-dto';

import TaskItemCard from './task-item-card.vue';

describe('task item card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const item = new TaskItemSummaryDto();
        component = shallowMount(TaskItemCard, { props: { item } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
