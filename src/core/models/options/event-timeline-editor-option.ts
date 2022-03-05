import { EventType } from '../../enums/event-type.enum';

export class EventTimelineEditorOption {
    public eventType: EventType;
    public name: string;
    public start: Date;
    public end: Date;

    constructor(eventType: EventType, name: string, start: Date, end: Date) {
        this.eventType = eventType;
        this.name = name;
        this.start = start;
        this.end = end;
    }
}
