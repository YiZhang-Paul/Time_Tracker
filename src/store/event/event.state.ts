import { OngoingEventTimeDistribution } from '../../core/models/event/ongoing-event-time-distribution';

const oneMinute = 1000 * 60;

export interface IState {
    ongoingTimeDistribution: OngoingEventTimeDistribution | null;
    workingDurationLimit: number;
}

export const state = (): IState => ({
    ongoingTimeDistribution: null,
    workingDurationLimit: oneMinute * 50
});
