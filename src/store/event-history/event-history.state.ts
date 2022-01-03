import { EventTimeDistribution } from '../../core/models/event-history/event-time-distribution';

export interface IState {
    currentTimeDistribution: EventTimeDistribution | null;
}

export const state = (): IState => ({
    currentTimeDistribution: null
});
