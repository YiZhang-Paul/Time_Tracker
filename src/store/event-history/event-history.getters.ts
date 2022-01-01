import { GetterTree } from 'vuex';

import { EventHistory } from '../../core/models/event-history/event-history';

import { IState } from './event-history.state';

export enum GetterKey {
    LastHistory = 'last_history'
}

export type Getters = {
    [GetterKey.LastHistory](state: IState): EventHistory | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.LastHistory]: (state: IState): EventHistory | null => state.lastHistory;
};
