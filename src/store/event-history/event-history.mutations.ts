import { MutationTree } from 'vuex';

import { EventHistory } from '../../core/models/event-history/event-history';

import { IState } from './event-history.state';

export enum MutationKey {
    SetLastHistory = 'set_last_history'
}

export type Mutations = {
    [MutationKey.SetLastHistory](state: IState, history: EventHistory | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetLastHistory](state: IState, history: EventHistory | null): void {
        state.lastHistory = history;
    }
};
