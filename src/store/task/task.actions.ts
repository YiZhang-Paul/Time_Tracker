import { ActionContext, ActionTree } from 'vuex';

import { TaskItem } from '../../core/models/task/task-item';
import { TaskItemHttpService } from '../../core/services/http/task-item-http/task-item-http.service';

import { IState } from './task.state';
import { Mutations, MutationKey } from './task.mutations';

let taskItemHttpService: TaskItemHttpService;

export const setActionServices = (taskItemHttp: TaskItemHttpService): void => {
    taskItemHttpService = taskItemHttp;
};

export enum ActionKey {
    LoadTaskItems = 'load_task_items',
    StartTaskItemEdit = 'start_task_item_edit',
    EndTaskItemEdit = 'end_task_item_edit'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadTaskItems](context: ActionAugments): Promise<void>;
    [ActionKey.StartTaskItemEdit](context: ActionAugments): void;
    [ActionKey.EndTaskItemEdit](context: ActionAugments): void;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadTaskItems](context: ActionAugments): Promise<void> {
        context.commit(MutationKey.SetTaskItems, await taskItemHttpService.getTaskItems());
    },
    [ActionKey.StartTaskItemEdit](context: ActionAugments): void {
        context.commit(MutationKey.SetEditingItem, new TaskItem(-1));
    },
    [ActionKey.EndTaskItemEdit](context: ActionAugments): void {
        context.commit(MutationKey.SetEditingItem, null);
    }
};
