import { GetterTree } from 'vuex';

import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';

import { IState } from './interruption.state';

export enum GetterKey {
    Summaries = 'summaries',
    EditingItem = 'editing_item'
}

export type Getters = {
    [GetterKey.Summaries](state: IState): (searchText: string) => InterruptionItemSummaryDto[];
    [GetterKey.EditingItem](state: IState): InterruptionItem | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.Summaries]: (state: IState) => (searchText: string) => {
        const summaries = state.summaries.filter(_ => _.name.toLowerCase().includes(searchText));

        return summaries.sort((a, b) => b.priority - a.priority);
    },
    [GetterKey.EditingItem]: (state: IState): InterruptionItem | null => state.editingItem
};
