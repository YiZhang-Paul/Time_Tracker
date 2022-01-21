import { shallowMount, VueWrapper, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { useDialogStore } from '../../stores/dialog/dialog.store';
import { useEventStore } from '../../stores/event/event.store';
import { useTaskStore } from '../../stores/task/task.store';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { TaskItem } from '../../core/models/task/task-item';
import { InterruptionStateService } from '../../core/services/states/interruption-state/interruption-state.service';
import { stubInterruptionStateService } from '../../mocks/interruption-state.service.stub';

import WorkItems from './work-items.vue';

describe('work items unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let interruptionStateStub: SinonStubbedInstance<InterruptionStateService>;
    let dialogStore: ReturnType<typeof useDialogStore>;
    let eventStore: ReturnType<typeof useEventStore>;
    let taskStore: ReturnType<typeof useTaskStore>;

    beforeEach(() => {
        interruptionStateStub = stubInterruptionStateService();

        container
            .rebind<InterruptionStateService>(types.InterruptionStateService)
            .toConstantValue(interruptionStateStub);
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
            taskStore = useTaskStore();
            await flushPromises();

            sinonExpect.calledOnce(interruptionStateStub.loadSummaries);
            expect(eventStore.loadOngoingEventSummary).toHaveBeenCalledTimes(1);
            expect(taskStore.loadSummaries).toHaveBeenCalledTimes(1);
        });

        test('should load active interruption item when available', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            taskStore = useTaskStore();
            stub(interruptionStateStub, 'activeSummary').get(() => ({ id: 1 } as InterruptionItemSummaryDto));
            stub(taskStore, 'activeSummary').get(() => null);
            stub(eventStore, 'isWorking').get(() => true);
            taskStore.$reset();
            await flushPromises();

            sinonExpect.calledOnceWithExactly(interruptionStateStub.startItemEdit, 1);
        });

        test('should load active task item when available', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            taskStore = useTaskStore();
            stub(interruptionStateStub, 'activeSummary').get(() => null);
            stub(taskStore, 'activeSummary').get(() => ({ id: 1 } as TaskItemSummaryDto));
            stub(eventStore, 'isWorking').get(() => true);
            taskStore.$reset();
            await flushPromises();

            expect(taskStore.startItemEdit).toHaveBeenCalledTimes(1);
            expect(taskStore.startItemEdit).toHaveBeenCalledWith(1);
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
            taskStore = useTaskStore();
            stub(eventStore, 'isWorking').get(() => false);
            stub(taskStore, 'filteredSummaries').get(() => () => tasks);
            interruptionStateStub.searchSummaries.returns(interruptions);
            taskStore.$reset();
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
            taskStore = useTaskStore();
            stub(eventStore, 'isWorking').get(() => false);
            stub(taskStore, 'filteredSummaries').get(() => () => tasks);
            const startTaskItemEditStub = stub(taskStore, 'startItemEdit');
            interruptionStateStub.searchSummaries.returns([]);
            taskStore.$reset();
            await flushPromises();

            sinonExpect.calledOnceWithExactly(startTaskItemEditStub, 1);
        });

        test('should do nothing when no item is available', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            taskStore = useTaskStore();
            stub(eventStore, 'isWorking').get(() => false);
            stub(taskStore, 'filteredSummaries').get(() => () => []);
            const startTaskItemEditStub = stub(taskStore, 'startItemEdit');
            interruptionStateStub.searchSummaries.returns([]);
            taskStore.$reset();
            await flushPromises();

            sinonExpect.notCalled(interruptionStateStub.startItemEdit);
            sinonExpect.notCalled(startTaskItemEditStub);
        });
    });

    describe('onInterruptionSelect', () => {
        test('should do nothing when item is already selected', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(1));
            await flushPromises();

            component.vm.onInterruptionSelect({ id: 1 } as InterruptionItemSummaryDto);

            sinonExpect.notCalled(interruptionStateStub.startItemEdit);
            expect(taskStore.stopItemEdit).not.toHaveBeenCalled();
        });

        test('should select item when no other item is selected', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            stub(interruptionStateStub, 'editingItem').get(() => null);
            await flushPromises();

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.startItemEdit, 2);
            expect(taskStore.stopItemEdit).toHaveBeenCalledTimes(1);
        });

        test('should select item when item is not already selected', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(1));
            await flushPromises();

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.startItemEdit, 2);
            expect(taskStore.stopItemEdit).toHaveBeenCalledTimes(1);
        });
    });

    describe('onInterruptionCreate', () => {
        test('should not reload summaries when failed to create interruption item', async() => {
            const item = new InterruptionItem(-1);
            interruptionStateStub.createItem.resolves(false);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadSummaries.resetHistory();
            await flushPromises();

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.createItem, item);
            sinonExpect.notCalled(interruptionStateStub.loadSummaries);
        });

        test('should reload summaries when successfully created interruption item', async() => {
            const item = new InterruptionItem(-1);
            interruptionStateStub.createItem.resolves(true);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadSummaries.resetHistory();
            await flushPromises();

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
            await flushPromises();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.updateItem, item);
            sinonExpect.notCalled(interruptionStateStub.loadSummaries);
        });

        test('should reload summaries when successfully updated interruption item', async() => {
            const item = new InterruptionItem(1);
            interruptionStateStub.updateItem.resolves(true);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadSummaries.resetHistory();
            await flushPromises();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.updateItem, item);
            sinonExpect.calledOnce(interruptionStateStub.loadSummaries);
        });
    });

    describe('onInterruptionDeleteStart', () => {
        test('should delete new interruption item without prompting for confirmation', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            await flushPromises();

            component.vm.onInterruptionDeleteStart(new InterruptionItem(-1));

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            expect(dialogStore.open).not.toHaveBeenCalled();
        });

        test('should prompt for confirmation before deleting existing interruption item', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            await flushPromises();

            component.vm.onInterruptionDeleteStart(new InterruptionItem(1));

            sinonExpect.notCalled(interruptionStateStub.stopItemEdit);
            expect(dialogStore.open).toHaveBeenCalledTimes(1);
        });

        test('should delete interruption item on confirmation', async() => {
            const item = new InterruptionItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            await flushPromises();
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
            await flushPromises();
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
            await flushPromises();
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
            await flushPromises();
            component.vm.onInterruptionDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            expect(eventStore.startIdling).toHaveBeenCalledTimes(1);
        });
    });

    describe('onTaskSelect', () => {
        test('should do nothing when item is already selected', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            stub(taskStore, 'editingItem').get(() => new TaskItem(1));
            await flushPromises();

            component.vm.onTaskSelect({ id: 1 } as TaskItemSummaryDto);

            sinonExpect.notCalled(interruptionStateStub.stopItemEdit);
            expect(taskStore.startItemEdit).not.toHaveBeenCalled();
        });

        test('should select item when no other item is selected', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            stub(taskStore, 'editingItem').get(() => null);
            await flushPromises();

            component.vm.onTaskSelect({ id: 2 } as TaskItemSummaryDto);

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            expect(taskStore.startItemEdit).toHaveBeenCalledTimes(1);
            expect(taskStore.startItemEdit).toHaveBeenCalledWith(2);
        });

        test('should select item when item is not already selected', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            stub(taskStore, 'editingItem').get(() => new TaskItem(1));
            component = shallowMount(WorkItems);
            await flushPromises();

            component.vm.onTaskSelect({ id: 2 } as TaskItemSummaryDto);

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            expect(taskStore.startItemEdit).toHaveBeenCalledTimes(1);
            expect(taskStore.startItemEdit).toHaveBeenCalledWith(2);
        });
    });

    describe('onTaskCreate', () => {
        test('should not reload summaries when failed to create task item', async() => {
            const item = new TaskItem(-1);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            const createItemStub = stub(taskStore, 'createItem').resolves(false);
            const loadSummariesStub = stub(taskStore, 'loadSummaries');
            await flushPromises();

            await component.vm.onTaskCreate(item);

            sinonExpect.calledOnceWithExactly(createItemStub, item);
            sinonExpect.notCalled(loadSummariesStub);
        });

        test('should reload summaries when successfully created task item', async() => {
            const item = new TaskItem(-1);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            const createItemStub = stub(taskStore, 'createItem').resolves(true);
            const loadSummariesStub = stub(taskStore, 'loadSummaries');
            await flushPromises();

            await component.vm.onTaskCreate(item);

            sinonExpect.calledOnceWithExactly(createItemStub, item);
            sinonExpect.calledOnce(loadSummariesStub);
        });
    });

    describe('onTaskUpdate', () => {
        test('should not reload summaries when failed to update task item', async() => {
            const item = new TaskItem(1);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            const updateItemStub = stub(taskStore, 'updateItem').resolves(false);
            const loadSummariesStub = stub(taskStore, 'loadSummaries');
            await flushPromises();

            await component.vm.onTaskUpdate(item);

            sinonExpect.calledOnceWithExactly(updateItemStub, item);
            sinonExpect.notCalled(loadSummariesStub);
        });

        test('should reload summaries when successfully updated task item', async() => {
            const item = new TaskItem(1);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            const updateItemStub = stub(taskStore, 'updateItem').resolves(true);
            const loadSummariesStub = stub(taskStore, 'loadSummaries');
            await flushPromises();

            await component.vm.onTaskUpdate(item);

            sinonExpect.calledOnceWithExactly(updateItemStub, item);
            sinonExpect.calledOnce(loadSummariesStub);
        });
    });

    describe('onTaskDeleteStart', () => {
        test('should delete new task item without prompting for confirmation', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            taskStore = useTaskStore();
            const stopItemEditStub = stub(taskStore, 'stopItemEdit');
            await flushPromises();

            component.vm.onTaskDeleteStart(new TaskItem(-1));

            sinonExpect.calledOnce(stopItemEditStub);
            expect(dialogStore.open).not.toHaveBeenCalled();
        });

        test('should prompt for confirmation before deleting existing task item', async() => {
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            taskStore = useTaskStore();
            const stopItemEditStub = stub(taskStore, 'stopItemEdit');
            await flushPromises();

            component.vm.onTaskDeleteStart(new TaskItem(1));

            sinonExpect.notCalled(stopItemEditStub);
            expect(dialogStore.open).toHaveBeenCalledTimes(1);
        });

        test('should delete task item on confirmation', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            taskStore = useTaskStore();
            const deleteItemStub = stub(taskStore, 'deleteItem');
            await flushPromises();
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnceWithExactly(deleteItemStub, 5);
        });

        test('should not start idling session when failed to delete task item', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            eventStore = useEventStore();
            dialogStore = useDialogStore();
            taskStore = useTaskStore();
            stub(eventStore, 'isActiveWorkItem').get(() => () => true);
            stub(taskStore, 'deleteItem').resolves(false);
            await flushPromises();
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            expect(eventStore.startIdling).not.toHaveBeenCalled();
        });

        test('should not start idling session when deleted task item is not active', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            eventStore = useEventStore();
            taskStore = useTaskStore();
            const isActiveWorkItemStub = stub().returns(false);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(taskStore, 'deleteItem').resolves(true);
            await flushPromises();
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            expect(eventStore.startIdling).not.toHaveBeenCalled();
        });

        test('should start idling session when deleted task item is active', async() => {
            const item = new TaskItem(5);
            component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            eventStore = useEventStore();
            taskStore = useTaskStore();
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(taskStore, 'deleteItem').resolves(true);
            await flushPromises();
            component.vm.onTaskDeleteStart(item);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            expect(eventStore.startIdling).toHaveBeenCalledTimes(1);
        });
    });
});
