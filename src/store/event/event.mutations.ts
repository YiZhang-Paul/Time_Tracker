import { MutationTree } from 'vuex';

import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';

import { IState } from './event.state';

export enum MutationKey {
    SetOngoingTimeSummary = 'set_ongoing_time_summary'
}

export type Mutations = {
    [MutationKey.SetOngoingTimeSummary](state: IState, summary: OngoingEventTimeSummary | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetOngoingTimeSummary](state: IState, summary: OngoingEventTimeSummary | null): void {
        state.ongoingTimeSummary = summary;
    }
};
