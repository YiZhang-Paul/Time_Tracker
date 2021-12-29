import { GetterTree } from 'vuex';

import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';

import { IState } from './task.state';

export enum GetterKey {
    Summaries = 'summaries',
    EditingItem = 'editing_item'
}

export type Getters = {
    [GetterKey.Summaries](state: IState): TaskItemSummaryDto[];
    [GetterKey.EditingItem](state: IState): TaskItem | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.Summaries]: (state: IState): TaskItemSummaryDto[] => state.summaries.slice().sort((a, b) => a.id - b.id),
    [GetterKey.EditingItem]: (state: IState): TaskItem | null => state.editingItem
};
