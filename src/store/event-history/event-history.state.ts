import { EventHistory } from '../../core/models/event-history/event-history';

export interface IState {
    lastHistory: EventHistory | null;
}

export const state = (): IState => ({
    lastHistory: null
});
