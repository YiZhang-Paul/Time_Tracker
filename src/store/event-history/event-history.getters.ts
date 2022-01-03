import { GetterTree } from 'vuex';

import { OngoingEventTimeDistribution } from '../../core/models/event-history/ongoing-event-time-distribution';
import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event-history.state';

export enum GetterKey {
    IsIdling = 'is_idling',
    IsWorking = 'is_working',
    IsActiveWorkItem = 'is_active_work_item',
    IsScheduledBreakNeeded = 'is_scheduled_break_needed',
    IdlingDuration = 'idling_duration',
    WorkingDuration = 'working_duration',
    WorkingDurationLimit = 'working_duration_limit',
    OngoingTimeDistribution = 'ongoing_time_distribution'
}

export type Getters = {
    [GetterKey.IsIdling](state: IState): boolean;
    [GetterKey.IsWorking](state: IState): boolean;
    [GetterKey.IsActiveWorkItem](state: IState): (type: EventType, id: number) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsScheduledBreakNeeded](state: IState, getters: any): boolean;
    [GetterKey.IdlingDuration](state: IState): number;
    [GetterKey.WorkingDuration](state: IState): number;
    [GetterKey.WorkingDurationLimit](state: IState): number;
    [GetterKey.OngoingTimeDistribution](state: IState): OngoingEventTimeDistribution | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.IsIdling]: (state: IState): boolean => {
        if (!state.ongoingTimeDistribution) {
            return false;
        }

        const { unconcluded } = state.ongoingTimeDistribution;

        return !unconcluded || unconcluded.eventType === EventType.Idling;
    },
    [GetterKey.IsWorking]: (state: IState): boolean => {
        if (!state.ongoingTimeDistribution) {
            return false;
        }

        const { unconcluded } = state.ongoingTimeDistribution;

        return Boolean(unconcluded) && unconcluded!.eventType !== EventType.Idling;
    },
    [GetterKey.IsActiveWorkItem]: (state: IState) => (type: EventType, id: number) => {
        if (!state.ongoingTimeDistribution?.unconcluded) {
            return false;
        }

        const { eventType, resourceId } = state.ongoingTimeDistribution.unconcluded;

        return eventType !== EventType.Idling && eventType === type && resourceId === id;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsScheduledBreakNeeded]: (state: IState, getters: any): boolean => {
        if (!getters[GetterKey.IsWorking]) {
            return false;
        }

        const limit = state.workingDurationLimit;
        const { sinceLastBreakPrompt, unconcluded } = state.ongoingTimeDistribution!;
        const concluded = sinceLastBreakPrompt.interruption + sinceLastBreakPrompt.task;
        const unconcludedTime = Date.now() - new Date(unconcluded!.timestamp).getTime();

        return concluded + unconcludedTime >= limit;
    },
    [GetterKey.IdlingDuration]: (state: IState): number => {
        if (!state.ongoingTimeDistribution) {
            return 0;
        }

        const { sinceStart, unconcluded } = state.ongoingTimeDistribution;
        const isWorking = unconcluded && unconcluded.eventType !== EventType.Idling;

        if (isWorking) {
            return sinceStart.idling;
        }

        const start = unconcluded ? new Date(unconcluded.timestamp) : new Date(new Date().setHours(0, 0, 0, 0));
        const unconcludedTime = Date.now() - start.getTime();

        return sinceStart.idling + unconcludedTime;
    },
    [GetterKey.WorkingDuration]: (state: IState): number => {
        if (!state.ongoingTimeDistribution) {
            return 0;
        }

        const { sinceStart, unconcluded } = state.ongoingTimeDistribution;
        const concluded = sinceStart.interruption + sinceStart.task;
        const isIdling = !unconcluded || unconcluded.eventType === EventType.Idling;

        if (isIdling) {
            return concluded;
        }

        const unconcludedTime = Date.now() - new Date(unconcluded!.timestamp).getTime();

        return concluded + unconcludedTime;
    },
    [GetterKey.WorkingDurationLimit]: (state: IState): number => state.workingDurationLimit,
    [GetterKey.OngoingTimeDistribution]: (state: IState): OngoingEventTimeDistribution | null => state.ongoingTimeDistribution
};
