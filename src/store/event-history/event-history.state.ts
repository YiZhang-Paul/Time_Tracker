import { OngoingEventTimeDistribution } from '../../core/models/event-history/ongoing-event-time-distribution';

export interface IState {
    ongoingTimeDistribution: OngoingEventTimeDistribution | null;
}

export const state = (): IState => ({
    ongoingTimeDistribution: null
});
