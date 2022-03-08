import { EventType } from '../../enums/event-type.enum';

export class EventTimelineEditorOption {
    public id: number;
    public eventType: EventType;
    public name: string;
    public start: Date;
    public end: Date;

    constructor(id: number, eventType: EventType, name: string, start: Date, end: Date) {
        this.id = id;
        this.eventType = eventType;
        this.name = name;
        this.start = start;
        this.end = end;
    }
}
