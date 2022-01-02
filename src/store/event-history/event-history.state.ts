import { EventHistory } from '../../core/models/event-history/event-history';

export interface IState {
    lastHistory: EventHistory | null;
    lastUpdated: Date | null;
}

export const state = (): IState => ({
    lastHistory: null,
    lastUpdated: null
});
