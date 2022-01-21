import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub } from 'sinon';

import { useEventStore } from '../../../../stores/event/event.store';
import { useInterruptionStore } from '../../../../stores/interruption/interruption.store';
import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { EventType } from '../../../../core/enums/event-type.enum';

import InterruptionItemList from './interruption-item-list.vue';

describe('interruption item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let eventStore: ReturnType<typeof useEventStore>;
    let interruptionStore: ReturnType<typeof useInterruptionStore>;

    beforeEach(() => {
        component = shallowMount(InterruptionItemList, { global: { plugins: [createTestingPinia()] } });
        eventStore = useEventStore();
        interruptionStore = useInterruptionStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('items', () => {
        test('should return empty collection when no items available', () => {
            stub(interruptionStore, 'filteredSummaries').get(() => () => []);
            stub(interruptionStore, 'activeSummary').get(() => null);
            interruptionStore.$reset();

            expect(component.vm.items).toEqual([]);
        });

        test('should return items matching filter criteria', () => {
            const summaries = [
                { id: 3 } as InterruptionItemSummaryDto,
                { id: 6 } as InterruptionItemSummaryDto,
                { id: 7 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStore, 'filteredSummaries').get(() => () => summaries);
            stub(interruptionStore, 'activeSummary').get(() => null);
            interruptionStore.$reset();

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([3, 6, 7]);
        });

        test('should include active summary item when available', () => {
            const summaries = [
                { id: 3 } as InterruptionItemSummaryDto,
                { id: 6 } as InterruptionItemSummaryDto,
                { id: 7 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStore, 'filteredSummaries').get(() => () => summaries);
            stub(interruptionStore, 'activeSummary').get(() => ({ id: 9 } as InterruptionItemSummaryDto));
            interruptionStore.$reset();

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([9, 3, 6, 7]);
        });

        test('should avoid including duplicate active summary item and ensure it is always on top', () => {
            const summaries = [
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 9 } as InterruptionItemSummaryDto,
                { id: 5 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStore, 'filteredSummaries').get(() => () => summaries);
            stub(interruptionStore, 'activeSummary').get(() => ({ id: 9 } as InterruptionItemSummaryDto));
            interruptionStore.$reset();

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([9, 2, 5]);
        });
    });

    describe('selectedItemId', () => {
        test('should return -1 when no item selected', () => {
            interruptionStore.editingItem = null;

            expect(component.vm.selectedItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            interruptionStore.editingItem = new InterruptionItem(5);

            expect(component.vm.selectedItemId).toEqual(5);
        });
    });

    describe('getItemCardClasses', () => {
        test('should return correct classes', async() => {
            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStore, 'filteredSummaries').get(() => () => summaries);
            interruptionStore.editingItem = new InterruptionItem(summaries[1].id);
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
            const item = { id: 1 } as InterruptionItemSummaryDto;
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            stub(interruptionStore, 'activeSummary').get(() => item);

            const result = component.vm.isActive(item);

            sinonExpect.calledOnceWithExactly(isActiveWorkItemStub, EventType.Interruption, 1);
            expect(result).toEqual(true);
        });
    });
});
