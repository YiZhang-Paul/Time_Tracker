import { defineStore } from 'pinia';

import { useEventStore } from '../event/event.store';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { ItemSummariesDto } from '../../core/dtos/item-summaries-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';
import { EventType } from '../../core/enums/event-type.enum';
import { TaskItemHttpService } from '../../core/services/http/task-item-http/task-item-http.service';

let taskItemHttpService = container.get<TaskItemHttpService>(types.TaskItemHttpService);

export const setServices = (taskItemHttp: TaskItemHttpService): void => {
    taskItemHttpService = taskItemHttp;
};

export const useTaskStore = defineStore('task', {
    state: () => ({
        summaries: new ItemSummariesDto<TaskItemSummaryDto>(),
        editingItem: null as TaskItem | null
    }),
    getters: {
        filteredSummaries(): (_: string | null) => ItemSummariesDto<TaskItemSummaryDto> {
            return (searchText: string | null) => {
                const text = searchText?.toLowerCase().trim() ?? '';

                return {
                    resolved: filterSummaries(this.summaries.resolved, text),
                    unresolved: filterSummaries(this.summaries.unresolved, text)
                };
            };
        },
        activeSummary(): TaskItemSummaryDto | null {
            const eventStore = useEventStore();

            if (!eventStore.isWorking) {
                return null;
            }

            const { unconcludedSinceStart } = eventStore.ongoingEventSummary!;

            if (unconcludedSinceStart.eventType !== EventType.Task) {
                return null;
            }

            return this.summaries.unresolved.find(_ => _.id === unconcludedSinceStart.resourceId)!;
        }
    },
    actions: {
        async loadSummaries(): Promise<void> {
            const start = new Date(new Date().setHours(0, 0, 0, 0));
            this.summaries = await taskItemHttpService.getSummaries(start);
        },
        async createItem(item: TaskItem): Promise<boolean> {
            const created = await taskItemHttpService.createItem(item);

            if (created) {
                this.editingItem = created;
            }

            return Boolean(created);
        },
        async updateItem(item: TaskItem): Promise<boolean> {
            const updated = await taskItemHttpService.updateItem(item);

            if (updated && this.editingItem?.id === updated.id) {
                this.editingItem = updated;
            }

            return Boolean(updated);
        },
        async deleteItem(id: number): Promise<boolean> {
            const isDeleted = await taskItemHttpService.deleteItem(id);

            if (!isDeleted) {
                return false;
            }

            if (this.editingItem?.id === id) {
                this.stopItemEdit();
            }

            this.summaries.resolved = this.summaries.resolved.filter(_ => _.id !== id);
            this.summaries.unresolved = this.summaries.unresolved.filter(_ => _.id !== id);

            return true;
        },
        async resolveItem(item: TaskItem): Promise<boolean> {
            const isResolved = await taskItemHttpService.resolveItem(item);

            if (!isResolved) {
                return false;
            }

            const summary = this.summaries.unresolved.find(_ => _.id === item.id)!;
            this.summaries.resolved = [...this.summaries.resolved, summary];
            this.summaries.unresolved = this.summaries.unresolved.filter(_ => _.id !== item.id);

            return true;
        },
        startItemCreate(): void {
            this.stopItemEdit();
            setTimeout(() => this.editingItem = new TaskItem(-1));
        },
        async startItemEdit(id: number): Promise<boolean> {
            const item = await taskItemHttpService.getItem(id);

            if (item) {
                this.stopItemEdit();
                setTimeout(() => this.editingItem = item);
            }

            return Boolean(item);
        },
        stopItemEdit(): void {
            this.editingItem = null;
        }
    }
});

function filterSummaries(summaries: TaskItemSummaryDto[], text: string): TaskItemSummaryDto[] {
    const filtered = summaries.filter(_ => _.name.toLowerCase().includes(text));

    return filtered.sort((a, b) => a.id - b.id);
}
