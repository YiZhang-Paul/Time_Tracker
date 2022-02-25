import { EventType } from '../enums/event-type.enum';

export class EventTimelineDto {
    public id!: number;
    public eventType!: EventType;
    public startTime!: string;
    public name = '';
    public isDeleted = false;
    public isResolved = false;
}
