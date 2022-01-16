import { shallowMount, VueWrapper, flushPromises } from '@vue/test-utils';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { DialogStateService } from '../../core/services/states/dialog-state/dialog-state.service';
import { InterruptionStateService } from '../../core/services/states/interruption-state/interruption-state.service';
import { TaskStateService } from '../../core/services/states/task-state/task-state.service';
import { EventStateService } from '../../core/services/states/event-state/event-state.service';
import { stubDialogStateService } from '../../mocks/dialog-state.service.stub';
import { stubInterruptionStateService } from '../../mocks/interruption-state.service.stub';
import { stubTaskStateService } from '../../mocks/task-state.service.stub';
import { stubEventStateService } from '../../mocks/event-state.service.stub';

import WorkItems from './work-items.vue';

describe('work items unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let dialogStateStub: SinonStubbedInstance<DialogStateService>;
    let interruptionStateStub: SinonStubbedInstance<InterruptionStateService>;
    let taskStateStub: SinonStubbedInstance<TaskStateService>;
    let eventStateStub: SinonStubbedInstance<EventStateService>;

    beforeEach(() => {
        dialogStateStub = stubDialogStateService();
        interruptionStateStub = stubInterruptionStateService();
        taskStateStub = stubTaskStateService();
        eventStateStub = stubEventStateService();

        container
            .rebind<DialogStateService>(types.DialogStateService)
            .toConstantValue(dialogStateStub);

        container
            .rebind<InterruptionStateService>(types.InterruptionStateService)
            .toConstantValue(interruptionStateStub);

        container
            .rebind<TaskStateService>(types.TaskStateService)
            .toConstantValue(taskStateStub);

        container
            .rebind<EventStateService>(types.EventStateService)
            .toConstantValue(eventStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(WorkItems);
        expect(component).toBeTruthy();
    });

    describe('created', () => {
        test('should initialize data', async() => {
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledOnce(eventStateStub.loadOngoingTimeSummary);
            sinonExpect.calledOnce(interruptionStateStub.loadInterruptionSummaries);
            sinonExpect.calledOnce(taskStateStub.loadTaskSummaries);
        });

        test('should load active interruption item when available', async() => {
            stub(eventStateStub, 'isWorking').get(() => true);
            stub(interruptionStateStub, 'activeSummary').get(() => ({ id: 1 } as InterruptionItemSummaryDto));
            stub(taskStateStub, 'activeSummary').get(() => null);
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(interruptionStateStub.startInterruptionItemEdit, 1);
        });

        test('should load active task item when available', async() => {
            stub(eventStateStub, 'isWorking').get(() => true);
            stub(interruptionStateStub, 'activeSummary').get(() => null);
            stub(taskStateStub, 'activeSummary').get(() => ({ id: 1 } as TaskItemSummaryDto));
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(taskStateStub.startTaskItemEdit, 1);
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

            stub(eventStateStub, 'isWorking').get(() => false);
            interruptionStateStub.getSummaries.returns(interruptions);
            taskStateStub.getSummaries.returns(tasks);
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(interruptionStateStub.startInterruptionItemEdit, 2);
        });

        test('should load first task item when available', async() => {
            const tasks = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 5 } as TaskItemSummaryDto
            ];

            stub(eventStateStub, 'isWorking').get(() => false);
            interruptionStateStub.getSummaries.returns([]);
            taskStateStub.getSummaries.returns(tasks);
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledOnceWithExactly(taskStateStub.startTaskItemEdit, 1);
        });
    });

    describe('onInterruptionSelect', () => {
        test('should do nothing when item is already selected', () => {
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(1));
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 1 } as InterruptionItemSummaryDto);

            sinonExpect.notCalled(taskStateStub.endTaskItemEdit);
            sinonExpect.notCalled(interruptionStateStub.startInterruptionItemEdit);
        });

        test('should select item when no other item is selected', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnce(taskStateStub.endTaskItemEdit);
            sinonExpect.calledOnceWithExactly(interruptionStateStub.startInterruptionItemEdit, 2);
        });

        test('should select item when item is not already selected', () => {
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(1));
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledOnce(taskStateStub.endTaskItemEdit);
            sinonExpect.calledOnceWithExactly(interruptionStateStub.startInterruptionItemEdit, 2);
        });
    });

    describe('onInterruptionCreate', () => {
        test('should not reload summaries when failed to create interruption item', async() => {
            const item = new InterruptionItem(-1);
            interruptionStateStub.createInterruptionItem.resolves(false);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadInterruptionSummaries.resetHistory();

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.createInterruptionItem, item);
            sinonExpect.notCalled(interruptionStateStub.loadInterruptionSummaries);
        });

        test('should reload summaries when successfully created interruption item', async() => {
            const item = new InterruptionItem(-1);
            interruptionStateStub.createInterruptionItem.resolves(true);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadInterruptionSummaries.resetHistory();

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.createInterruptionItem, item);
            sinonExpect.calledOnce(interruptionStateStub.loadInterruptionSummaries);
        });
    });

    describe('onInterruptionUpdate', () => {
        test('should not reload summaries when failed to update interruption item', async() => {
            const item = new InterruptionItem(1);
            interruptionStateStub.updateInterruptionItem.resolves(false);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadInterruptionSummaries.resetHistory();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.updateInterruptionItem, item);
            sinonExpect.notCalled(interruptionStateStub.loadInterruptionSummaries);
        });

        test('should reload summaries when successfully updated interruption item', async() => {
            const item = new InterruptionItem(1);
            interruptionStateStub.updateInterruptionItem.resolves(true);
            component = shallowMount(WorkItems);
            interruptionStateStub.loadInterruptionSummaries.resetHistory();

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledOnceWithExactly(interruptionStateStub.updateInterruptionItem, item);
            sinonExpect.calledOnce(interruptionStateStub.loadInterruptionSummaries);
        });
    });

    describe('onInterruptionDeleteStart', () => {
        test('should delete new interruption item without prompting for confirmation', () => {
            component = shallowMount(WorkItems);

            component.vm.onInterruptionDeleteStart(new InterruptionItem(-1));

            sinonExpect.calledOnce(interruptionStateStub.endInterruptionItemEdit);
            sinonExpect.notCalled(dialogStateStub.openDialog);
        });

        test('should prompt for confirmation before deleting existing interruption item', () => {
            component = shallowMount(WorkItems);

            component.vm.onInterruptionDeleteStart(new InterruptionItem(1));

            sinonExpect.notCalled(interruptionStateStub.endInterruptionItemEdit);
            sinonExpect.calledOnce(dialogStateStub.openDialog);
        });
    });
});
