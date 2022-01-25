import { nextTick } from 'vue';
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

    describe('totalItems', () => {
        test('should be hidden when no interruption item exists', async() => {
            stub(interruptionStore, 'filteredSummaries').get(() => () => []);
            await component.setProps({ searchText: null });

            expect(component.find('.list-counter').exists()).toEqual(false);
        });

        test('should display total interruption items', async() => {
            const summaries = [
                { id: 3 } as InterruptionItemSummaryDto,
                { id: 6 } as InterruptionItemSummaryDto,
                { id: 7 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStore, 'filteredSummaries').get(() => () => summaries);
            interruptionStore.$reset();
            await nextTick();

            expect(component.find('.list-counter').text()).toEqual('3 interruptions');
        });

        test('should handle singular form', async() => {
            stub(interruptionStore, 'filteredSummaries').get(() => () => [{ id: 3 } as InterruptionItemSummaryDto]);
            interruptionStore.$reset();
            await nextTick();

            expect(component.find('.list-counter').text()).toEqual('1 interruption');
        });
    });

    describe('items', () => {
        test('should properly transform search text', async() => {
            const filteredSummariesStub = stub().returns([]);
            stub(interruptionStore, 'filteredSummaries').get(() => filteredSummariesStub);
            await component.setProps({ searchText: ' SEARCH_TEXT ' });

            sinonExpect.calledOnceWithExactly(filteredSummariesStub, 'search_text');
        });

        test('should properly handle invalid search text', async() => {
            const filteredSummariesStub = stub().returns([]);
            stub(interruptionStore, 'filteredSummaries').get(() => filteredSummariesStub);
            await component.setProps({ searchText: null });

            sinonExpect.calledOnceWithExactly(filteredSummariesStub, '');
        });

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
            component.vm.$options.watch.items.call(component.vm);
            jest.advanceTimersByTime(300);
            await nextTick();

            let elements = component.findAll('.interruption-item-card');

            expect(elements.length).toEqual(3);
            expect(elements[0].classes()).toContain('animated');
            expect(elements[0].classes()).not.toContain('selected');
            expect(elements[1].classes()).toContain('animated');
            expect(elements[1].classes()).toContain('selected');
            expect(elements[2].classes()).toContain('animated');
            expect(elements[2].classes()).not.toContain('selected');

            summaries.push({ id: 4 } as InterruptionItemSummaryDto);
            interruptionStore.editingItem = new InterruptionItem(summaries[3].id);
            component.vm.$options.watch.items.call(component.vm);
            jest.advanceTimersByTime(300);
            await nextTick();

            elements = component.findAll('.interruption-item-card');

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
