import { injectable } from 'inversify';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { InterruptionItem } from '../../../models/interruption/interruption-item';

@injectable()
export class InterruptionStateService {
    private store = container.get<ReturnType<typeof createStore>>(types.Store);

    get editingItem(): InterruptionItem | null {
        return this.store.interruption.getters(this.store.interruption.getter.EditingItem);
    }

    public startInterruptionItemCreation(): void {
        this.store.interruption.dispatch(this.store.interruption.action.StartInterruptionItemCreation);
    }

    public endInterruptionItemEdit(): void {
        this.store.interruption.dispatch(this.store.interruption.action.EndInterruptionItemEdit);
    }
}
