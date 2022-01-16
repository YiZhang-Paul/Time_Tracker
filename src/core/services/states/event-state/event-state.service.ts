import { injectable } from 'inversify';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { OngoingEventTimeSummary } from '../../../models/event/ongoing-event-time-summary';
import { EventType } from '../../../enums/event-type.enum';

@injectable()
export class EventStateService {
    private store = container.get<ReturnType<typeof createStore>>(types.Store);

    get isWorking(): boolean {
        return this.store.event.getters(this.store.event.getter.IsWorking);
    }

    get isNotWorking(): boolean {
        return this.store.event.getters(this.store.event.getter.IsNotWorking);
    }

    get hasScheduledBreak(): boolean {
        return this.store.event.getters(this.store.event.getter.HasScheduledBreak);
    }

    get workingDuration(): number {
        return this.store.event.getters(this.store.event.getter.WorkingDuration);
    }

    get nonWorkingDuration(): number {
        return this.store.event.getters(this.store.event.getter.NonWorkingDuration);
    }

    get workDurationLimit(): number {
        return this.store.event.getters(this.store.event.getter.WorkDurationLimit);
    }

    get ongoingEventSummary(): OngoingEventTimeSummary | null {
        return this.store.event.getters(this.store.event.getter.OngoingEventSummary);
    }

    public isActiveWorkItem(type: EventType, id: number): boolean {
        return this.store.event.getters(this.store.event.getter.IsActiveWorkItem)(type, id);
    }

    public async loadOngoingEventSummary(): Promise<void> {
        await this.store.event.dispatch(this.store.event.action.LoadOngoingEventSummary);
    }

    public async startInterruption(id: number): Promise<boolean> {
        return await this.store.event.dispatch(this.store.event.action.StartInterruption, id);
    }

    public async startTask(id: number): Promise<boolean> {
        return await this.store.event.dispatch(this.store.event.action.StartTask, id);
    }

    public async startIdling(): Promise<boolean> {
        return await this.store.event.dispatch(this.store.event.action.StartIdling);
    }

    public async startBreak(): Promise<boolean> {
        return await this.store.event.dispatch(this.store.event.action.StartBreak);
    }

    public async skipBreak(): Promise<boolean> {
        return await this.store.event.dispatch(this.store.event.action.SkipBreak);
    }
}
