import { EventType } from '../../enums/event-type.enum';

export class EventSelection {
    public id: number;
    public eventType: EventType;
    public name: string;

    constructor(id: number, eventType: EventType, name: string) {
        this.id = id;
        this.eventType = eventType;
        this.name = name;
    }
}
