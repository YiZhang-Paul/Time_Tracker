import { EventTimeSummary } from './event-time-summary';
import { EventHistory } from './event-history';

export class OngoingEventTimeSummary {
    public sinceStart!: EventTimeSummary;
    public sinceLastBreakPrompt!: EventTimeSummary;
    public unconcluded!: EventHistory;
}
