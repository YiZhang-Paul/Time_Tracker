import { MutationTree } from 'vuex';

import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';

import { IState } from './task.state';

export enum MutationKey {
    SetTaskItems = 'set_task_items',
    DeleteTaskItem = 'delete_task_item',
    SetEditingItem = 'set_editing_item'
}

export type Mutations = {
    [MutationKey.SetTaskItems](state: IState, items: TaskItemSummaryDto[]): void;
    [MutationKey.DeleteTaskItem](state: IState, id: number): void;
    [MutationKey.SetEditingItem](state: IState, item: TaskItem | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetTaskItems](state: IState, items: TaskItemSummaryDto[]): void {
        state.items = items.slice();
    },
    [MutationKey.DeleteTaskItem](state: IState, id: number): void {
        state.items = state.items.filter(_ => _.id !== id);
    },
    [MutationKey.SetEditingItem](state: IState, item: TaskItem | null): void {
        state.editingItem = item;
    }
};
