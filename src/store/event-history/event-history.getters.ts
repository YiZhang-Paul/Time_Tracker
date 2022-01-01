import { GetterTree } from 'vuex';

import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event-history.state';

export enum GetterKey {
    IsIdling = 'is_idling'
}

export type Getters = {
    [GetterKey.IsIdling](state: IState): boolean;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.IsIdling]: (state: IState): boolean => {
        return !state.lastHistory || state.lastHistory.eventType === EventType.Idling;
    }
};
