import { EventTimeDistribution } from './event-time-distribution';
import { EventHistory } from './event-history';

export class OngoingEventTimeDistribution {
    public sinceStart!: EventTimeDistribution;
    public sinceLastBreakPrompt!: EventTimeDistribution;
    public unconcluded!: EventHistory | null;
}
