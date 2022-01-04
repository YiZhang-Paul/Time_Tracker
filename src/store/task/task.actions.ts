import { ActionContext, ActionTree } from 'vuex';

import { TaskItem } from '../../core/models/task/task-item';
import { TaskItemHttpService } from '../../core/services/http/task-item-http/task-item-http.service';

import { IState } from './task.state';
import { GetterKey } from './task.getters';
import { Mutations, MutationKey } from './task.mutations';

let taskItemHttpService: TaskItemHttpService;

export const setActionServices = (taskItemHttp: TaskItemHttpService): void => {
    taskItemHttpService = taskItemHttp;
};

export enum ActionKey {
    LoadTaskSummaries = 'load_task_summaries',
    CreateTaskItem = 'create_task_item',
    UpdateTaskItem = 'update_task_item',
    DeleteTaskItem = 'delete_task_item',
    StartTaskItemCreation = 'start_task_item_creation',
    StartTaskItemEdit = 'start_task_item_edit',
    EndTaskItemEdit = 'end_task_item_edit'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload?: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadTaskSummaries](context: ActionAugments): Promise<void>;
    [ActionKey.CreateTaskItem](context: ActionAugments, item: TaskItem): Promise<boolean>;
    [ActionKey.UpdateTaskItem](context: ActionAugments, item: TaskItem): Promise<boolean>;
    [ActionKey.DeleteTaskItem](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartTaskItemCreation](context: ActionAugments): void;
    [ActionKey.StartTaskItemEdit](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.EndTaskItemEdit](context: ActionAugments): void;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadTaskSummaries](context: ActionAugments): Promise<void> {
        context.commit(MutationKey.SetSummaries, await taskItemHttpService.getTaskSummaries());
    },
    async [ActionKey.CreateTaskItem](context: ActionAugments, item: TaskItem): Promise<boolean> {
        const created = await taskItemHttpService.createTaskItem(item);

        if (created) {
            context.commit(MutationKey.SetEditingItem, created);
        }

        return Boolean(created);
    },
    async [ActionKey.UpdateTaskItem](context: ActionAugments, item: TaskItem): Promise<boolean> {
        const updated = await taskItemHttpService.updateTaskItem(item);

        if (updated && context.getters[GetterKey.EditingItem]?.id === updated.id) {
            context.commit(MutationKey.SetEditingItem, updated);
        }

        return Boolean(updated);
    },
    async [ActionKey.DeleteTaskItem](context: ActionAugments, id: number): Promise<boolean> {
        const isDeleted = await taskItemHttpService.deleteTaskItem(id);

        if (!isDeleted) {
            return false;
        }

        if (context.getters[GetterKey.EditingItem]?.id === id) {
            context.dispatch(ActionKey.EndTaskItemEdit);
        }

        context.commit(MutationKey.DeleteSummary, id);

        return true;
    },
    [ActionKey.StartTaskItemCreation](context: ActionAugments): void {
        context.dispatch(ActionKey.EndTaskItemEdit);
        setTimeout(() => context.commit(MutationKey.SetEditingItem, new TaskItem(-1)));
    },
    async [ActionKey.StartTaskItemEdit](context: ActionAugments, id: number): Promise<boolean> {
        const item = await taskItemHttpService.getTaskItem(id);

        if (item) {
            context.dispatch(ActionKey.EndTaskItemEdit);
            setTimeout(() => context.commit(MutationKey.SetEditingItem, item));
        }

        return Boolean(item);
    },
    [ActionKey.EndTaskItemEdit](context: ActionAugments): void {
        context.commit(MutationKey.SetEditingItem, null);
    }
};
