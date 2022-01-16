import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import { InterruptionStateService } from '../../../../core/services/states/interruption-state/interruption-state.service';
import { EventStateService } from '../../../../core/services/states/event-state/event-state.service';
import { stubInterruptionStateService } from '../../../../mocks/interruption-state.service.stub';
import { stubEventStateService } from '../../../../mocks/event-state.service.stub';

import InterruptionItemList from './interruption-item-list.vue';

describe('interruption item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let interruptionStateStub: SinonStubbedInstance<InterruptionStateService>;
    let eventStateStub: SinonStubbedInstance<EventStateService>;

    beforeEach(() => {
        interruptionStateStub = stubInterruptionStateService();
        eventStateStub = stubEventStateService();

        container
            .rebind<InterruptionStateService>(types.InterruptionStateService)
            .toConstantValue(interruptionStateStub);

        container
            .rebind<EventStateService>(types.EventStateService)
            .toConstantValue(eventStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(InterruptionItemList);

        expect(component).toBeTruthy();
    });

    describe('items', () => {
        test('should return empty collection when no items available', () => {
            stub(interruptionStateStub, 'activeSummary').get(() => null);
            interruptionStateStub.searchSummaries.returns([]);
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items).toEqual([]);
        });

        test('should return items matching filter criteria', () => {
            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStateStub, 'activeSummary').get(() => null);
            interruptionStateStub.searchSummaries.returns(summaries);
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([1, 2, 3]);
        });

        test('should include active summary item when available', () => {
            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStateStub, 'activeSummary').get(() => ({ id: 9 } as InterruptionItemSummaryDto));
            interruptionStateStub.searchSummaries.returns(summaries);
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([9, 1, 2, 3]);
        });

        test('should avoid including duplicate active summary item and ensure it is always on top', () => {
            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 9 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStateStub, 'activeSummary').get(() => ({ id: 9 } as InterruptionItemSummaryDto));
            interruptionStateStub.searchSummaries.returns(summaries);
            component = shallowMount(InterruptionItemList);

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([9, 1, 3]);
        });
    });

    describe('selectedItemId', () => {
        test('should return -1 when no item selected', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            component = shallowMount(InterruptionItemList);

            expect(component.vm.selectedItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            stub(interruptionStateStub, 'editingItem').get(() => ({ id: 5 } as InterruptionItemSummaryDto));
            component = shallowMount(InterruptionItemList);

            expect(component.vm.selectedItemId).toEqual(5);
        });
    });

    describe('getItemCardClasses', () => {
        test('should return correct classes', () => {
            const summaries = [
                { id: 1 } as InterruptionItemSummaryDto,
                { id: 2 } as InterruptionItemSummaryDto,
                { id: 3 } as InterruptionItemSummaryDto
            ];

            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(summaries[1].id));
            interruptionStateStub.searchSummaries.returns(summaries);
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
            const item = { id: 1 } as InterruptionItemSummaryDto;
            stub(interruptionStateStub, 'activeSummary').get(() => item);
            eventStateStub.isActiveWorkItem.returns(true);
            component = shallowMount(InterruptionItemList);
            eventStateStub.isActiveWorkItem.resetHistory();

            const result = component.vm.isActive(item);

            sinonExpect.calledOnceWithExactly(eventStateStub.isActiveWorkItem, EventType.Interruption, 1);
            expect(result).toEqual(true);
        });
    });
});
