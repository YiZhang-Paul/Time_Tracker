import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { TaskItemSummaryDto } from '../../../dtos/task-item-summary-dto';
import { TaskItem } from '../../../models/task/task-item';
import { TaskItemHttpService } from '../../http/task-item-http/task-item-http.service';

import { TaskStateService } from './task-state.service';

describe('task state service unit test', () => {
    let service: TaskStateService;
    let taskItemHttpStub: SinonStubbedInstance<TaskItemHttpService>;
    let summaries: TaskItemSummaryDto[];

    beforeEach(() => {
        taskItemHttpStub = createStubInstance(TaskItemHttpService);

        container
            .rebind<TaskItemHttpService>(types.TaskItemHttpService)
            .toConstantValue(taskItemHttpStub);

        container
            .rebind<ReturnType<typeof createStore>>(types.Store)
            .toDynamicValue(() => createStore())
            .inTransientScope();

        service = container.get<TaskStateService>(types.TaskStateService);
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

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });

    describe('searchSummaries', () => {
        beforeEach(async() => {
            await service.loadSummaries();
        });

        test('should return filtered summaries', () => {
            let result = service.searchSummaries('me_5');
            expect(result.map(_ => _.name)).toEqual([]);

            result = service.searchSummaries('me_3');
            expect(result.map(_ => _.name)).toEqual(['name_3']);

            result = service.searchSummaries('ME_4');
            expect(result.map(_ => _.name)).toEqual(['name_4']);
        });

        test('should return sorted summaries', () => {
            const result = service.searchSummaries('');

            expect(result.map(_ => _.name)).toEqual(['name_1', 'name_2', 'name_3', 'name_4']);
        });
    });

    describe('activeSummary', () => {
        test('should return null when not working', async() => {
            await service.loadSummaries();

            expect(service.activeSummary).toBeNull();
        });
    });

    describe('loadSummaries', () => {
        test('should load task summaries', async() => {
            await service.loadSummaries();

            sinonExpect.calledOnce(taskItemHttpStub.getSummaries);
            expect(service.searchSummaries('').length).toEqual(summaries.length);
        });
    });

    describe('createItem', () => {
        test('should do nothing on failure', async() => {
            const item = new TaskItem(-1);
            taskItemHttpStub.createItem.resolves(null);
            expect(service.editingItem).toBeFalsy();

            const result = await service.createItem(item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.createItem, item);
            expect(service.editingItem).toBeFalsy();
            expect(result).toEqual(false);
        });

        test('should open created item on success', async() => {
            const item = new TaskItem(-1);
            taskItemHttpStub.createItem.resolves(item);
            expect(service.editingItem).toBeFalsy();

            const result = await service.createItem(item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.createItem, item);
            expect(service.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('updateItem', () => {
        test('should do nothing on failure', async() => {
            const previous: TaskItem = { ...new TaskItem(1), name: 'previous_name' };
            const current: TaskItem = { ...new TaskItem(1), name: 'current_name' };
            taskItemHttpStub.getItem.resolves(previous);
            taskItemHttpStub.updateItem.resolves(null);
            await service.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await service.updateItem(current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, current);
            expect(service.editingItem).toEqual(previous);
            expect(result).toEqual(false);
        });

        test('should not open updated item on success when nothing is opened', async() => {
            const item = new TaskItem(1);
            taskItemHttpStub.updateItem.resolves(item);
            expect(service.editingItem).toBeFalsy();

            const result = await service.updateItem(item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, item);
            expect(service.editingItem).toBeFalsy();
            expect(result).toEqual(true);
        });

        test('should not open updated item on success when another item is opened', async() => {
            const current = new TaskItem(1);
            const other = new TaskItem(2);
            taskItemHttpStub.getItem.resolves(other);
            taskItemHttpStub.updateItem.resolves(current);
            await service.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await service.updateItem(current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, current);
            expect(service.editingItem).toEqual(other);
            expect(result).toEqual(true);
        });

        test('should open updated item on success when already opened', async() => {
            const previous: TaskItem = { ...new TaskItem(1), name: 'previous_name' };
            const current: TaskItem = { ...new TaskItem(1), name: 'current_name' };
            taskItemHttpStub.getItem.resolves(previous);
            taskItemHttpStub.updateItem.resolves(current);
            await service.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await service.updateItem(current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateItem, current);
            expect(service.editingItem).toEqual(current);
            expect(result).toEqual(true);
        });
    });

    describe('deleteItem', () => {
        beforeEach(async() => {
            await service.loadSummaries();
        });

        test('should do nothing on failure', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.deleteItem.resolves(false);

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(service.searchSummaries('').length).toEqual(summaries.length);
            expect(result).toEqual(false);
        });

        test('should remove item on success', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.deleteItem.resolves(true);
            expect(service.editingItem).toBeFalsy();

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(service.editingItem).toBeFalsy();
            expect(service.searchSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should not close editing item when another item is opened', async() => {
            const { id } = summaries[1];
            const other = new TaskItem(summaries[2].id);
            taskItemHttpStub.getItem.resolves(other);
            taskItemHttpStub.deleteItem.resolves(true);
            await service.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(service.editingItem).toEqual(other);
            expect(service.searchSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should close editing item when it is deleted', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.getItem.resolves(new TaskItem(id));
            taskItemHttpStub.deleteItem.resolves(true);
            await service.startItemEdit(id);
            jest.advanceTimersToNextTimer();

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteItem, id);
            expect(service.editingItem).toBeFalsy();
            expect(service.searchSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });
    });

    describe('startItemCreate', () => {
        test('should open empty task item', () => {
            expect(service.editingItem).toBeFalsy();

            service.startItemCreate();
            jest.advanceTimersToNextTimer();

            expect(service.editingItem).toEqual(new TaskItem(-1));
        });
    });

    describe('startItemEdit', () => {
        test('should do nothing on failure', async() => {
            taskItemHttpStub.getItem.resolves(null);

            const result = await service.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.getItem, 5);
            expect(result).toEqual(false);
        });

        test('should open item on success', async() => {
            const item = new TaskItem(5);
            taskItemHttpStub.getItem.resolves(item);
            expect(service.editingItem).toBeFalsy();

            const result = await service.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.getItem, 5);
            expect(service.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('stopItemEdit', () => {
        test('should end task item edit', async() => {
            taskItemHttpStub.getItem.resolves(new TaskItem(1));
            await service.startItemEdit(1);
            jest.advanceTimersToNextTimer();
            expect(service.editingItem).not.toBeFalsy();

            service.stopItemEdit();

            expect(service.editingItem).toBeFalsy();
        });
    });
});
