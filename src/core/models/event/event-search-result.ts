import { EventType } from '../../enums/event-type.enum';

import { EventSelection } from './event-selection';

export class EventSearchResult extends EventSelection {
    public isDeleted: boolean;
    public isResolved: boolean;

    constructor(id: number, eventType: EventType, name: string, isDeleted: boolean, isResolved: boolean) {
        super(id, eventType, name);
        this.isDeleted = isDeleted;
        this.isResolved = isResolved;
    }
}
