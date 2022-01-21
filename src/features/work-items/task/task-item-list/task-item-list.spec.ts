import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { useEventStore } from '../../../../stores/event/event.store';
import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TaskStateService } from '../../../../core/services/states/task-state/task-state.service';
import { stubTaskStateService } from '../../../../mocks/task-state.service.stub';

import TaskItemList from './task-item-list.vue';

describe('task item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let taskStateStub: SinonStubbedInstance<TaskStateService>;
    let eventStore: ReturnType<typeof useEventStore>;

    beforeEach(() => {
        taskStateStub = stubTaskStateService();

        container
            .rebind<TaskStateService>(types.TaskStateService)
            .toConstantValue(taskStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(TaskItemList);

        expect(component).toBeTruthy();
    });

    describe('items', () => {
        test('should return empty collection when no items available', () => {
            stub(taskStateStub, 'activeSummary').get(() => null);
            taskStateStub.searchSummaries.returns([]);
            component = shallowMount(TaskItemList);

            expect(component.vm.items).toEqual([]);
        });

        test('should return items matching filter criteria', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStateStub, 'activeSummary').get(() => null);
            taskStateStub.searchSummaries.returns(summaries);
            component = shallowMount(TaskItemList, { global: { plugins: [createTestingPinia()] } });

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([1, 2, 3]);
        });

        test('should include active summary item when available', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStateStub, 'activeSummary').get(() => ({ id: 9 } as TaskItemSummaryDto));
            taskStateStub.searchSummaries.returns(summaries);
            component = shallowMount(TaskItemList, { global: { plugins: [createTestingPinia()] } });

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([9, 1, 2, 3]);
        });

        test('should avoid including duplicate active summary item and ensure it is always on top', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 9 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStateStub, 'activeSummary').get(() => ({ id: 9 } as TaskItemSummaryDto));
            taskStateStub.searchSummaries.returns(summaries);
            component = shallowMount(TaskItemList, { global: { plugins: [createTestingPinia()] } });

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([9, 1, 3]);
        });
    });

    describe('selectedItemId', () => {
        test('should return -1 when no item selected', () => {
            stub(taskStateStub, 'editingItem').get(() => null);
            component = shallowMount(TaskItemList);

            expect(component.vm.selectedItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            stub(taskStateStub, 'editingItem').get(() => ({ id: 5 } as TaskItemSummaryDto));
            component = shallowMount(TaskItemList);

            expect(component.vm.selectedItemId).toEqual(5);
        });
    });

    describe('getItemCardClasses', () => {
        test('should return correct classes', () => {
            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            stub(taskStateStub, 'editingItem').get(() => new TaskItem(summaries[1].id));
            taskStateStub.searchSummaries.returns(summaries);
            component = shallowMount(TaskItemList, { global: { plugins: [createTestingPinia()] }, attachTo: document.body });
            jest.advanceTimersByTime(300);

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
            component = shallowMount(TaskItemList, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            stub(taskStateStub, 'activeSummary').get(() => item);
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);

            const result = component.vm.isActive(item);

            sinonExpect.calledOnceWithExactly(isActiveWorkItemStub, EventType.Task, 1);
            expect(result).toEqual(true);
        });
    });
});
