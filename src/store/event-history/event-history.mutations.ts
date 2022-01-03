import { MutationTree } from 'vuex';

import { OngoingEventTimeDistribution } from '../../core/models/event-history/ongoing-event-time-distribution';

import { IState } from './event-history.state';

export enum MutationKey {
    SetOngoingTimeDistribution = 'set_ongoing_time_distribution'
}

export type Mutations = {
    [MutationKey.SetOngoingTimeDistribution](state: IState, distribution: OngoingEventTimeDistribution | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetOngoingTimeDistribution](state: IState, distribution: OngoingEventTimeDistribution | null): void {
        state.ongoingTimeDistribution = distribution;
    }
};
