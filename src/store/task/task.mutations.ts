import { MutationTree } from 'vuex';

import { TaskItem } from '../../core/models/task/task-item';

import { IState } from './task.state';

export enum MutationKey {
    SetTaskItems = 'set_task_items'
}

export type Mutations = {
    [MutationKey.SetTaskItems](state: IState, items: TaskItem[]): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetTaskItems](state: IState, items: TaskItem[]): void {
        state.items = items.slice();
    }
};
