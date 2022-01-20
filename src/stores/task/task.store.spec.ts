import { setActivePinia, createPinia } from 'pinia';
import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';
import { TaskItemHttpService } from '../../core/services/http/task-item-http/task-item-http.service';

import { setServices, useTaskStore } from './task.store';

describe('task store unit test', () => {
    let store: ReturnType<typeof useTaskStore>;
    let taskItemHttpStub: SinonStubbedInstance<TaskItemHttpService>;
    let summaries: TaskItemSummaryDto[];

    beforeEach(() => {
        taskItemHttpStub = createStubInstance(TaskItemHttpService);
        setServices(taskItemHttpStub);
        setActivePinia(createPinia());
        store = useTaskStore();
    });

    beforeEach(() => {
        summaries = [
            { id: 1, name: 'name_1', effort: 1 },
            { id: 4, name: 'name_4', effort: 1 },
            { id: 3, name: 'name_3', effort: 5 },
            { id: 2, name: 'name_2', effort: 13 }
        ];

        taskItemHttpStub.getSummaries.resolves(summaries);
    });

    describe('filteredSummaries', () => {
        beforeEach(async() => {
            await store.loadSummaries();
        });

        test('should return filtered summaries', () => {
            let result = store.filteredSummaries('me_5');
            expect(result.map(_ => _.name)).toEqual([]);

            result = store.filteredSummaries('me_3');
            expect(result.map(_ => _.name)).toEqual(['name_3']);

            result = store.filteredSummaries('ME_4');
            expect(result.map(_ => _.name)).toEqual(['name_4']);
        });

        test('should return sorted summaries', () => {
            const result = store.filteredSummaries('');

            expect(result.map(_ => _.name)).toEqual(['name_1', 'name_2', 'name_3', 'name_4']);
        });
    });

    describe('activeSummary', () => {
        test('should return null when not working', async() => {
            await store.loadSummaries();

            expect(store.activeSummary).toBeNull();
        });
    });

    describe('loadSummaries', () => {
        test('should load task summaries', async() => {
            await store.loadSummaries();

            sinonExpect.calledOnce(taskItemHttpStub.getSummaries);
            expect(store.filteredSummaries('').length).toEqual(summaries.length);
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
            const { id } = summaries[1];
            taskItemHttpStub.deleteItem.resolves(false);

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.filteredSummaries('').length).toEqual(summaries.length);
            expect(result).toEqual(false);
        });

        test('should remove item on success', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.deleteItem.resolves(true);
            expect(store.editingItem).toBeFalsy();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.editingItem).toBeFalsy();
            expect(store.filteredSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should not close editing item when another item is opened', async() => {
            const { id } = summaries[1];
            const other = new TaskItem(summaries[2].id);
            taskItemHttpStub.getItem.resolves(other);
            taskItemHttpStub.deleteItem.resolves(true);
            await store.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.editingItem).toEqual(other);
            expect(store.filteredSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should close editing item when it is deleted', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.getItem.resolves(new TaskItem(id));
            taskItemHttpStub.deleteItem.resolves(true);
            await store.startItemEdit(id);
            jest.advanceTimersToNextTimer();

            const result = await store.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(store.editingItem).toBeFalsy();
            expect(store.filteredSummaries('').length).toEqual(summaries.length - 1);
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
