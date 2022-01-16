import { injectable } from 'inversify';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { DialogConfig } from '../../../models/generic/dialog-config';

@injectable()
export class DialogStateService {
    private store = container.get<ReturnType<typeof createStore>>(types.Store);

    get configs(): DialogConfig<unknown, unknown>[] {
        return this.store.dialog.getters(this.store.dialog.getter.Configs);
    }

    public openDialog(config: DialogConfig<unknown, unknown>): void {
        this.store.dialog.dispatch(this.store.dialog.action.OpenDialog, config);
    }

    public closeDialog(config: DialogConfig<unknown, unknown>): void {
        this.store.dialog.dispatch(this.store.dialog.action.CloseDialog, config);
    }
}
