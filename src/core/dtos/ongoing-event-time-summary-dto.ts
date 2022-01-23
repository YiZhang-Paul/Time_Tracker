import { EventTimeSummary } from '../models/event/event-time-summary';
import { EventHistory } from '../models/event/event-history';

export class OngoingEventTimeSummaryDto {
    public concludedSinceStart!: EventTimeSummary;
    public concludedSinceLastBreakPrompt!: EventTimeSummary;
    public unconcludedSinceStart!: EventHistory;
    public unconcludedSinceLastBreakPrompt!: EventHistory;
}
