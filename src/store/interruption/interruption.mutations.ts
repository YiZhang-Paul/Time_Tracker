import { MutationTree } from 'vuex';

import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';

import { IState } from './interruption.state';

export enum MutationKey {
    SetSummaries = 'set_summaries',
    SetEditingItem = 'set_editing_item'
}

export type Mutations = {
    [MutationKey.SetSummaries](state: IState, summaries: InterruptionItemSummaryDto[]): void;
    [MutationKey.SetEditingItem](state: IState, item: InterruptionItem | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetSummaries](state: IState, summaries: InterruptionItemSummaryDto[]): void {
        state.summaries = summaries.slice();
    },
    [MutationKey.SetEditingItem](state: IState, item: InterruptionItem | null): void {
        state.editingItem = item;
    }
};
