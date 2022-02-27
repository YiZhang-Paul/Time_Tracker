import { TimePeriod } from '../models/generic/time-period';
import { EventType } from '../enums/event-type.enum';

export class EventDurationDto {
    public id!: number;
    public eventType!: EventType;
    public duration = 0;
    public name = '';
    public isDeleted = false;
    public isResolved = false;
    public periods: TimePeriod<string>[] = [];
}
