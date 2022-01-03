import { MutationTree } from 'vuex';

import { EventTimeDistribution } from '../../core/models/event-history/event-time-distribution';

import { IState } from './event-history.state';

export enum MutationKey {
    SetCurrentTimeDistribution = 'set_current_time_distribution'
}

export type Mutations = {
    [MutationKey.SetCurrentTimeDistribution](state: IState, distribution: EventTimeDistribution | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetCurrentTimeDistribution](state: IState, distribution: EventTimeDistribution | null): void {
        state.currentTimeDistribution = distribution;
    }
};
