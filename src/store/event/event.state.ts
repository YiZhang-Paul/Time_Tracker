import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';

const oneMinute = 1000 * 60;

export interface IState {
    ongoingEventSummary: OngoingEventTimeSummary | null;
    workDurationLimit: number;
}

export const state = (): IState => ({
    ongoingEventSummary: null,
    workDurationLimit: oneMinute * 50
});
