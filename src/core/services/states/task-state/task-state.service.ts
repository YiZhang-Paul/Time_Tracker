import { injectable } from 'inversify';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { TaskItemSummaryDto } from '../../../dtos/task-item-summary-dto';
import { TaskItem } from '../../../models/task/task-item';

@injectable()
export class TaskStateService {
    private store = container.get<ReturnType<typeof createStore>>(types.Store);

    get editingItem(): TaskItem | null {
        return this.store.task.getters(this.store.task.getter.EditingItem);
    }

    get activeSummary(): TaskItemSummaryDto | null {
        return this.store.task.getters(this.store.task.getter.ActiveSummary);
    }

    public searchSummaries(searchText: string): TaskItemSummaryDto[] {
        return this.store.task.getters(this.store.task.getter.Summaries)(searchText);
    }

    public async loadSummaries(): Promise<void> {
        await this.store.task.dispatch(this.store.task.action.LoadSummaries);
    }

    public startItemCreate(): void {
        this.store.task.dispatch(this.store.task.action.StartItemCreate);
    }

    public async startItemEdit(id: number): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.StartItemEdit, id);
    }

    public stopItemEdit(): void {
        this.store.task.dispatch(this.store.task.action.StopItemEdit);
    }

    public async createItem(item: TaskItem): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.CreateItem, item);
    }

    public async updateItem(item: TaskItem): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.UpdateItem, item);
    }

    public async deleteItem(id: number): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.DeleteItem, id);
    }
}
