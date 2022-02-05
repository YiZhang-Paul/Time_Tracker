import { nextTick } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';

import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { EventType } from '../../../../core/enums/event-type.enum';
import OverlayScrollbarPanel from '../../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import ItemListBase from './item-list-base.vue';

describe('item list base unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        const stubs = { 'overlay-scrollbar-panel': OverlayScrollbarPanel };
        component = shallowMount(ItemListBase, { global: { stubs } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('list types', () => {
        test('should not show counters when no item exists', async() => {
            const summaries = { unresolved: [], resolved: [] };
            await component.setProps({ summaries, type: EventType.Task });

            expect(component.find('.list-types').exists()).toEqual(false);
        });

        test('should display total items', async() => {
            const unresolved = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            const resolved = [
                { id: 4 } as TaskItemSummaryDto,
                { id: 5 } as TaskItemSummaryDto
            ];

            await component.setProps({ summaries: { unresolved, resolved }, type: EventType.Task });

            expect(component.find('.list-types').text()).toEqual('3 unresolved | 2 resolved');
        });
    });

    describe('items', () => {
        test('should return empty collection when no items available', async() => {
            const summaries = { unresolved: [], resolved: [] };
            await component.setProps({ summaries, activeSummary: null, type: EventType.Interruption });

            expect(component.vm.items).toEqual([]);
        });

        test('should return items matching filter criteria', async() => {
            const unresolved = [
                { id: 3 } as InterruptionItemSummaryDto,
                { id: 6 } as InterruptionItemSummaryDto,
                { id: 7 } as InterruptionItemSummaryDto
            ];

            const summaries = { unresolved, resolved: [] };
            await component.setProps({ summaries, activeSummary: null, type: EventType.Interruption });

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([3, 6, 7]);
        });

        test('should exclude active summary item', async() => {
            const unresolved = [
                { id: 3 } as InterruptionItemSummaryDto,
                { id: 9 } as InterruptionItemSummaryDto,
                { id: 7 } as InterruptionItemSummaryDto
            ];

            const summaries = { unresolved, resolved: [] };
            const activeSummary = { id: 9 } as InterruptionItemSummaryDto;
            await component.setProps({ summaries, activeSummary, type: EventType.Interruption });

            expect(component.vm.items.map((_: InterruptionItemSummaryDto) => _.id)).toEqual([3, 7]);
        });
    });

    describe('getItemCardClasses', () => {
        test('should return correct classes', async() => {
            const unresolved = [
                { id: 1 } as TaskItemSummaryDto,
                { id: 2 } as TaskItemSummaryDto,
                { id: 3 } as TaskItemSummaryDto
            ];

            const summaries = { unresolved, resolved: [] };
            await component.setProps({ summaries, selectedId: unresolved[1].id, type: EventType.Task });
            component.vm.$options.watch.items.call(component.vm);
            jest.advanceTimersByTime(300);
            await nextTick();

            let elements = component.findAll('.item-card');

            expect(elements.length).toEqual(3);
            expect(elements[0].classes()).toContain('animated');
            expect(elements[0].classes()).not.toContain('selected');
            expect(elements[1].classes()).toContain('animated');
            expect(elements[1].classes()).toContain('selected');
            expect(elements[2].classes()).toContain('animated');
            expect(elements[2].classes()).not.toContain('selected');

            unresolved.push({ id: 4 } as TaskItemSummaryDto);
            await component.setProps({ summaries, selectedId: unresolved[3].id, type: EventType.Task });
            component.vm.$options.watch.items.call(component.vm);
            jest.advanceTimersByTime(300);
            await nextTick();

            elements = component.findAll('.item-card');

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
});
