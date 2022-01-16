import { injectable } from 'inversify';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { TaskItem } from '../../../models/task/task-item';

@injectable()
export class TaskStateService {
    private store = container.get<ReturnType<typeof createStore>>(types.Store);

    get editingItem(): TaskItem | null {
        return this.store.task.getters(this.store.task.getter.EditingItem);
    }

    public startTaskItemCreation(): void {
        this.store.task.dispatch(this.store.task.action.StartTaskItemCreation);
    }

    public endTaskItemEdit(): void {
        this.store.task.dispatch(this.store.task.action.EndTaskItemEdit);
    }
}
