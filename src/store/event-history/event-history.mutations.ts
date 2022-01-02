import { MutationTree } from 'vuex';

import { EventHistory } from '../../core/models/event-history/event-history';

import { IState } from './event-history.state';

export enum MutationKey {
    SetLastHistory = 'set_last_history',
    SetLastUpdated = 'set_last_updated'
}

export type Mutations = {
    [MutationKey.SetLastHistory](state: IState, history: EventHistory | null): void;
    [MutationKey.SetLastUpdated](state: IState): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetLastHistory](state: IState, history: EventHistory | null): void {
        state.lastHistory = history;
    },
    [MutationKey.SetLastUpdated](state: IState): void {
        state.lastUpdated = new Date();
    }
};
