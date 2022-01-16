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

    public getSummaries(searchText: string): TaskItemSummaryDto[] {
        return this.store.task.getters(this.store.task.getter.Summaries)(searchText);
    }

    public async loadTaskSummaries(): Promise<void> {
        await this.store.task.dispatch(this.store.task.action.LoadTaskSummaries);
    }

    public startTaskItemCreation(): void {
        this.store.task.dispatch(this.store.task.action.StartTaskItemCreation);
    }

    public async startTaskItemEdit(id: number): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.StartTaskItemEdit, id);
    }

    public endTaskItemEdit(): void {
        this.store.task.dispatch(this.store.task.action.EndTaskItemEdit);
    }

    public async createTaskItem(item: TaskItem): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.CreateTaskItem, item);
    }

    public async updateTaskItem(item: TaskItem): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.UpdateTaskItem, item);
    }

    public async deleteTaskItem(id: number): Promise<boolean> {
        return await this.store.task.dispatch(this.store.task.action.DeleteTaskItem, id);
    }
}
