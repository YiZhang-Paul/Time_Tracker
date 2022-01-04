import { MutationTree } from 'vuex';

import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';

import { IState } from './task.state';

export enum MutationKey {
    SetSummaries = 'set_summaries',
    DeleteSummary = 'delete_summary',
    SetEditingItem = 'set_editing_item'
}

export type Mutations = {
    [MutationKey.SetSummaries](state: IState, summaries: TaskItemSummaryDto[]): void;
    [MutationKey.DeleteSummary](state: IState, id: number): void;
    [MutationKey.SetEditingItem](state: IState, item: TaskItem | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetSummaries](state: IState, summaries: TaskItemSummaryDto[]): void {
        state.summaries = summaries.slice();
    },
    [MutationKey.DeleteSummary](state: IState, id: number): void {
        state.summaries = state.summaries.filter(_ => _.id !== id);
    },
    [MutationKey.SetEditingItem](state: IState, item: TaskItem | null): void {
        state.editingItem = item;
    }
};
