import { EventTimeSummary } from './event-time-summary';
import { EventHistory } from './event-history';

export class OngoingEventTimeSummary {
    public concludedSinceStart!: EventTimeSummary;
    public concludedSinceLastBreakPrompt!: EventTimeSummary;
    public unconcludedSinceStart!: EventHistory;
    public unconcludedSinceLastBreakPrompt!: EventHistory;
}
