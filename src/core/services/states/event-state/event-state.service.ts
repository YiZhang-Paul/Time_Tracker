import { injectable } from 'inversify';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';

@injectable()
export class EventStateService {
    private store = container.get<ReturnType<typeof createStore>>(types.Store);

    get isWorking(): boolean {
        return this.store.event.getters(this.store.event.getter.IsWorking);
    }

    get isNotWorking(): boolean {
        return this.store.event.getters(this.store.event.getter.IsNotWorking);
    }

    get isScheduledBreakNeeded(): boolean {
        return this.store.event.getters(this.store.event.getter.IsScheduledBreakNeeded);
    }

    get workingDuration(): number {
        return this.store.event.getters(this.store.event.getter.WorkingDuration);
    }

    get notWorkingDuration(): number {
        return this.store.event.getters(this.store.event.getter.NotWorkingDuration);
    }

    get workingDurationLimit(): number {
        return this.store.event.getters(this.store.event.getter.WorkingDurationLimit);
    }

    public async startBreakSession(): Promise<boolean> {
        return await this.store.event.dispatch(this.store.event.action.StartBreakSession);
    }

    public async skipBreakSession(): Promise<boolean> {
        return await this.store.event.dispatch(this.store.event.action.SkipBreakSession);
    }
}
