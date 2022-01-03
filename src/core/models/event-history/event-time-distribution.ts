import { EventHistory } from './event-history';

export class EventTimeDistribution {
    public idling = 0;
    public interruption = 0;
    public task = 0;
    public unconcluded: EventHistory | null = null;
}
