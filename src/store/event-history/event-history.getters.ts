import { GetterTree } from 'vuex';

import { EventHistory } from '../../core/models/event-history/event-history';
import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event-history.state';

const dayStart = new Date(new Date().setHours(0, 0, 0, 0));

export enum GetterKey {
    IsIdling = 'is_idling',
    IsWorking = 'is_working',
    IsActiveWorkItem = 'is_active_work_item',
    UnrecordedIdlingDuration = 'unrecorded_idling_duration',
    UnrecordedWorkingDuration = 'unrecorded_working_duration',
    LastHistory = 'last_history'
}

export type Getters = {
    [GetterKey.IsIdling](state: IState): boolean;
    [GetterKey.IsWorking](state: IState): boolean;
    [GetterKey.IsActiveWorkItem](state: IState): (type: EventType, id: number) => boolean;
    [GetterKey.UnrecordedIdlingDuration](state: IState): number;
    [GetterKey.UnrecordedWorkingDuration](state: IState): number;
    [GetterKey.LastHistory](state: IState): EventHistory | null;
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
    [GetterKey.IsActiveWorkItem]: (state: IState) => (type: EventType, id: number) => {
        const { lastUpdated, lastHistory } = state;

        if (!lastUpdated || !lastHistory) {
            return false;
        }

        return lastHistory.eventType === type && lastHistory.resourceId === id;
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
    },
    [GetterKey.LastHistory]: (state: IState): EventHistory | null => state.lastHistory
};
