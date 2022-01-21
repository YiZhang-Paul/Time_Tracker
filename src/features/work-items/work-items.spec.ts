import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, spy, stub } from 'sinon';

import { useDialogStore } from '../../stores/dialog/dialog.store';
import { useEventStore } from '../../stores/event/event.store';
import { useInterruptionStore } from '../../stores/interruption/interruption.store';
import { useTaskStore } from '../../stores/task/task.store';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { TaskItem } from '../../core/models/task/task-item';

import WorkItems from './work-items.vue';

describe('work items unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let dialogStore: ReturnType<typeof useDialogStore>;
    let eventStore: ReturnType<typeof useEventStore>;
    let interruptionStore: ReturnType<typeof useInterruptionStore>;
    let taskStore: ReturnType<typeof useTaskStore>;

    beforeEach(() => {
        component = shallowMount(WorkItems, { global: { plugins: [createTestingPinia()] } });
        dialogStore = useDialogStore();
        eventStore = useEventStore();
        interruptionStore = useInterruptionStore();
        taskStore = useTaskStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('initialize', () => {
        test('should initialize data', async() => {
            const loadOngoingEventSummarySpy = spy(eventStore, 'loadOngoingEventSummary');
            const loadInterruptionSummariesSpy = spy(interruptionStore, 'loadSummaries');
            const loadTaskSummariesSpy = spy(taskStore, 'loadSummaries');

            await component.vm.initialize();

            sinonExpect.calledOnce(loadOngoingEventSummarySpy);
            sinonExpect.calledOnce(loadInterruptionSummariesSpy);
            sinonExpect.calledOnce(loadTaskSummariesSpy);
        });

        test('should load active interruption item when available', async() => {
            const startItemEditSpy = spy(interruptionStore, 'startItemEdit');
            stub(eventStore, 'isWorking').get(() => true);
            stub(interruptionStore, 'activeSummary').get(() => ({ id: 1 } as InterruptionItemSummaryDto));
            stub(taskStore, 'activeSummary').get(() => null);
            taskStore.$reset();

            await component.vm.initialize();

            sinonExpect.calledOnceWithExactly(startItemEditSpy, 1);
        });

        test('should load active task item when available', async() => {
            const startItemEditSpy = spy(taskStore, 'startItemEdit');
            stub(eventStore, 'isWorking').get(() => true);
            stub(interruptionStore, 'activeSummary').get(() => null);
            stub(taskStore, 'activeSummary').get(() => ({ id: 1 } as TaskItemSummaryDto));
            taskStore.$reset();

            await component.vm.initialize();

            sinonExpect.calledOnceWithExactly(startItemEditSpy, 1);
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

            const startItemEditSpy = spy(interruptionStore, 'startItemEdit');
            stub(eventStore, 'isWorking').get(() => false);
            stub(interruptionStore, 'filteredSummaries').get(() => () => interruptions);
            stub(taskStore, 'filteredSummaries').get(() => () => tasks);
            taskStore.$reset();

            await component.vm.initialize();

            sinonExpect.calledOnceWithExactly(startItemEditSpy, 2);
        });

        test('should load first task item when available', async() => {
            const tasks = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 5 } as TaskItemSummaryDto
            ];

            const startItemEditSpy = spy(taskStore, 'startItemEdit');
            stub(eventStore, 'isWorking').get(() => false);
            stub(interruptionStore, 'filteredSummaries').get(() => () => []);
            stub(taskStore, 'filteredSummaries').get(() => () => tasks);
            taskStore.$reset();

            await component.vm.initialize();

            sinonExpect.calledOnceWithExactly(startItemEditSpy, 1);
        });

        test('should do nothing when no item is available', async() => {
            const startInterruptionItemEditSpy = spy(interruptionStore, 'startItemEdit');
            const startTaskItemEditSpy = spy(taskStore, 'startItemEdit');
            stub(eventStore, 'isWorking').get(() => false);
            stub(interruptionStore, 'filteredSummaries').get(() => () => []);
            stub(taskStore, 'filteredSummaries').get(() => () => []);
            taskStore.$reset();

            await component.vm.initialize();

            sinonExpect.notCalled(startInterruptionItemEditSpy);
            sinonExpect.notCalled(startTaskItemEditSpy);
        });
    });

    describe('onInterruptionSelect', () => {
        test('should do nothing when item is already selected', () => {
            const startInterruptionItemEditSpy = spy(interruptionStore, 'startItemEdit');
            const stopTaskItemEditSpy = spy(taskStore, 'stopItemEdit');
            interruptionStore.editingItem = new InterruptionItem(1);

            component.vm.onInterruptionSelect({ id: 1 } as InterruptionItemSummaryDto);

            sinonExpect.notCalled(startInterruptionItemEditSpy);
            sinonExpect.notCalled(stopTaskItemEditSpy);
        });

        test('should select item when no other item is selected', () => {
            const startInterruptionItemEditSpy = spy(interruptionStore, 'startItemEdit');
            const stopTaskItemEditSpy = spy(taskStore, 'stopItemEdit');
            interruptionStore.editingItem = null;

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnceWithExactly(startInterruptionItemEditSpy, 2);
            sinonExpect.calledOnce(stopTaskItemEditSpy);
        });

        test('should select item when item is not already selected', () => {
            const startInterruptionItemEditSpy = spy(interruptionStore, 'startItemEdit');
            const stopTaskItemEditSpy = spy(taskStore, 'stopItemEdit');
            interruptionStore.editingItem = new InterruptionItem(1);

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnceWithExactly(startInterruptionItemEditSpy, 2);
            sinonExpect.calledOnce(stopTaskItemEditSpy);
        });
    });

    describe('onInterruptionCreate', () => {
        test('should not reload summaries when failed to create interruption item', async() => {
            const item = new InterruptionItem(-1);
            const createItemStub = stub(interruptionStore, 'createItem').resolves(false);
            const loadSummariesSpy = spy(interruptionStore, 'loadSummaries');
            interruptionStore.$reset();

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledOnceWithExactly(createItemStub, item);
            sinonExpect.notCalled(loadSummariesSpy);
        });

        test('should reload summaries when successfully created interruption item', async() => {
            const item = new InterruptionItem(-1);
            const createItemStub = stub(interruptionStore, 'createItem').resolves(true);
            const loadSummariesSpy = spy(interruptionStore, 'loadSummaries');
            interruptionStore.$reset();

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledOnceWithExactly(createItemStub, item);
            sinonExpect.calledOnce(loadSummariesSpy);
        });
    });

    describe('onInterruptionUpdate', () => {
        test('should not reload summaries when failed to update interruption item', async() => {
            const item = new InterruptionItem(1);
            const updateItemStub = stub(interruptionStore, 'updateItem').resolves(false);
            const loadSummariesSpy = spy(interruptionStore, 'loadSummaries');
            interruptionStore.$reset();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(updateItemStub, item);
            sinonExpect.notCalled(loadSummariesSpy);
        });

        test('should reload summaries when successfully updated interruption item', async() => {
            const item = new InterruptionItem(1);
            const updateItemStub = stub(interruptionStore, 'updateItem').resolves(true);
            const loadSummariesSpy = spy(interruptionStore, 'loadSummaries');
            interruptionStore.$reset();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(updateItemStub, item);
            sinonExpect.calledOnce(loadSummariesSpy);
        });
    });

    describe('onInterruptionDeleteStart', () => {
        test('should delete new interruption item without prompting for confirmation', () => {
            const openSpy = spy(dialogStore, 'open');
            const stopItemEditSpy = spy(interruptionStore, 'stopItemEdit');

            component.vm.onInterruptionDeleteStart(new InterruptionItem(-1));

            sinonExpect.calledOnce(stopItemEditSpy);
            sinonExpect.notCalled(openSpy);
        });

        test('should prompt for confirmation before deleting existing interruption item', () => {
            const openSpy = spy(dialogStore, 'open');
            const stopItemEditSpy = spy(interruptionStore, 'stopItemEdit');

            component.vm.onInterruptionDeleteStart(new InterruptionItem(1));

            sinonExpect.notCalled(stopItemEditSpy);
            sinonExpect.calledOnce(openSpy);
        });

        test('should delete interruption item on confirmation', async() => {
            const item = new InterruptionItem(5);
            const openSpy = spy(dialogStore, 'open');
            const deleteItemSpy = spy(interruptionStore, 'deleteItem');
            component.vm.onInterruptionDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.calledOnceWithExactly(deleteItemSpy, 5);
        });

        test('should not start idling session when failed to delete interruption item', async() => {
            const item = new InterruptionItem(5);
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            stub(eventStore, 'isActiveWorkItem').get(() => () => true);
            stub(interruptionStore, 'deleteItem').resolves(false);
            interruptionStore.$reset();
            component.vm.onInterruptionDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.notCalled(startIdlingSpy);
        });

        test('should not start idling session when deleted interruption item is not active', async() => {
            const item = new InterruptionItem(5);
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            const isActiveWorkItemStub = stub().returns(false);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(interruptionStore, 'deleteItem').resolves(true);
            interruptionStore.$reset();
            component.vm.onInterruptionDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            sinonExpect.notCalled(startIdlingSpy);
        });

        test('should start idling session when deleted interruption item is active', async() => {
            const item = new InterruptionItem(5);
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(interruptionStore, 'deleteItem').resolves(true);
            interruptionStore.$reset();
            component.vm.onInterruptionDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            sinonExpect.calledOnce(startIdlingSpy);
        });
    });

    describe('onTaskSelect', () => {
        test('should do nothing when item is already selected', () => {
            const stopInterruptionItemEditSpy = spy(interruptionStore, 'stopItemEdit');
            const startTaskItemEditSpy = spy(taskStore, 'startItemEdit');
            taskStore.editingItem = new TaskItem(1);

            component.vm.onTaskSelect({ id: 1 } as TaskItemSummaryDto);

            sinonExpect.notCalled(stopInterruptionItemEditSpy);
            sinonExpect.notCalled(startTaskItemEditSpy);
        });

        test('should select item when no other item is selected', () => {
            const stopInterruptionItemEditSpy = spy(interruptionStore, 'stopItemEdit');
            const startTaskItemEditSpy = spy(taskStore, 'startItemEdit');
            taskStore.editingItem = null;

            component.vm.onTaskSelect({ id: 2 } as TaskItemSummaryDto);

            sinonExpect.calledOnce(stopInterruptionItemEditSpy);
            sinonExpect.calledOnceWithExactly(startTaskItemEditSpy, 2);
        });

        test('should select item when item is not already selected', () => {
            const stopInterruptionItemEditSpy = spy(interruptionStore, 'stopItemEdit');
            const startTaskItemEditSpy = spy(taskStore, 'startItemEdit');
            taskStore.editingItem = new TaskItem(1);

            component.vm.onTaskSelect({ id: 2 } as TaskItemSummaryDto);

            sinonExpect.calledOnce(stopInterruptionItemEditSpy);
            sinonExpect.calledOnceWithExactly(startTaskItemEditSpy, 2);
        });
    });

    describe('onTaskCreate', () => {
        test('should not reload summaries when failed to create task item', async() => {
            const item = new TaskItem(-1);
            const createItemStub = stub(taskStore, 'createItem').resolves(false);
            const loadSummariesSpy = spy(taskStore, 'loadSummaries');
            taskStore.$reset();

            await component.vm.onTaskCreate(item);

            sinonExpect.calledOnceWithExactly(createItemStub, item);
            sinonExpect.notCalled(loadSummariesSpy);
        });

        test('should reload summaries when successfully created task item', async() => {
            const item = new TaskItem(-1);
            const createItemStub = stub(taskStore, 'createItem').resolves(true);
            const loadSummariesSpy = spy(taskStore, 'loadSummaries');
            taskStore.$reset();

            await component.vm.onTaskCreate(item);

            sinonExpect.calledOnceWithExactly(createItemStub, item);
            sinonExpect.calledOnce(loadSummariesSpy);
        });
    });

    describe('onTaskUpdate', () => {
        test('should not reload summaries when failed to update task item', async() => {
            const item = new TaskItem(1);
            const updateItemStub = stub(taskStore, 'updateItem').resolves(false);
            const loadSummariesSpy = spy(taskStore, 'loadSummaries');
            taskStore.$reset();

            await component.vm.onTaskUpdate(item);

            sinonExpect.calledOnceWithExactly(updateItemStub, item);
            sinonExpect.notCalled(loadSummariesSpy);
        });

        test('should reload summaries when successfully updated task item', async() => {
            const item = new TaskItem(1);
            const updateItemStub = stub(taskStore, 'updateItem').resolves(true);
            const loadSummariesSpy = spy(taskStore, 'loadSummaries');
            taskStore.$reset();

            await component.vm.onTaskUpdate(item);

            sinonExpect.calledOnceWithExactly(updateItemStub, item);
            sinonExpect.calledOnce(loadSummariesSpy);
        });
    });

    describe('onTaskDeleteStart', () => {
        test('should delete new task item without prompting for confirmation', () => {
            const openSpy = spy(dialogStore, 'open');
            const stopItemEditSpy = spy(taskStore, 'stopItemEdit');

            component.vm.onTaskDeleteStart(new TaskItem(-1));

            sinonExpect.notCalled(openSpy);
            sinonExpect.calledOnce(stopItemEditSpy);
        });

        test('should prompt for confirmation before deleting existing task item', () => {
            const openSpy = spy(dialogStore, 'open');
            const stopItemEditSpy = spy(taskStore, 'stopItemEdit');

            component.vm.onTaskDeleteStart(new TaskItem(1));

            sinonExpect.calledOnce(openSpy);
            sinonExpect.notCalled(stopItemEditSpy);
        });

        test('should delete task item on confirmation', async() => {
            const item = new TaskItem(5);
            const openSpy = spy(dialogStore, 'open');
            const deleteItemSpy = spy(taskStore, 'deleteItem');
            component.vm.onTaskDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.calledOnceWithExactly(deleteItemSpy, 5);
        });

        test('should not start idling session when failed to delete task item', async() => {
            const item = new TaskItem(5);
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            stub(eventStore, 'isActiveWorkItem').get(() => () => true);
            stub(taskStore, 'deleteItem').resolves(false);
            taskStore.$reset();
            component.vm.onTaskDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.notCalled(startIdlingSpy);
        });

        test('should not start idling session when deleted task item is not active', async() => {
            const item = new TaskItem(5);
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            const isActiveWorkItemStub = stub().returns(false);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(taskStore, 'deleteItem').resolves(true);
            taskStore.$reset();
            component.vm.onTaskDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            sinonExpect.notCalled(startIdlingSpy);
        });

        test('should start idling session when deleted task item is active', async() => {
            const item = new TaskItem(5);
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(taskStore, 'deleteItem').resolves(true);
            taskStore.$reset();
            component.vm.onTaskDeleteStart(item);

            await openSpy.getCall(0).args[0].options.preConfirm!(item);

            sinonExpect.calledOnce(isActiveWorkItemStub);
            sinonExpect.calledOnce(startIdlingSpy);
        });
    });
});
