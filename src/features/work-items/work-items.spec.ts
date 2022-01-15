import { shallowMount, VueWrapper, flushPromises } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStub } from 'sinon';

import store from '../../store';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';

import WorkItems from './work-items.vue';

describe('work items unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let sandbox: SinonSandbox;
    let gettersStub: SinonStub;
    let dispatchStub: SinonStub;

    beforeEach(async() => {
        sandbox = createSandbox();
        gettersStub = sandbox.stub(store.base, 'getters');
        dispatchStub = sandbox.stub(store.base, 'dispatch');
        component = shallowMount(WorkItems);
        await flushPromises();
        gettersStub.resetHistory();
        dispatchStub.resetHistory();
    });

    afterEach(() => {
        sandbox.restore();
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('created', () => {
        test('should initialize data', async() => {
            const { namespace: eventKey, action: eventAction } = store.event;
            const { namespace: interruptionKey, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, action: taskAction } = store.task;

            component.unmount();
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledWith(dispatchStub, `${eventKey}/${eventAction.LoadOngoingTimeSummary}`);
            sinonExpect.calledWith(dispatchStub, `${interruptionKey}/${interruptionAction.LoadInterruptionSummaries}`);
            sinonExpect.calledWith(dispatchStub, `${taskKey}/${taskAction.LoadTaskSummaries}`);
        });

        test('should load active interruption item when available', async() => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, getter: taskGetter } = store.task;
            const item = { id: 1 } as InterruptionItemSummaryDto;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsWorking}`]: true,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: item,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: null
            });

            component.unmount();
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledWith(dispatchStub, `${interruptionKey}/${interruptionAction.StartInterruptionItemEdit}`, 1);
        });

        test('should load active task item when available', async() => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const { namespace: taskKey, getter: taskGetter, action: taskAction } = store.task;
            const item = { id: 1 } as TaskItemSummaryDto;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsWorking}`]: true,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: null,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: item
            });

            component.unmount();
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledWith(dispatchStub, `${taskKey}/${taskAction.StartTaskItemEdit}`, 1);
        });

        test('should load first interruption item when available', async() => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsWorking}`]: false,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => [
                    { id: 2 } as InterruptionItemSummaryDto,
                    { id: 3 } as InterruptionItemSummaryDto
                ],
                [`${taskKey}/${taskGetter.Summaries}`]: () => [
                    { id: 1 } as TaskItemSummaryDto,
                    { id: 5 } as TaskItemSummaryDto
                ]
            });

            component.unmount();
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledWith(dispatchStub, `${interruptionKey}/${interruptionAction.StartInterruptionItemEdit}`, 2);
        });

        test('should load first task item when available', async() => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const { namespace: taskKey, getter: taskGetter, action: taskAction } = store.task;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsWorking}`]: false,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => [],
                [`${taskKey}/${taskGetter.Summaries}`]: () => [
                    { id: 1 } as TaskItemSummaryDto,
                    { id: 5 } as TaskItemSummaryDto
                ]
            });

            component.unmount();
            component = shallowMount(WorkItems);
            await flushPromises();

            sinonExpect.calledWith(dispatchStub, `${taskKey}/${taskAction.StartTaskItemEdit}`, 1);
        });
    });

    describe('onInterruptionSelect', () => {
        test('should do nothing when item is already selected', () => {
            const { namespace: interruptionKey, getter: interruptionGetter, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, action: taskAction } = store.task;
            gettersStub.value({ [`${interruptionKey}/${interruptionGetter.EditingItem}`]: new InterruptionItem(1) });
            component.unmount();
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 1 } as InterruptionItemSummaryDto);

            expect(dispatchStub.neverCalledWith(`${taskKey}/${taskAction.EndTaskItemEdit}`)).toEqual(true);
            expect(dispatchStub.neverCalledWith(`${interruptionKey}/${interruptionAction.StartInterruptionItemEdit}`, 1)).toEqual(true);
        });

        test('should select item when no other item is selected', () => {
            const { namespace: interruptionKey, getter: interruptionGetter, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, action: taskAction } = store.task;
            gettersStub.value({ [`${interruptionKey}/${interruptionGetter.EditingItem}`]: null });
            component.unmount();
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledWith(dispatchStub, `${taskKey}/${taskAction.EndTaskItemEdit}`);
            sinonExpect.calledWith(dispatchStub, `${interruptionKey}/${interruptionAction.StartInterruptionItemEdit}`, 2);
        });

        test('should select item when item is not already selected', () => {
            const { namespace: interruptionKey, getter: interruptionGetter, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, action: taskAction } = store.task;
            gettersStub.value({ [`${interruptionKey}/${interruptionGetter.EditingItem}`]: new InterruptionItem(1) });
            component.unmount();
            component = shallowMount(WorkItems);

            component.vm.onInterruptionSelect({ id: 2 } as InterruptionItemSummaryDto);

            sinonExpect.calledWith(dispatchStub, `${taskKey}/${taskAction.EndTaskItemEdit}`);
            sinonExpect.calledWith(dispatchStub, `${interruptionKey}/${interruptionAction.StartInterruptionItemEdit}`, 2);
        });
    });

    describe('onInterruptionCreate', () => {
        test('should not reload summaries when failed to create interruption item', async() => {
            const { namespace, action } = store.interruption;
            const item = new InterruptionItem(-1);
            dispatchStub.withArgs(`${namespace}/${action.CreateInterruptionItem}`).resolves(false);

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledWith(dispatchStub, `${namespace}/${action.CreateInterruptionItem}`, item);
            expect(dispatchStub.neverCalledWith(`${namespace}/${action.LoadInterruptionSummaries}`)).toEqual(true);
        });

        test('should reload summaries when successfully created interruption item', async() => {
            const { namespace, action } = store.interruption;
            const item = new InterruptionItem(-1);
            dispatchStub.withArgs(`${namespace}/${action.CreateInterruptionItem}`).resolves(true);

            await component.vm.onInterruptionCreate(item);

            sinonExpect.calledWith(dispatchStub, `${namespace}/${action.CreateInterruptionItem}`, item);
            sinonExpect.calledWith(dispatchStub, `${namespace}/${action.LoadInterruptionSummaries}`);
        });
    });

    describe('onInterruptionUpdate', () => {
        test('should not reload summaries when failed to update interruption item', async() => {
            const { namespace, action } = store.interruption;
            const item = new InterruptionItem(1);
            dispatchStub.withArgs(`${namespace}/${action.UpdateInterruptionItem}`).resolves(false);

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledWith(dispatchStub, `${namespace}/${action.UpdateInterruptionItem}`, item);
            expect(dispatchStub.neverCalledWith(`${namespace}/${action.LoadInterruptionSummaries}`)).toEqual(true);
        });

        test('should reload summaries when successfully updated interruption item', async() => {
            const { namespace, action } = store.interruption;
            const item = new InterruptionItem(1);
            dispatchStub.withArgs(`${namespace}/${action.UpdateInterruptionItem}`).resolves(true);

            await component.vm.onInterruptionUpdate(item);

            sinonExpect.calledWith(dispatchStub, `${namespace}/${action.UpdateInterruptionItem}`, item);
            sinonExpect.calledWith(dispatchStub, `${namespace}/${action.LoadInterruptionSummaries}`);
        });
    });

    describe('onInterruptionDeleteStart', () => {
        test('should delete new interruption item without prompting for confirmation', () => {
            const { namespace: interruptionKey, action: interruptionAction } = store.interruption;
            const { namespace: dialogKey, action: dialogAction } = store.dialog;

            component.vm.onInterruptionDeleteStart(new InterruptionItem(-1));

            sinonExpect.calledWith(dispatchStub, `${interruptionKey}/${interruptionAction.EndInterruptionItemEdit}`);
            expect(dispatchStub.neverCalledWith(`${dialogKey}/${dialogAction.OpenDialog}`)).toEqual(true);
        });

        test('should prompt for confirmation before deleting existing interruption item', () => {
            const { namespace: interruptionKey, action: interruptionAction } = store.interruption;
            const { namespace: dialogKey, action: dialogAction } = store.dialog;

            component.vm.onInterruptionDeleteStart(new InterruptionItem(1));

            sinonExpect.calledWith(dispatchStub, `${dialogKey}/${dialogAction.OpenDialog}`);
            expect(dispatchStub.neverCalledWith(`${interruptionKey}/${interruptionAction.EndInterruptionItemEdit}`)).toEqual(true);
        });
    });
});
