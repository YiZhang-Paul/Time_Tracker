import { EventType } from '../../enums/event-type.enum';

export class EventHistorySummary {
    public id!: number;
    public resourceId!: number;
    public eventType!: EventType;
    public timestamp!: string;
    public name = '';
    public isDeleted = false;
}
