import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub } from 'sinon';

import { useEventStore } from '../../../../stores/event/event.store';
import { useTaskStore } from '../../../../stores/task/task.store';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';

import TaskItemList from './task-item-list.vue';

describe('task item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let eventStore: ReturnType<typeof useEventStore>;
    let taskStore: ReturnType<typeof useTaskStore>;

    beforeEach(() => {
        component = shallowMount(TaskItemList, { global: { plugins: [createTestingPinia()] } });
        eventStore = useEventStore();
        taskStore = useTaskStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('items', () => {
        test('should return empty collection when no items available', () => {
            stub(taskStore, 'activeSummary').get(() => null);
            stub(taskStore, 'filteredSummaries').get(() => () => []);
            taskStore.$reset();

            expect(component.vm.items).toEqual([]);
        });

        test('should return items matching filter criteria', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStore, 'activeSummary').get(() => null);
            stub(taskStore, 'filteredSummaries').get(() => () => summaries);
            taskStore.$reset();

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([1, 2, 3]);
        });

        test('should include active summary item when available', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStore, 'activeSummary').get(() => ({ id: 9 } as TaskItemSummaryDto));
            stub(taskStore, 'filteredSummaries').get(() => () => summaries);
            taskStore.$reset();

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([9, 1, 2, 3]);
        });

        test('should avoid including duplicate active summary item and ensure it is always on top', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 9 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStore, 'activeSummary').get(() => ({ id: 9 } as TaskItemSummaryDto));
            stub(taskStore, 'filteredSummaries').get(() => () => summaries);
            taskStore.$reset();

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([9, 1, 3]);
        });
    });

    describe('selectedItemId', () => {
        test('should return -1 when no item selected', () => {
            taskStore.editingItem = null;

            expect(component.vm.selectedItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            taskStore.editingItem = new TaskItem(5);

            expect(component.vm.selectedItemId).toEqual(5);
        });
    });

    describe('getItemCardClasses', () => {
        test('should return correct classes', async() => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStore, 'filteredSummaries').get(() => () => summaries);
            taskStore.editingItem = new TaskItem(summaries[1].id);
            jest.useRealTimers();
            await new Promise(resolve => setTimeout(resolve, 300));

            expect(component.vm.getItemCardClasses(summaries[0]).animated).toEqual(true);
            expect(component.vm.getItemCardClasses(summaries[0]).selected).toEqual(false);
            expect(component.vm.getItemCardClasses(summaries[1]).animated).toEqual(true);
            expect(component.vm.getItemCardClasses(summaries[1]).selected).toEqual(true);
            expect(component.vm.getItemCardClasses(summaries[2]).animated).toEqual(true);
            expect(component.vm.getItemCardClasses(summaries[2]).selected).toEqual(false);
        });
    });

    describe('isActive', () => {
        test('should check correct item type', () => {
            const item = { id: 1 } as TaskItemSummaryDto;
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(taskStore, 'activeSummary').get(() => item);

            const result = component.vm.isActive(item);

            sinonExpect.calledOnceWithExactly(isActiveWorkItemStub, EventType.Task, 1);
            expect(result).toEqual(true);
        });
    });
});
