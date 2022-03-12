import { setActivePinia, createPinia } from 'pinia';
import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { setServices as setEventStoreServices, useEventStore } from '../event/event.store';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { OngoingEventTimeSummaryDto } from '../../core/dtos/ongoing-event-time-summary-dto';
import { EventHistory } from '../../core/models/event/event-history';
import { TaskItem } from '../../core/models/task/task-item';
import { EventType } from '../../core/enums/event-type.enum';
import { EventHttpService } from '../../core/services/http/event-http/event-http.service';
import { TaskItemHttpService } from '../../core/services/http/task-item-http/task-item-http.service';

import { setServices as setTaskStoreServices, useTaskStore } from './task.store';

describe('task store unit test', () => {
    let store: ReturnType<typeof useTaskStore>;
    let taskItemHttpStub: SinonStubbedInstance<TaskItemHttpService>;
    let unresolved: TaskItemSummaryDto[];
    let resolved: TaskItemSummaryDto[];

    beforeEach(() => {
        taskItemHttpStub = createStubInstance(TaskItemHttpService);
        setTaskStoreServices(taskItemHttpStub);
        setActivePinia(createPinia());
        store = useTaskStore();
    });

    beforeEach(() => {
        unresolved = [
            { id: 1, name: 'name_1', effort: 1, progress: 0 } as TaskItemSummaryDto,
            { id: 4, name: 'name_4', effort: 1, progress: 0 } as TaskItemSummaryDto,
            { id: 3, name: 'name_3', effort: 5, progress: 0 } as TaskItemSummaryDto,
            { id: 2, name: 'name_2', effort: 13, progress: 0 } as TaskItemSummaryDto
        ];

        resolved = [
            { id: 41, name: 'name_41', effort: 5, progress: 0 } as TaskItemSummaryDto,
            { id: 60, name: 'name_60', effort: 13, progress: 0 } as TaskItemSummaryDto
        ];

        taskItemHttpStub.getSummaries.resolves({ unresolved: unresolved.slice(), resolved: resolved.slice() });
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

            expect(result.unresolved.map(_ => _.name)).toEqual(['name_1', 'name_2', 'name_3', 'name_4']);
            expect(result.resolved.map(_ => _.name)).toEqual(['name_41', 'name_60']);
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

        test('should return null when no task item is active', async() => {
            eventSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            await eventStore.loadOngoingEventSummary();
            await store.loadSummaries();

            expect(store.activeSummary).toBeNull();
        });

        test('should return active task item', async() => {
            eventSummary.unconcludedSinceStart.resourceId = unresolved[1].id;
            eventSummary.unconcludedSinceStart.eventType = EventType.Task;
            await eventStore.loadOngoingEventSummary();
            await store.loadSummaries();

            expect(store.activeSummary).toEqual(unresolved[1]);
        });
    });

    describe('loadSummaries', () => {
        test('should load task summaries', async() => {
            await store.loadSummaries();

            sinonExpect.calledOnce(taskItemHttpStub.getSummaries);
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
        });
    });

    describe('createItem', () => {
        test('should do nothing on failure', async() => {
            const item = new TaskItem(-1);
            taskItemHttpStub.createItem.resolves(null);
            expect(store.editingItem).toBeFalsy();

            const result = await store.createItem(item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.createItem, item);
            expect(store.editingItem).toBeFalsy();
            expect(result).toEqual(false);
        });

        test('should open created item on success', async() => {
            const item = new TaskItem(-1);
            taskItemHttpStub.createItem.resolves(item);
            expect(store.editingItem).toBeFalsy();

            const result = await store.createItem(item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.createItem, item);
            expect(store.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('updateItem', () => {
        test('should do nothing on failure', async() => {
            const previous: TaskItem = { ...new TaskItem(1), name: 'previous_name' };
            const current: TaskItem = { ...new TaskItem(1), name: 'current_name' };
            taskItemHttpStub.getItem.resolves(previous);
            taskItemHttpStub.updateItem.resolves(null);
            await store.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await store.updateItem(current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, current);
            expect(store.editingItem).toEqual(previous);
            expect(result).toEqual(false);
        });

        test('should not open updated item on success when nothing is opened', async() => {
            const item = new TaskItem(1);
            taskItemHttpStub.updateItem.resolves(item);
            expect(store.editingItem).toBeFalsy();

            const result = await store.updateItem(item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, item);
            expect(store.editingItem).toBeFalsy();
            expect(result).toEqual(true);
        });

        test('should not open updated item on success when another item is opened', async() => {
            const current = new TaskItem(1);
            const other = new TaskItem(2);
            taskItemHttpStub.getItem.resolves(other);
            taskItemHttpStub.updateItem.resolves(current);
            await store.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await store.updateItem(current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, current);
            expect(store.editingItem).toEqual(other);
            expect(result).toEqual(true);
        });

        test('should open updated item on success when already opened', async() => {
            const previous: TaskItem = { ...new TaskItem(1), name: 'previous_name' };
            const current: TaskItem = { ...new TaskItem(1), name: 'current_name' };
            taskItemHttpStub.getItem.resolves(previous);
            taskItemHttpStub.updateItem.resolves(current);
            await store.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await store.updateItem(current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, current);
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
            taskItemHttpStub.deleteItem.resolves(false);

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(false);
        });

        test('should remove item on success', async() => {
            const { id } = unresolved[1];
            taskItemHttpStub.deleteItem.resolves(true);
            expect(store.editingItem).toBeFalsy();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.editingItem).toBeFalsy();
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length - 1);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(true);
        });

        test('should not close editing item when another item is opened', async() => {
            const { id } = unresolved[1];
            const other = new TaskItem(unresolved[2].id);
            taskItemHttpStub.getItem.resolves(other);
            taskItemHttpStub.deleteItem.resolves(true);
            await store.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.editingItem).toEqual(other);
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length - 1);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(true);
        });

        test('should close editing item when it is deleted', async() => {
            const { id } = unresolved[1];
            taskItemHttpStub.getItem.resolves(new TaskItem(id));
            taskItemHttpStub.deleteItem.resolves(true);
            await store.startItemEdit(id);
            jest.advanceTimersToNextTimer();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.editingItem).toBeFalsy();
            expect(store.filteredSummaries('').unresolved.length).toEqual(unresolved.length - 1);
            expect(store.filteredSummaries('').resolved.length).toEqual(resolved.length);
            expect(result).toEqual(true);
        });
    });

    describe('startItemCreate', () => {
        test('should open empty task item', () => {
            expect(store.editingItem).toBeFalsy();

            store.startItemCreate();
            jest.advanceTimersToNextTimer();

            expect(store.editingItem).toEqual(new TaskItem(-1));
        });
    });

    describe('startItemEdit', () => {
        test('should do nothing on failure', async() => {
            taskItemHttpStub.getItem.resolves(null);

            const result = await store.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.getItem, 5);
            expect(result).toEqual(false);
        });

        test('should open item on success', async() => {
            const item = new TaskItem(5);
            taskItemHttpStub.getItem.resolves(item);
            expect(store.editingItem).toBeFalsy();

            const result = await store.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.getItem, 5);
            expect(store.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('stopItemEdit', () => {
        test('should end task item edit', async() => {
            taskItemHttpStub.getItem.resolves(new TaskItem(1));
            await store.startItemEdit(1);
            jest.advanceTimersToNextTimer();
            expect(store.editingItem).not.toBeFalsy();

            store.stopItemEdit();

            expect(store.editingItem).toBeFalsy();
        });
    });
});
