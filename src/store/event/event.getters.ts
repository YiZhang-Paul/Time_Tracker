import { GetterTree } from 'vuex';

import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
import { EventType } from '../../core/enums/event-type.enum';

import { IState } from './event.state';

export enum GetterKey {
    IsWorking = 'is_working',
    IsNotWorking = 'is_not_working',
    IsActiveWorkItem = 'is_active_work_item',
    HasScheduledBreak = 'has_scheduled_break',
    WorkingDuration = 'working_duration',
    NonWorkingDuration = 'non_working_duration',
    WorkDurationLimit = 'work_duration_limit',
    OngoingEventSummary = 'ongoing_event_summary'
}

export type Getters = {
    [GetterKey.IsWorking](state: IState): boolean;
    [GetterKey.IsNotWorking](state: IState): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsActiveWorkItem](state: IState, getters: any): (type: EventType, id: number) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.HasScheduledBreak](state: IState, getters: any): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.WorkingDuration](state: IState, getters: any): number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.NonWorkingDuration](state: IState, getters: any): number;
    [GetterKey.WorkDurationLimit](state: IState): number;
    [GetterKey.OngoingEventSummary](state: IState): OngoingEventTimeSummary | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.IsWorking]: (state: IState): boolean => {
        const type = state.ongoingEventSummary?.unconcludedSinceStart.eventType;

        return type === EventType.Interruption || type === EventType.Task;
    },
    [GetterKey.IsNotWorking]: (state: IState): boolean => {
        const type = state.ongoingEventSummary?.unconcludedSinceStart.eventType;

        return type === EventType.Idling || type === EventType.Break;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.IsActiveWorkItem]: (state: IState, getters: any) => (type: EventType, id: number) => {
        if (!getters[GetterKey.IsWorking]) {
            return false;
        }

        const { eventType, resourceId } = state.ongoingEventSummary!.unconcludedSinceStart;

        return eventType === type && resourceId === id;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.HasScheduledBreak]: (state: IState, getters: any): boolean => {
        if (!getters[GetterKey.IsWorking]) {
            return false;
        }

        const limit = state.workDurationLimit;
        const { concludedSinceLastBreakPrompt, unconcludedSinceLastBreakPrompt } = state.ongoingEventSummary!;
        const unconcluded = Date.now() - new Date(unconcludedSinceLastBreakPrompt.timestamp).getTime();

        return concludedSinceLastBreakPrompt.working + unconcluded >= limit;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.WorkingDuration]: (state: IState, getters: any): number => {
        if (!state.ongoingEventSummary) {
            return 0;
        }

        const { concludedSinceStart, unconcludedSinceStart } = state.ongoingEventSummary;
        const isWorking = getters[GetterKey.IsWorking];
        const unconcluded = isWorking ? Date.now() - new Date(unconcludedSinceStart.timestamp).getTime() : 0;

        return concludedSinceStart.working + unconcluded;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.NonWorkingDuration]: (state: IState, getters: any): number => {
        if (!state.ongoingEventSummary) {
            return 0;
        }

        const { concludedSinceStart, unconcludedSinceStart } = state.ongoingEventSummary;
        const isWorking = getters[GetterKey.IsWorking];
        const unconcluded = isWorking ? 0 : Date.now() - new Date(unconcludedSinceStart.timestamp).getTime();

        return concludedSinceStart.notWorking + unconcluded;
    },
    [GetterKey.WorkDurationLimit]: (state: IState): number => state.workDurationLimit,
    [GetterKey.OngoingEventSummary]: (state: IState): OngoingEventTimeSummary | null => state.ongoingEventSummary
};
