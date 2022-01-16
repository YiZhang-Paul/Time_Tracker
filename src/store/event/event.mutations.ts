import { MutationTree } from 'vuex';

import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';

import { IState } from './event.state';

export enum MutationKey {
    SetOngoingEventSummary = 'set_ongoing_event_summary'
}

export type Mutations = {
    [MutationKey.SetOngoingEventSummary](state: IState, summary: OngoingEventTimeSummary | null): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.SetOngoingEventSummary](state: IState, summary: OngoingEventTimeSummary | null): void {
        state.ongoingEventSummary = summary;
    }
};
