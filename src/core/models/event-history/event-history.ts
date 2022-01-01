import { EventType } from '../../enums/event-type.enum';

export class EventHistory {
    public id!: number;
    public resourceId!: number;
    public eventType!: EventType;
    public timestamp!: string;
}
