import { GetterTree } from 'vuex';

import { TaskItem } from '../../core/models/task/task-item';

import { IState } from './task.state';

export enum GetterKey {
    TaskItems = 'task_items'
}

export type Getters = {
    [GetterKey.TaskItems](state: IState): TaskItem[];
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.TaskItems]: (state: IState): TaskItem[] => state.items.slice().sort((a, b) => a.id - b.id)
};
