import { shallowMount, VueWrapper, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { useDialogStore } from '../../stores/dialog/dialog.store';
import { useEventStore } from '../../stores/event/event.store';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { TaskItem } from '../../core/models/task/task-item';
import { InterruptionStateService } from '../../core/services/states/interruption-state/interruption-state.service';
import { TaskStateService } from '../../core/services/states/task-state/task-state.service';
import { stubInterruptionStateService } from '../../mocks/interruption-state.service.stub';
import { stubTaskStateService } from '../../mocks/task-state.service.stub';

import WorkItems from './work-items.vue';

describe('work items unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let interruptionStateStub: SinonStubbedInstance<InterruptionStateService>;
    let taskStateStub: SinonStubbedInstance<TaskStateService>;
    let dialogStore: ReturnType<typeof useDialogStore>;
    let eventStore: ReturnType<typeof useEventStore>;

    beforeEach(() => {
        interruptionStateStub = stubInterruptionStateService();
        taskStateStub = stubTaskStateService();

        container
            .rebind<InterruptionStateService>(types.InterruptionStateService)
            .toConstantValue(interruptionStateStub);

        container
            .rebind<TaskStateService>(types.TaskStateService)
            .toConstantValue(taskStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });

        expect(component).toBeTruthy();
    });

    describe('created', () => {
        test('should initialize data', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            await flushPromises();

            sinonExpect.calledOnce(interruptionStateStub.loadSummaries);
            sinonExpect.calledOnce(taskStateStub.loadSummaries);
            expect(eventStore.loadOngoingEventSummary).toHaveBeenCalledTimes(1);
        });

        test('should load active interruption item when available', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            stub(interruptionStateStub, 'activeSummary').get(() => ({ id: 1 } as InterruptionItemSummaryDto));
            stub(taskStateStub, 'activeSummary').get(() => null);
            stub(eventStore, 'isWorking').get(() => true);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(interruptionStateStub.startItemEdit, 1);
        });

        test('should load active task item when available', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            stub(interruptionStateStub, 'activeSummary').get(() => null);
            stub(taskStateStub, 'activeSummary').get(() => ({ id: 1 } as TaskItemSummaryDto));
            stub(eventStore, 'isWorking').get(() => true);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(taskStateStub.startItemEdit, 1);
        });

        test('should load first interruption item when available', async() => {
            const interruptions = [
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            const tasks = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 5 } as TaskItemSummaryDto
            ];

            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            stub(eventStore, 'isWorking').get(() => false);
            interruptionStateStub.searchSummaries.returns(interruptions);
            taskStateStub.searchSummaries.returns(tasks);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(interruptionStateStub.startItemEdit, 2);
        });

        test('should load first task item when available', async() => {
            const tasks = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 5 } as TaskItemSummaryDto
            ];

            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            stub(eventStore, 'isWorking').get(() => false);
            interruptionStateStub.searchSummaries.returns([]);
            taskStateStub.searchSummaries.returns(tasks);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(taskStateStub.startItemEdit, 1);
        });

        test('should do nothing when no item is available', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            stub(eventStore, 'isWorking').get(() => false);
            interruptionStateStub.searchSummaries.returns([]);
            taskStateStub.searchSummaries.returns([]);
            await flushPromises();

            sinonExpect.notCalled(interruptionStateStub.startItemEdit);
            sinonExpect.notCalled(taskStateStub.startItemEdit);
        });
    });

    describe('onInterruptionSelect', () => {
        test('should do nothing when item is already selected', () => {
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(1));
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 1 } as InterruptionItemSummaryDto);

            sinonExpect.notCalled(taskStateStub.stopItemEdit);
            sinonExpect.notCalled(interruptionStateStub.startItemEdit);
        });

        test('should select item when no other item is selected', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnce(taskStateStub.stopItemEdit);
            sinonExpect.calledOnceWithExactly(interruptionStateStub.startItemEdit, 2);
        });

        test('should select item when item is not already selected', () => {
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(1));
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnce(taskStateStub.stopItemEdit);
            sinonExpect.calledOnceWithExactly(interruptionStateStub.startItemEdit, 2);
        });
    });

    describe('onInterruptionCreate', () => {
        test('should not reload summaries when failed to create interruption item', async() => {
            const item = new InterruptionItem(-1);
            interruptionStateStub.createItem.resolves(false);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadSummaries.resetHistory();

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.createItem, item);
            sinonExpect.notCalled(interruptionStateStub.loadSummaries);
        });

        test('should reload summaries when successfully created interruption item', async() => {
            const item = new InterruptionItem(-1);
            interruptionStateStub.createItem.resolves(true);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadSummaries.resetHistory();

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.createItem, item);
            sinonExpect.calledOnce(interruptionStateStub.loadSummaries);
        });
    });

    describe('onInterruptionUpdate', () => {
        test('should not reload summaries when failed to update interruption item', async() => {
            const item = new InterruptionItem(1);
            interruptionStateStub.updateItem.resolves(false);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadSummaries.resetHistory();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.updateItem, item);
            sinonExpect.notCalled(interruptionStateStub.loadSummaries);
        });

        test('should reload summaries when successfully updated interruption item', async() => {
            const item = new InterruptionItem(1);
            interruptionStateStub.updateItem.resolves(true);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadSummaries.resetHistory();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.updateItem, item);
            sinonExpect.calledOnce(interruptionStateStub.loadSummaries);
        });
    });

    describe('onInterruptionDeleteStart', () => {
        test('should delete new interruption item without prompting for confirmation', () => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();

            component.vm.onInterruptionDeleteStart(new InterruptionItem(-1));

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            expect(dialogStore.open).not.toHaveBeenCalled();
        });

        test('should prompt for confirmation before deleting existing interruption item', () => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();

            component.vm.onInterruptionDeleteStart(new InterruptionItem(1));

            sinonExpect.notCalled(interruptionStateStub.stopItemEdit);
            expect(dialogStore.open).toHaveBeenCalledTimes(1);
        });

        test('should delete interruption item on confirmation', async() => {
            const item = new InterruptionItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            component.vm.onInterruptionDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.deleteItem, 5);
        });

        test('should not start idling session when failed to delete interruption item', async() => {
            const item = new InterruptionItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            dialogStore = useDialogStore();
            stub(eventStore, 'isActiveWorkItem').get(() => () => true);
            interruptionStateStub.deleteItem.resolves(false);
            component.vm.onInterruptionDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            expect(eventStore.startIdling).not.toHaveBeenCalled();
        });

        test('should not start idling session when deleted interruption item is not active', async() => {
            const item = new InterruptionItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            dialogStore = useDialogStore();
            const isActiveWorkItemStub = stub().returns(false);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            interruptionStateStub.deleteItem.resolves(true);
            component.vm.onInterruptionDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            expect(eventStore.startIdling).not.toHaveBeenCalled();
        });

        test('should start idling session when deleted interruption item is active', async() => {
            const item = new InterruptionItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            dialogStore = useDialogStore();
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            interruptionStateStub.deleteItem.resolves(true);
            component.vm.onInterruptionDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            expect(eventStore.startIdling).toHaveBeenCalledTimes(1);
        });
    });

    describe('onTaskSelect', () => {
        test('should do nothing when item is already selected', () => {
            stub(taskStateStub, 'editingItem').get(() => new TaskItem(1));
            component = shallowMount(WorkItems);

            component.vm.onTaskSelect({ id: 1 } as TaskItemSummaryDto);

            sinonExpect.notCalled(interruptionStateStub.stopItemEdit);
            sinonExpect.notCalled(taskStateStub.startItemEdit);
        });

        test('should select item when no other item is selected', () => {
            stub(taskStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItems);

            component.vm.onTaskSelect({ id: 2 } as TaskItemSummaryDto);

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            sinonExpect.calledOnceWithExactly(taskStateStub.startItemEdit, 2);
        });

        test('should select item when item is not already selected', () => {
            stub(taskStateStub, 'editingItem').get(() => new TaskItem(1));
            component = shallowMount(WorkItems);

            component.vm.onTaskSelect({ id: 2 } as TaskItemSummaryDto);

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            sinonExpect.calledOnceWithExactly(taskStateStub.startItemEdit, 2);
        });
    });

    describe('onTaskCreate', () => {
        test('should not reload summaries when failed to create task item', async() => {
            const item = new TaskItem(-1);
            taskStateStub.createItem.resolves(false);
            component = shallowMount(WorkItems);
            taskStateStub.loadSummaries.resetHistory();

            await component.vm.onTaskCreate(item);

            sinonExpect.calledOnceWithExactly(taskStateStub.createItem, item);
            sinonExpect.notCalled(taskStateStub.loadSummaries);
        });

        test('should reload summaries when successfully created task item', async() => {
            const item = new TaskItem(-1);
            taskStateStub.createItem.resolves(true);
            component = shallowMount(WorkItems);
            taskStateStub.loadSummaries.resetHistory();

            await component.vm.onTaskCreate(item);

            sinonExpect.calledOnceWithExactly(taskStateStub.createItem, item);
            sinonExpect.calledOnce(taskStateStub.loadSummaries);
        });
    });

    describe('onTaskUpdate', () => {
        test('should not reload summaries when failed to update task item', async() => {
            const item = new TaskItem(1);
            taskStateStub.updateItem.resolves(false);
            component = shallowMount(WorkItems);
            taskStateStub.loadSummaries.resetHistory();

            await component.vm.onTaskUpdate(item);

            sinonExpect.calledOnceWithExactly(taskStateStub.updateItem, item);
            sinonExpect.notCalled(taskStateStub.loadSummaries);
        });

        test('should reload summaries when successfully updated task item', async() => {
            const item = new TaskItem(1);
            taskStateStub.updateItem.resolves(true);
            component = shallowMount(WorkItems);
            taskStateStub.loadSummaries.resetHistory();

            await component.vm.onTaskUpdate(item);

            sinonExpect.calledOnceWithExactly(taskStateStub.updateItem, item);
            sinonExpect.calledOnce(taskStateStub.loadSummaries);
        });
    });

    describe('onTaskDeleteStart', () => {
        test('should delete new task item without prompting for confirmation', () => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();

            component.vm.onTaskDeleteStart(new TaskItem(-1));

            sinonExpect.calledOnce(taskStateStub.stopItemEdit);
            expect(dialogStore.open).not.toHaveBeenCalled();
        });

        test('should prompt for confirmation before deleting existing task item', () => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();

            component.vm.onTaskDeleteStart(new TaskItem(1));

            sinonExpect.notCalled(taskStateStub.stopItemEdit);
            expect(dialogStore.open).toHaveBeenCalledTimes(1);
        });

        test('should delete task item on confirmation', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnceWithExactly(taskStateStub.deleteItem, 5);
        });

        test('should not start idling session when failed to delete task item', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            dialogStore = useDialogStore();
            stub(eventStore, 'isActiveWorkItem').get(() => () => true);
            taskStateStub.deleteItem.resolves(false);
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            expect(eventStore.startIdling).not.toHaveBeenCalled();
        });

        test('should not start idling session when deleted task item is not active', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            dialogStore = useDialogStore();
            const isActiveWorkItemStub = stub().returns(false);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            taskStateStub.deleteItem.resolves(true);
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            expect(eventStore.startIdling).not.toHaveBeenCalled();
        });

        test('should start idling session when deleted task item is active', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            dialogStore = useDialogStore();
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            taskStateStub.deleteItem.resolves(true);
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            expect(eventStore.startIdling).toHaveBeenCalledTimes(1);
        });
    });
});
