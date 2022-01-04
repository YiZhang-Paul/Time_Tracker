import { GetterTree } from 'vuex';

import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
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
    OngoingTimeSummary = 'ongoing_time_summary'
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
    [GetterKey.OngoingTimeSummary](state: IState): OngoingEventTimeSummary | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.IsWorking]: (state: IState): boolean => {
        const type = state.ongoingTimeSummary?.unconcludedSinceStart.eventType;

        return type === EventType.Interruption || type === EventType.Task;
    },
    [GetterKey.IsNotWorking]: (state: IState): boolean => {
        const type = state.ongoingTimeSummary?.unconcludedSinceStart.eventType;

        return type === EventType.Idling || type === EventType.Break;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsActiveWorkItem]: (state: IState, getters: any) => (type: EventType, id: number) => {
        if (!getters[GetterKey.IsWorking]) {
            return false;
        }

        const { eventType, resourceId } = state.ongoingTimeSummary!.unconcludedSinceStart;

        return eventType === type && resourceId === id;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsScheduledBreakNeeded]: (state: IState, getters: any): boolean => {
        if (!getters[GetterKey.IsWorking]) {
            return false;
        }

        const limit = state.workingDurationLimit;
        const { concludedSinceLastBreakPrompt, unconcludedSinceLastBreakPrompt } = state.ongoingTimeSummary!;
        const unconcluded = Date.now() - new Date(unconcludedSinceLastBreakPrompt.timestamp).getTime();

        return concludedSinceLastBreakPrompt.working + unconcluded >= limit;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.WorkingDuration]: (state: IState, getters: any): number => {
        if (!state.ongoingTimeSummary) {
            return 0;
        }

        const { concludedSinceStart, unconcludedSinceStart } = state.ongoingTimeSummary;
        const isWorking = getters[GetterKey.IsWorking];
        const unconcluded = isWorking ? Date.now() - new Date(unconcludedSinceStart.timestamp).getTime() : 0;

        return concludedSinceStart.working + unconcluded;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.NotWorkingDuration]: (state: IState, getters: any): number => {
        if (!state.ongoingTimeSummary) {
            return 0;
        }

        const { concludedSinceStart, unconcludedSinceStart } = state.ongoingTimeSummary;
        const isWorking = getters[GetterKey.IsWorking];
        const unconcluded = isWorking ? 0 : Date.now() - new Date(unconcludedSinceStart.timestamp).getTime();

        return concludedSinceStart.notWorking + unconcluded;
    },
    [GetterKey.WorkingDurationLimit]: (state: IState): number => state.workingDurationLimit,
    [GetterKey.OngoingTimeSummary]: (state: IState): OngoingEventTimeSummary | null => state.ongoingTimeSummary
};
