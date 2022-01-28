import { nextTick } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub } from 'sinon';

import { useEventStore } from '../../../../stores/event/event.store';
import { useTaskStore } from '../../../../stores/task/task.store';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import OverlayScrollbarPanel from '../../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import TaskItemList from './task-item-list.vue';

describe('task item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let eventStore: ReturnType<typeof useEventStore>;
    let taskStore: ReturnType<typeof useTaskStore>;

    beforeEach(() => {
        component = shallowMount(TaskItemList, {
            global: {
                plugins: [createTestingPinia()],
                stubs: { 'overlay-scrollbar-panel': OverlayScrollbarPanel }
            }
        });

        eventStore = useEventStore();
        taskStore = useTaskStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('totalItems', () => {
        test('should be hidden when no task item exists', async() => {
            stub(taskStore, 'filteredSummaries').get(() => () => []);
            await component.setProps({ searchText: null });

            expect(component.find('.list-counter').exists()).toEqual(false);
        });

        test('should display total task items', async() => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStore, 'filteredSummaries').get(() => () => summaries);
            taskStore.$reset();
            await nextTick();

            expect(component.find('.list-counter').text()).toEqual('3 tasks');
        });

        test('should handle singular form', async() => {
            stub(taskStore, 'filteredSummaries').get(() => () => [{ id: 1 } as TaskItemSummaryDto]);
            taskStore.$reset();
            await nextTick();

            expect(component.find('.list-counter').text()).toEqual('1 task');
        });
    });

    describe('items', () => {
        test('should properly transform search text', async() => {
            const filteredSummariesStub = stub().returns([]);
            stub(taskStore, 'filteredSummaries').get(() => filteredSummariesStub);
            await component.setProps({ searchText: ' SEARCH_TEXT ' });

            sinonExpect.calledOnceWithExactly(filteredSummariesStub, 'search_text');
        });

        test('should properly handle invalid search text', async() => {
            const filteredSummariesStub = stub().returns([]);
            stub(taskStore, 'filteredSummaries').get(() => filteredSummariesStub);
            await component.setProps({ searchText: null });

            sinonExpect.calledOnceWithExactly(filteredSummariesStub, '');
        });

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

        test('should exclude active summary item', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStore, 'activeSummary').get(() => ({ id: 2 } as TaskItemSummaryDto));
            stub(taskStore, 'filteredSummaries').get(() => () => summaries);
            taskStore.$reset();

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([1, 3]);
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
            component.vm.$options.watch.items.call(component.vm);
            jest.advanceTimersByTime(300);
            await nextTick();

            let elements = component.findAll('.task-item-card');

            expect(elements.length).toEqual(3);
            expect(elements[0].classes()).toContain('animated');
            expect(elements[0].classes()).not.toContain('selected');
            expect(elements[1].classes()).toContain('animated');
            expect(elements[1].classes()).toContain('selected');
            expect(elements[2].classes()).toContain('animated');
            expect(elements[2].classes()).not.toContain('selected');

            summaries.push({ id: 4 } as TaskItemSummaryDto);
            taskStore.editingItem = new TaskItem(summaries[3].id);
            component.vm.$options.watch.items.call(component.vm);
            jest.advanceTimersByTime(300);
            await nextTick();

            elements = component.findAll('.task-item-card');

            expect(elements.length).toEqual(4);
            expect(elements[0].classes()).toContain('animated');
            expect(elements[0].classes()).not.toContain('selected');
            expect(elements[1].classes()).toContain('animated');
            expect(elements[1].classes()).not.toContain('selected');
            expect(elements[2].classes()).toContain('animated');
            expect(elements[2].classes()).not.toContain('selected');
            expect(elements[3].classes()).toContain('animated');
            expect(elements[3].classes()).toContain('selected');
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
