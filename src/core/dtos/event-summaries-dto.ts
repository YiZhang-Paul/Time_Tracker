import { EventTimelineDto } from './event-timeline-dto';
import { EventDurationDto } from './event-duration-dto';

export class EventSummariesDto {
    public timeline: EventTimelineDto[] = [];
    public idling: EventDurationDto[] = [];
    public break: EventDurationDto[] = [];
    public interruption: EventDurationDto[] = [];
    public task: EventDurationDto[] = [];
}
