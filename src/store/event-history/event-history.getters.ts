import { GetterTree } from 'vuex';

import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event-history.state';

const dayStart = new Date(new Date().setHours(0, 0, 0, 0));

export enum GetterKey {
    IsIdling = 'is_idling',
    IsWorking = 'is_working',
    UnrecordedIdlingDuration = 'unrecorded_idling_duration',
    UnrecordedWorkingDuration = 'unrecorded_working_duration'
}

export type Getters = {
    [GetterKey.IsIdling](state: IState): boolean;
    [GetterKey.IsWorking](state: IState): boolean;
    [GetterKey.UnrecordedIdlingDuration](state: IState): number;
    [GetterKey.UnrecordedWorkingDuration](state: IState): number;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.IsIdling]: (state: IState): boolean => {
        if (!state.lastUpdated) {
            return false;
        }

        return !state.lastHistory || state.lastHistory.eventType === EventType.Idling;
    },
    [GetterKey.IsWorking]: (state: IState): boolean => {
        if (!state.lastUpdated) {
            return false;
        }

        return Boolean(state.lastHistory) && state.lastHistory!.eventType !== EventType.Idling;
    },
    [GetterKey.UnrecordedIdlingDuration]: (state: IState): number => {
        const isWorking = state.lastHistory && state.lastHistory.eventType !== EventType.Idling;

        if (!state.lastUpdated || isWorking) {
            return 0;
        }

        const start = state.lastHistory ? new Date(state.lastHistory.timestamp) : dayStart;

        return Date.now() - start.getTime();
    },
    [GetterKey.UnrecordedWorkingDuration]: (state: IState): number => {
        const isIdling = !state.lastHistory || state.lastHistory.eventType === EventType.Idling;

        if (!state.lastUpdated || isIdling) {
            return 0;
        }

        return Date.now() - new Date(state.lastHistory!.timestamp).getTime();
    }
};
