import { GetterTree } from 'vuex';

import { InterruptionItem } from '../../core/models/interruption/interruption-item';

import { IState } from './interruption.state';

export enum GetterKey {
    EditingItem = 'editing_item'
}

export type Getters = {
    [GetterKey.EditingItem](state: IState): InterruptionItem | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.EditingItem]: (state: IState): InterruptionItem | null => state.editingItem
};
