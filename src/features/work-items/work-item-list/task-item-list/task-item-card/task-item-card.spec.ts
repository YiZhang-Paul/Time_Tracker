import { shallowMount, VueWrapper } from '@vue/test-utils';

import { TaskItemSummaryDto } from '../../../../../core/dtos/task-item-summary-dto';

import TaskItemCard from './task-item-card.vue';

describe('task item card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(TaskItemCard, { props: { item: new TaskItemSummaryDto() } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
