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
    LoadSummaries = 'load_summaries',
    CreateItem = 'create_item',
    UpdateItem = 'update_item',
    DeleteItem = 'delete_item',
    StartItemCreate = 'start_item_create',
    StartItemEdit = 'start_item_edit',
    StopItemEdit = 'stop_item_edit'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload?: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadSummaries](context: ActionAugments): Promise<void>;
    [ActionKey.CreateItem](context: ActionAugments, item: TaskItem): Promise<boolean>;
    [ActionKey.UpdateItem](context: ActionAugments, item: TaskItem): Promise<boolean>;
    [ActionKey.DeleteItem](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartItemCreate](context: ActionAugments): void;
    [ActionKey.StartItemEdit](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StopItemEdit](context: ActionAugments): void;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadSummaries](context: ActionAugments): Promise<void> {
        context.commit(MutationKey.SetSummaries, await taskItemHttpService.getSummaries());
    },
    async [ActionKey.CreateItem](context: ActionAugments, item: TaskItem): Promise<boolean> {
        const created = await taskItemHttpService.createItem(item);

        if (created) {
            context.commit(MutationKey.SetEditingItem, created);
        }

        return Boolean(created);
    },
    async [ActionKey.UpdateItem](context: ActionAugments, item: TaskItem): Promise<boolean> {
        const updated = await taskItemHttpService.updateItem(item);

        if (updated && context.getters[GetterKey.EditingItem]?.id === updated.id) {
            context.commit(MutationKey.SetEditingItem, updated);
        }

        return Boolean(updated);
    },
    async [ActionKey.DeleteItem](context: ActionAugments, id: number): Promise<boolean> {
        const isDeleted = await taskItemHttpService.deleteItem(id);

        if (!isDeleted) {
            return false;
        }

        if (context.getters[GetterKey.EditingItem]?.id === id) {
            context.dispatch(ActionKey.StopItemEdit);
        }

        context.commit(MutationKey.DeleteSummary, id);

        return true;
    },
    [ActionKey.StartItemCreate](context: ActionAugments): void {
        context.dispatch(ActionKey.StopItemEdit);
        setTimeout(() => context.commit(MutationKey.SetEditingItem, new TaskItem(-1)));
    },
    async [ActionKey.StartItemEdit](context: ActionAugments, id: number): Promise<boolean> {
        const item = await taskItemHttpService.getItem(id);

        if (item) {
            context.dispatch(ActionKey.StopItemEdit);
            setTimeout(() => context.commit(MutationKey.SetEditingItem, item));
        }

        return Boolean(item);
    },
    [ActionKey.StopItemEdit](context: ActionAugments): void {
        context.commit(MutationKey.SetEditingItem, null);
    }
};
