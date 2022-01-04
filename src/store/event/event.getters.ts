import { GetterTree } from 'vuex';

import { OngoingEventTimeDistribution } from '../../core/models/event/ongoing-event-time-distribution';
import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event.state';

export enum GetterKey {
    IsWorking = 'is_working',
    IsNotWorking = 'is_not_working',
    IsActiveWorkItem = 'is_active_work_item',
    IsScheduledBreakNeeded = 'is_scheduled_break_needed',
    WorkingDuration = 'working_duration',
    NotWorkingDuration = 'not_working_duration',
    WorkingDurationLimit = 'working_duration_limit',
    OngoingTimeDistribution = 'ongoing_time_distribution'
}

export type Getters = {
    [GetterKey.IsWorking](state: IState): boolean;
    [GetterKey.IsNotWorking](state: IState): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsActiveWorkItem](state: IState, getters: any): (type: EventType, id: number) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsScheduledBreakNeeded](state: IState, getters: any): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.WorkingDuration](state: IState, getters: any): number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.NotWorkingDuration](state: IState, getters: any): number;
    [GetterKey.WorkingDurationLimit](state: IState): number;
    [GetterKey.OngoingTimeDistribution](state: IState): OngoingEventTimeDistribution | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.IsWorking]: (state: IState): boolean => {
        const type = state.ongoingTimeDistribution?.unconcluded?.eventType;

        return type === EventType.Interruption || type === EventType.Task;
    },
    [GetterKey.IsNotWorking]: (state: IState): boolean => {
        if (state.ongoingTimeDistribution && !state.ongoingTimeDistribution.unconcluded) {
            return true;
        }

        const type = state.ongoingTimeDistribution?.unconcluded?.eventType;

        return type === EventType.Idling || type === EventType.Break;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsActiveWorkItem]: (state: IState, getters: any) => (type: EventType, id: number) => {
        if (!getters[GetterKey.IsWorking]) {
            return false;
        }

        const { eventType, resourceId } = state.ongoingTimeDistribution!.unconcluded!;

        return eventType === type && resourceId === id;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.WorkingDuration]: (state: IState, getters: any): number => {
        if (!state.ongoingTimeDistribution) {
            return 0;
        }

        const { sinceStart, unconcluded } = state.ongoingTimeDistribution;
        const isWorking = getters[GetterKey.IsWorking];
        const concluded = sinceStart.interruption + sinceStart.task;
        const unconcludedTime = isWorking ? Date.now() - new Date(unconcluded!.timestamp).getTime() : 0;

        return concluded + unconcludedTime;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.NotWorkingDuration]: (state: IState, getters: any): number => {
        if (!state.ongoingTimeDistribution) {
            return 0;
        }

        const { sinceStart, unconcluded } = state.ongoingTimeDistribution;
        const concluded = sinceStart.idling + sinceStart.break;

        if (getters[GetterKey.IsWorking]) {
            return concluded;
        }

        const start = unconcluded ? new Date(unconcluded.timestamp) : new Date(new Date().setHours(0, 0, 0, 0));
        const unconcludedTime = Date.now() - start.getTime();

        return concluded + unconcludedTime;
    },
    [GetterKey.WorkingDurationLimit]: (state: IState): number => state.workingDurationLimit,
    [GetterKey.OngoingTimeDistribution]: (state: IState): OngoingEventTimeDistribution | null => state.ongoingTimeDistribution
};
