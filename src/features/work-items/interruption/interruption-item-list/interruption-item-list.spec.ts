import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStub } from 'sinon';

import store from '../../../../store';
import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { EventType } from '../../../../core/enums/event-type.enum';

import InterruptionItemList from './interruption-item-list.vue';

describe('interruption item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let sandbox: SinonSandbox;
    let gettersStub: SinonStub;

    beforeEach(() => {
        sandbox = createSandbox();
        gettersStub = sandbox.stub(store.base, 'getters');
        component = shallowMount(InterruptionItemList);
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
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: null,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items).toEqual([]);
        });

        test('should return items matching filter criteria', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;

            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: null,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => summaries
            });

            component.unmount();
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([1, 2, 3]);
        });

        test('should include active summary item when available', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const active = { id: 9 } as InterruptionItemSummaryDto;

            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: active,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => summaries
            });

            component.unmount();
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([9, 1, 2, 3]);
        });

        test('should avoid including duplicate active summary item and ensure it is always on top', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const active = { id: 9 } as InterruptionItemSummaryDto;

            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 9 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: active,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => summaries
            });

            component.unmount();
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([9, 1, 3]);
        });
    });

    describe('selectedItemId', () => {
        test('should return -1 when no item selected', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${interruptionKey}/${interruptionGetter.EditingItem}`]: null,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(InterruptionItemList);

            expect(component.vm.selectedItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const item = { id: 5 } as InterruptionItemSummaryDto;

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${interruptionKey}/${interruptionGetter.EditingItem}`]: item,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(InterruptionItemList);

            expect(component.vm.selectedItemId).toEqual(5);
        });
    });

    describe('getItemCardClasses', () => {
        test('should return correct classes', () => {
            const { namespace: eventKey, getter: eventGetter } = store.event;
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;

            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: () => false,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: null,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => summaries,
                [`${interruptionKey}/${interruptionGetter.EditingItem}`]: new InterruptionItem(summaries[1].id)
            });

            component.unmount();
            component = shallowMount(InterruptionItemList, { attachTo: document.body });
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
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const item = { id: 1 } as InterruptionItemSummaryDto;
            const stub = sandbox.stub().returns(true);

            gettersStub.value({
                [`${eventKey}/${eventGetter.IsActiveWorkItem}`]: stub,
                [`${interruptionKey}/${interruptionGetter.ActiveSummary}`]: item,
                [`${interruptionKey}/${interruptionGetter.Summaries}`]: () => []
            });

            component.unmount();
            component = shallowMount(InterruptionItemList);
            stub.resetHistory();
            const result = component.vm.isActive(item);

            sinonExpect.calledOnceWithExactly(stub, EventType.Interruption, 1);
            expect(result).toEqual(true);
        });
    });
});
