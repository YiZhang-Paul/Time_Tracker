import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStub } from 'sinon';

import store from '../../../../store';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';

import TaskItemList from './task-item-list.vue';

describe('task item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let sandbox: SinonSandbox;
    let gettersStub: SinonStub;

    beforeEach(() => {
        sandbox = createSandbox();
        gettersStub = sandbox.stub(store.base, 'getters');
        component = shallowMount(TaskItemList);
    });

    afterEach(() => {
        sandbox.restore();
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('items', () => {
        test('should return empty collection when no items available', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: null,
                [`${taskKey}/${taskGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(TaskItemList);

            expect(component.vm.items).toEqual([]);
        });

        test('should return items matching filter criteria', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: null,
                [`${taskKey}/${taskGetter.Summaries}`]: () => [
                    { id: 1 } as TaskItemSummaryDto,
                    { id: 2 } as TaskItemSummaryDto,
                    { id: 3 } as TaskItemSummaryDto
                ]
            });

            component.unmount();
            component = shallowMount(TaskItemList);

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([1, 2, 3]);
        });

        test('should include active summary item when available', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;
            const active = { id: 9 } as TaskItemSummaryDto;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: active,
                [`${taskKey}/${taskGetter.Summaries}`]: () => [
                    { id: 1 } as TaskItemSummaryDto,
                    { id: 2 } as TaskItemSummaryDto,
                    { id: 3 } as TaskItemSummaryDto
                ]
            });

            component.unmount();
            component = shallowMount(TaskItemList);

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([9, 1, 2, 3]);
        });

        test('should avoid including duplicate active summary item and ensure it is always on top', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;
            const active = { id: 9 } as TaskItemSummaryDto;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: active,
                [`${taskKey}/${taskGetter.Summaries}`]: () => [
                    { id: 1 } as TaskItemSummaryDto,
                    { id: 9 } as TaskItemSummaryDto,
                    { id: 3 } as TaskItemSummaryDto
                ]
            });

            component.unmount();
            component = shallowMount(TaskItemList);

            expect(component.vm.items.map((_: TaskItemSummaryDto) => _.id)).toEqual([9, 1, 3]);
        });
    });

    describe('selectedItemId', () => {
        test('should return -1 when no item selected', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${taskKey}/${taskGetter.EditingItem}`]: null,
                [`${taskKey}/${taskGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(TaskItemList);

            expect(component.vm.selectedItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;
            const item = { id: 5 } as TaskItemSummaryDto;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${taskKey}/${taskGetter.EditingItem}`]: item,
                [`${taskKey}/${taskGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(TaskItemList);

            expect(component.vm.selectedItemId).toEqual(5);
        });
    });

    describe('getItemCardClasses', () => {
        test('should return correct classes', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            const summaries = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: null,
                [`${taskKey}/${taskGetter.Summaries}`]: () => summaries,
                [`${taskKey}/${taskGetter.EditingItem}`]: new TaskItem(summaries[1].id)
            });

            component.unmount();
            component = shallowMount(TaskItemList, { attachTo: document.body });
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
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: taskKey, getter: taskGetter } = store.task;
            const item = { id: 1 } as TaskItemSummaryDto;
            const stub = sandbox.stub().returns(true);

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: stub,
                [`${taskKey}/${taskGetter.ActiveSummary}`]: item,
                [`${taskKey}/${taskGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(TaskItemList);
            stub.resetHistory();
            const result = component.vm.isActive(item);

            sinonExpect.calledOnceWithExactly(stub, EventType.Task, 1);
            expect(result).toEqual(true);
        });
    });
});
