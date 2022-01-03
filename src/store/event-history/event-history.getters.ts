import { GetterTree } from 'vuex';

import { EventTimeDistribution } from '../../core/models/event-history/event-time-distribution';
import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event-history.state';

const dayStart = new Date(new Date().setHours(0, 0, 0, 0));

export enum GetterKey {
    IsIdling = 'is_idling',
    IsWorking = 'is_working',
    IsActiveWorkItem = 'is_active_work_item',
    UnrecordedIdlingDuration = 'unrecorded_idling_duration',
    UnrecordedWorkingDuration = 'unrecorded_working_duration',
    CurrentTimeDistribution = 'current_time_distribution'
}

export type Getters = {
    [GetterKey.IsIdling](state: IState): boolean;
    [GetterKey.IsWorking](state: IState): boolean;
    [GetterKey.IsActiveWorkItem](state: IState): (type: EventType, id: number) => boolean;
    [GetterKey.UnrecordedIdlingDuration](state: IState): number;
    [GetterKey.UnrecordedWorkingDuration](state: IState): number;
    [GetterKey.CurrentTimeDistribution](state: IState): EventTimeDistribution | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.IsIdling]: (state: IState): boolean => {
        if (!state.currentTimeDistribution) {
            return false;
        }

        const { unconcluded } = state.currentTimeDistribution;

        return !unconcluded || unconcluded.eventType === EventType.Idling;
    },
    [GetterKey.IsWorking]: (state: IState): boolean => {
        if (!state.currentTimeDistribution) {
            return false;
        }

        const { unconcluded } = state.currentTimeDistribution;

        return Boolean(unconcluded) && unconcluded!.eventType !== EventType.Idling;
    },
    [GetterKey.IsActiveWorkItem]: (state: IState) => (type: EventType, id: number) => {
        if (!state.currentTimeDistribution?.unconcluded) {
            return false;
        }

        const { eventType, resourceId } = state.currentTimeDistribution.unconcluded;

        return eventType !== EventType.Idling && eventType === type && resourceId === id;
    },
    [GetterKey.UnrecordedIdlingDuration]: (state: IState): number => {
        if (!state.currentTimeDistribution) {
            return 0;
        }

        const { unconcluded } = state.currentTimeDistribution;
        const isWorking = unconcluded && unconcluded.eventType !== EventType.Idling;

        if (isWorking) {
            return 0;
        }

        const start = unconcluded ? new Date(unconcluded.timestamp) : dayStart;

        return Date.now() - start.getTime();
    },
    [GetterKey.UnrecordedWorkingDuration]: (state: IState): number => {
        if (!state.currentTimeDistribution) {
            return 0;
        }

        const { unconcluded } = state.currentTimeDistribution;
        const isIdling = !unconcluded || unconcluded.eventType === EventType.Idling;

        if (isIdling) {
            return 0;
        }

        return Date.now() - new Date(unconcluded!.timestamp).getTime();
    },
    [GetterKey.CurrentTimeDistribution]: (state: IState): EventTimeDistribution | null => state.currentTimeDistribution
};
