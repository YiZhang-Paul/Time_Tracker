import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';

const oneMinute = 1000 * 60;

export interface IState {
    ongoingTimeSummary: OngoingEventTimeSummary | null;
    workingDurationLimit: number;
}

export const state = (): IState => ({
    ongoingTimeSummary: null,
    workingDurationLimit: oneMinute * 50
});
