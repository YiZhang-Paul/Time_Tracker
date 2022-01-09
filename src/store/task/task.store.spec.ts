import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { createStore } from '../../store';
import { GetterKey } from '../../store/task/task.getters';
import { ActionKey } from '../../store/task/task.actions';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { EventHistory } from '../../core/models/event/event-history';
import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
import { TaskItem } from '../../core/models/task/task-item';
import { EventType } from '../../core/enums/event-type.enum';
import { TaskItemHttpService } from '../../core/services/http/task-item-http/task-item-http.service';

describe('task store unit test', () => {
    let store: ReturnType<typeof createStore>;
    let taskItemHttpStub: SinonStubbedInstance<TaskItemHttpService>;
    let summaries: TaskItemSummaryDto[];

    beforeEach(() => {
        taskItemHttpStub = createStubInstance(TaskItemHttpService);

        container
            .rebind<TaskItemHttpService>(types.TaskItemHttpService)
            .toConstantValue(taskItemHttpStub as unknown as TaskItemHttpService);

        store = createStore();
    });

    beforeEach(() => {
        summaries = [
            { id: 1, name: 'name_1', effort: 1 },
            { id: 4, name: 'name_4', effort: 1 },
            { id: 3, name: 'name_3', effort: 5 },
            { id: 2, name: 'name_2', effort: 13 }
        ];

        taskItemHttpStub.getTaskSummaries.resolves(summaries);
    });

    describe(GetterKey.Summaries, () => {
        beforeEach(() => {
            store.task.commit(store.task.mutation.SetSummaries, summaries);
        });

        test('should return filtered summaries', () => {
            let result = store.task.getters(store.task.getter.Summaries)('me_5');
            expect(result.map(_ => _.name)).toEqual([]);

            result = store.task.getters(store.task.getter.Summaries)('me_3');
            expect(result.map(_ => _.name)).toEqual(['name_3']);

            result = store.task.getters(store.task.getter.Summaries)('ME_4');
            expect(result.map(_ => _.name)).toEqual(['name_4']);
        });

        test('should return sorted summaries', () => {
            const result = store.task.getters(store.task.getter.Summaries)('');

            expect(result.map(_ => _.name)).toEqual(['name_1', 'name_2', 'name_3', 'name_4']);
        });
    });

    describe(GetterKey.ActiveSummary, () => {
        beforeEach(() => {
            store.task.commit(store.task.mutation.SetSummaries, summaries);
        });

        test('should return null when not working', () => {
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, null);

            expect(store.task.getters(store.task.getter.ActiveSummary)).toBeNull();
        });

        test('should return null when no task item is active', () => {
            const summary = new OngoingEventTimeSummary();
            summary.unconcludedSinceStart = { ...new EventHistory(), eventType: EventType.Interruption, resourceId: 2 };
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, summary);

            expect(store.task.getters(store.task.getter.ActiveSummary)).toBeNull();
        });

        test('should return active summary found', () => {
            const summary = new OngoingEventTimeSummary();
            summary.unconcludedSinceStart = { ...new EventHistory(), eventType: EventType.Task, resourceId: 4 };
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, summary);

            expect(store.task.getters(store.task.getter.ActiveSummary)).toEqual(summaries[1]);
        });
    });

    describe(ActionKey.LoadTaskSummaries, () => {
        test('should load task summaries', async() => {
            await store.task.dispatch(store.task.action.LoadTaskSummaries);

            sinonExpect.calledOnce(taskItemHttpStub.getTaskSummaries);
            expect(store.task.getters(store.task.getter.Summaries)('').length).toEqual(summaries.length);
        });
    });

    describe(ActionKey.CreateTaskItem, () => {
        test('should do nothing on failure', async() => {
            const item = new TaskItem(-1);
            taskItemHttpStub.createTaskItem.resolves(null);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();

            const result = await store.task.dispatch(store.task.action.CreateTaskItem, item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.createTaskItem, item);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();
            expect(result).toEqual(false);
        });

        test('should open created item on success', async() => {
            const item = new TaskItem(-1);
            taskItemHttpStub.createTaskItem.resolves(item);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();

            const result = await store.task.dispatch(store.task.action.CreateTaskItem, item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.createTaskItem, item);
            expect(store.task.getters(store.task.getter.EditingItem)).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.UpdateTaskItem, () => {
        test('should do nothing on failure', async() => {
            const previous: TaskItem = { ...new TaskItem(1), name: 'previous_name' };
            const current: TaskItem = { ...new TaskItem(1), name: 'current_name' };
            taskItemHttpStub.updateTaskItem.resolves(null);
            store.task.commit(store.task.mutation.SetEditingItem, previous);

            const result = await store.task.dispatch(store.task.action.UpdateTaskItem, current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateTaskItem, current);
            expect(store.task.getters(store.task.getter.EditingItem)).toEqual(previous);
            expect(result).toEqual(false);
        });

        test('should not open updated item on success when nothing is opened', async() => {
            const item = new TaskItem(1);
            taskItemHttpStub.updateTaskItem.resolves(item);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();

            const result = await store.task.dispatch(store.task.action.UpdateTaskItem, item);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateTaskItem, item);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();
            expect(result).toEqual(true);
        });

        test('should not open updated item on success when another item is opened', async() => {
            const current = new TaskItem(1);
            const other = new TaskItem(2);
            taskItemHttpStub.updateTaskItem.resolves(current);
            store.task.commit(store.task.mutation.SetEditingItem, other);

            const result = await store.task.dispatch(store.task.action.UpdateTaskItem, current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateTaskItem, current);
            expect(store.task.getters(store.task.getter.EditingItem)).toEqual(other);
            expect(result).toEqual(true);
        });

        test('should open updated item on success when already opened', async() => {
            const previous: TaskItem = { ...new TaskItem(1), name: 'previous_name' };
            const current: TaskItem = { ...new TaskItem(1), name: 'current_name' };
            taskItemHttpStub.updateTaskItem.resolves(current);
            store.task.commit(store.task.mutation.SetEditingItem, previous);

            const result = await store.task.dispatch(store.task.action.UpdateTaskItem, current);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.updateTaskItem, current);
            expect(store.task.getters(store.task.getter.EditingItem)).toEqual(current);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.DeleteTaskItem, () => {
        beforeEach(() => {
            store.task.commit(store.task.mutation.SetSummaries, summaries.slice());
        });

        test('should do nothing on failure', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.deleteTaskItem.resolves(false);

            const result = await store.task.dispatch(store.task.action.DeleteTaskItem, id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteTaskItem, id);
            expect(store.task.getters(store.task.getter.Summaries)('').length).toEqual(summaries.length);
            expect(result).toEqual(false);
        });

        test('should remove item on success', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.deleteTaskItem.resolves(true);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();

            const result = await store.task.dispatch(store.task.action.DeleteTaskItem, id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteTaskItem, id);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();
            expect(store.task.getters(store.task.getter.Summaries)('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should not close editing item when another item is opened', async() => {
            const { id } = summaries[1];
            const other = new TaskItem(summaries[2].id);
            taskItemHttpStub.deleteTaskItem.resolves(true);
            store.task.commit(store.task.mutation.SetEditingItem, other);

            const result = await store.task.dispatch(store.task.action.DeleteTaskItem, id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteTaskItem, id);
            expect(store.task.getters(store.task.getter.EditingItem)).toEqual(other);
            expect(store.task.getters(store.task.getter.Summaries)('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should close editing item when it is deleted', async() => {
            const { id } = summaries[1];
            taskItemHttpStub.deleteTaskItem.resolves(true);
            store.task.commit(store.task.mutation.SetEditingItem, new TaskItem(id));

            const result = await store.task.dispatch(store.task.action.DeleteTaskItem, id);

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.deleteTaskItem, id);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();
            expect(store.task.getters(store.task.getter.Summaries)('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartTaskItemCreation, () => {
        test('should open empty task item', () => {
            store.task.commit(store.task.mutation.SetEditingItem, new TaskItem(1));

            store.task.dispatch(store.task.action.StartTaskItemCreation);
            jest.advanceTimersToNextTimer();

            expect(store.task.getters(store.task.getter.EditingItem)).toEqual(new TaskItem(-1));
        });
    });

    describe(ActionKey.StartTaskItemEdit, () => {
        test('should do nothing on failure', async() => {
            taskItemHttpStub.getTaskItem.resolves(null);

            const result = await store.task.dispatch(store.task.action.StartTaskItemEdit, 5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.getTaskItem, 5);
            expect(result).toEqual(false);
        });

        test('should open item on success', async() => {
            const item = new TaskItem(5);
            taskItemHttpStub.getTaskItem.resolves(item);
            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();

            const result = await store.task.dispatch(store.task.action.StartTaskItemEdit, 5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(taskItemHttpStub.getTaskItem, 5);
            expect(store.task.getters(store.task.getter.EditingItem)).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.EndTaskItemEdit, () => {
        test('should end task item edit', () => {
            store.task.commit(store.task.mutation.SetEditingItem, new TaskItem(1));

            store.task.dispatch(store.task.action.EndTaskItemEdit);

            expect(store.task.getters(store.task.getter.EditingItem)).toBeFalsy();
        });
    });
});
