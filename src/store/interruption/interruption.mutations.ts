import { MutationTree } from 'vuex';

import { InterruptionItem } from '../../core/models/interruption/interruption-item';

import { IState } from './interruption.state';

export enum MutationKey {
    SetEditingItem = 'set_editing_item'
}

export type Mutations = {
    [MutationKey.SetEditingItem](state: IState, item: InterruptionItem | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetEditingItem](state: IState, item: InterruptionItem | null): void {
        state.editingItem = item;
    }
};
