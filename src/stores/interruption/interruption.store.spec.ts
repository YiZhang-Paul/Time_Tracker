import { setActivePinia, createPinia } from 'pinia';
import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { setServices as setEventStoreServices, useEventStore } from '../event/event.store';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { OngoingEventTimeSummaryDto } from '../../core/dtos/ongoing-event-time-summary-dto';
import { EventHistory } from '../../core/models/event/event-history';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { EventType } from '../../core/enums/event-type.enum';
import { Priority } from '../../core/enums/priority.enum';
import { EventHttpService } from '../../core/services/http/event-http/event-http.service';
import { InterruptionItemHttpService } from '../../core/services/http/interruption-item-http/interruption-item-http.service';

import { setServices as setInterruptionStoreServices, useInterruptionStore } from './interruption.store';

describe('interruption store unit test', () => {
    let store: ReturnType<typeof useInterruptionStore>;
    let interruptionItemHttpStub: SinonStubbedInstance<InterruptionItemHttpService>;
    let unresolved: InterruptionItemSummaryDto[];
    let resolved: InterruptionItemSummaryDto[];

    beforeEach(() => {
        interruptionItemHttpStub = createStubInstance(InterruptionItemHttpService);
        setInterruptionStoreServices(interruptionItemHttpStub);
        setActivePinia(createPinia());
        store = useInterruptionStore();
    });

    beforeEach(() => {
        unresolved = [
            { id: 1, name: 'name_1', priority: Priority.Low, progress: 0 } as InterruptionItemSummaryDto,
            { id: 2, name: 'name_2', priority: Priority.High, progress: 0 } as InterruptionItemSummaryDto,
            { id: 3, name: 'name_3', priority: Priority.Medium, progress: 0 } as InterruptionItemSummaryDto,
            { id: 4, name: 'name_4', priority: Priority.Low, progress: 0 } as InterruptionItemSummaryDto
        ];

        resolved = [
            { id: 41, name: 'name_41', priority: Priority.Low, progress: 0 } as InterruptionItemSummaryDto,
            { id: 60, name: 'name_60', priority: Priority.High, progress: 0 } as InterruptionItemSummaryDto
        ];

        interruptionItemHttpStub.getSummaries.resolves({ unresolved: unresolved.slice(), resolved: resolved.slice() });
    });

    describe('filteredSummaries', () => {
        beforeEach(async() => {
            await store.loadSummaries();
        });

        test('should return filtered summaries', () => {
            let result = store.filteredSummaries('me_5');
            expect(result.unresolved).toEqual([]);
            expect(result.resolved).toEqual([]);

            result = store.filteredSummaries(' me_3 ');
            expect(result.unresolved.map(_ => _.name)).toEqual(['name_3']);
            expect(result.resolved).toEqual([]);

            result = store.filteredSummaries(' ME_4 ');
            expect(result.unresolved.map(_ => _.name)).toEqual(['name_4']);
            expect(result.resolved.map(_ => _.name)).toEqual(['name_41']);
        });

        test('should properly handle invalid search text', () => {
            const result = store.filteredSummaries(null);

            expect(result.unresolved.length).toEqual(unresolved.length);
            expect(result.resolved.length).toEqual(resolved.length);
        });

        test('should return sorted summaries', () => {
            const result = store.filteredSummaries('');

            expect(result.unresolved.map(_ => _.name)).toEqual(['name_2', 'name_3', 'name_1', 'name_4']);
            expect(result.resolved.map(_ => _.name)).toEqual(['name_60', 'name_41']);
        });
    });

    describe('activeSummary', () => {
        let eventSummary: OngoingEventTimeSummaryDto;
        let eventStore: ReturnType<typeof useEventStore>;

        beforeEach(() => {
            const eventHttpStub = createStubInstance(EventHttpService);
            eventSummary = new OngoingEventTimeSummaryDto();
            eventSummary.unconcludedSinceStart = new EventHistory();
            eventHttpStub.getOngoingEventSummary.resolves(eventSummary);
            eventStore = useEventStore();
            setEventStoreServices(eventHttpStub);
        });

        test('should return null when not working', async() => {
            await store.loadSummaries();

            expect(store.activeSummary).toBeNull();
        });

        test('should return null when no interruption item is active', async() => {
            eventSummary.unconcludedSinceStart.eventType = EventType.Task;
            await eventStore.loadOngoingEventSummary();
            await store.loadSummaries();

            expect(store.activeSummary).toBeNull();
        });

        test('should return active interruption item', async() => {
            eventSummary.unconcludedSinceStart.resourceId = unresolved[1].id;
            eventSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            await eventStore.loadOngoingEventSummary();
            await store.loadSummaries();

            expect(store.activeSummary).toEqual(unresolved[1]);
        });
    });

    describe('loadSummaries', () => {
        test('should load interruption summaries', async() => {
            await store.loadSummaries();

            sinonExpect.calledOnce(interruptionItemHttpStub.getSummaries);
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
        });
    });

    describe('createItem', () => {
        test('should do nothing on failure', async() => {
            const item = new InterruptionItem(-1);
            interruptionItemHttpStub.createItem.resolves(null);
            expect(store.editingItem).toBeFalsy();

            const result = await store.createItem(item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.createItem, item);
            expect(store.editingItem).toBeFalsy();
            expect(result).toEqual(false);
        });

        test('should open created item on success', async() => {
            const item = new InterruptionItem(-1);
            interruptionItemHttpStub.createItem.resolves(item);
            expect(store.editingItem).toBeFalsy();

            const result = await store.createItem(item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.createItem, item);
            expect(store.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('updateItem', () => {
        test('should do nothing on failure', async() => {
            const previous: InterruptionItem = { ...new InterruptionItem(1), name: 'previous_name' };
            const current: InterruptionItem = { ...new InterruptionItem(1), name: 'current_name' };
            interruptionItemHttpStub.getItem.resolves(previous);
            interruptionItemHttpStub.updateItem.resolves(null);
            await store.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await store.updateItem(current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(store.editingItem).toEqual(previous);
            expect(result).toEqual(false);
        });

        test('should not open updated item on success when nothing is opened', async() => {
            const item = new InterruptionItem(1);
            interruptionItemHttpStub.updateItem.resolves(item);
            expect(store.editingItem).toBeFalsy();

            const result = await store.updateItem(item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, item);
            expect(store.editingItem).toBeFalsy();
            expect(result).toEqual(true);
        });

        test('should not open updated item on success when another item is opened', async() => {
            const current = new InterruptionItem(1);
            const other = new InterruptionItem(2);
            interruptionItemHttpStub.getItem.resolves(other);
            interruptionItemHttpStub.updateItem.resolves(current);
            await store.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await store.updateItem(current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(store.editingItem).toEqual(other);
            expect(result).toEqual(true);
        });

        test('should open updated item on success when already opened', async() => {
            const previous: InterruptionItem = { ...new InterruptionItem(1), name: 'previous_name' };
            const current: InterruptionItem = { ...new InterruptionItem(1), name: 'current_name' };
            interruptionItemHttpStub.getItem.resolves(previous);
            interruptionItemHttpStub.updateItem.resolves(current);
            await store.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await store.updateItem(current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(store.editingItem).toEqual(current);
            expect(result).toEqual(true);
        });
    });

    describe('deleteItem', () => {
        beforeEach(async() => {
            await store.loadSummaries();
        });

        test('should do nothing on failure', async() => {
            const { id } = unresolved[1];
            interruptionItemHttpStub.deleteItem.resolves(false);

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(false);
        });

        test('should remove item on success', async() => {
            const { id } = unresolved[1];
            interruptionItemHttpStub.deleteItem.resolves(true);
            expect(store.editingItem).toBeFalsy();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.editingItem).toBeFalsy();
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length - 1);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(true);
        });

        test('should not close editing item when another item is opened', async() => {
            const { id } = unresolved[1];
            const other = new InterruptionItem(unresolved[2].id);
            interruptionItemHttpStub.getItem.resolves(other);
            interruptionItemHttpStub.deleteItem.resolves(true);
            await store.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.editingItem).toEqual(other);
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length - 1);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(true);
        });

        test('should close editing item when it is deleted', async() => {
            const { id } = unresolved[1];
            interruptionItemHttpStub.getItem.resolves(new InterruptionItem(id));
            interruptionItemHttpStub.deleteItem.resolves(true);
            await store.startItemEdit(id);
            jest.advanceTimersToNextTimer();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.editingItem).toBeFalsy();
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length - 1);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(true);
        });
    });

    describe('startItemCreate', () => {
        test('should open empty interruption item', () => {
            expect(store.editingItem).toBeFalsy();

            store.startItemCreate();
            jest.advanceTimersToNextTimer();

            expect(store.editingItem).toEqual(new InterruptionItem(-1));
        });
    });

    describe('startItemEdit', () => {
        test('should do nothing on failure', async() => {
            interruptionItemHttpStub.getItem.resolves(null);

            const result = await store.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.getItem, 5);
            expect(result).toEqual(false);
        });

        test('should open item on success', async() => {
            const item = new InterruptionItem(5);
            interruptionItemHttpStub.getItem.resolves(item);
            expect(store.editingItem).toBeFalsy();

            const result = await store.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.getItem, 5);
            expect(store.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('stopItemEdit', () => {
        test('should end interruption item edit', async() => {
            interruptionItemHttpStub.getItem.resolves(new InterruptionItem(1));
            await store.startItemEdit(1);
            jest.advanceTimersToNextTimer();
            expect(store.editingItem).not.toBeFalsy();

            store.stopItemEdit();

            expect(store.editingItem).toBeFalsy();
        });
    });
});
