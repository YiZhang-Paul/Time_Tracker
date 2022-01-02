import { GetterTree } from 'vuex';

import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event-history.state';

export enum GetterKey {
    IsIdling = 'is_idling',
    IsWorking = 'is_working'
}

export type Getters = {
    [GetterKey.IsIdling](state: IState): boolean;
    [GetterKey.IsWorking](state: IState): boolean;
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
    }
};
