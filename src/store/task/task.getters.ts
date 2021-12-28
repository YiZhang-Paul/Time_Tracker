import { GetterTree } from 'vuex';

import { TaskItem } from '../../core/models/task/task-item';

import { IState } from './task.state';

export enum GetterKey {
    Items = 'task_items',
    EditingItem = 'editing_item'
}

export type Getters = {
    [GetterKey.Items](state: IState): TaskItem[];
    [GetterKey.EditingItem](state: IState): TaskItem | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.Items]: (state: IState): TaskItem[] => state.items.slice().sort((a, b) => a.id - b.id),
    [GetterKey.EditingItem]: (state: IState): TaskItem | null => state.editingItem
};
