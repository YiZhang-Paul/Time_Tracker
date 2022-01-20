import { defineStore } from 'pinia';

import { useEventStore } from '../event/event.store';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { EventType } from '../../core/enums/event-type.enum';
import { InterruptionItemHttpService } from '../../core/services/http/interruption-item-http/interruption-item-http.service';

let interruptionItemHttpService = container.get<InterruptionItemHttpService>(types.InterruptionItemHttpService);

export const setServices = (interruptionItemHttp: InterruptionItemHttpService): void => {
    interruptionItemHttpService = interruptionItemHttp;
};

export const useInterruptionStore = defineStore('interruption', {
    state: () => ({
        summaries: [] as InterruptionItemSummaryDto[],
        editingItem: null as InterruptionItem | null
    }),
    getters: {
        filteredSummaries() {
            return (searchText: string) => {
                const text = searchText.toLowerCase();
                const summaries = this.summaries.filter(_ => _.name.toLowerCase().includes(text));

                return summaries.sort((a, b) => a.priority === b.priority ? a.id - b.id : b.priority - a.priority);
            };
        },
        activeSummary(): InterruptionItemSummaryDto | null {
            const eventStore = useEventStore();

            if (!eventStore.isWorking) {
                return null;
            }

            const { unconcludedSinceStart } = eventStore.ongoingEventSummary!;

            if (unconcludedSinceStart.eventType !== EventType.Interruption) {
                return null;
            }

            return this.summaries.find(_ => _.id === unconcludedSinceStart.resourceId)!;
        }
    },
    actions: {
        async loadSummaries(): Promise<void> {
            this.summaries = await interruptionItemHttpService.getSummaries();
        },
        async createItem(item: InterruptionItem): Promise<boolean> {
            const created = await interruptionItemHttpService.createItem(item);

            if (created) {
                this.editingItem = created;
            }

            return Boolean(created);
        },
        async updateItem(item: InterruptionItem): Promise<boolean> {
            const updated = await interruptionItemHttpService.updateItem(item);

            if (updated && this.editingItem?.id === updated.id) {
                this.editingItem = updated;
            }

            return Boolean(updated);
        },
        async deleteItem(id: number): Promise<boolean> {
            const isDeleted = await interruptionItemHttpService.deleteItem(id);

            if (!isDeleted) {
                return false;
            }

            if (this.editingItem?.id === id) {
                this.stopItemEdit();
            }

            this.summaries = this.summaries.filter(_ => _.id !== id);

            return true;
        },
        startItemCreate(): void {
            this.stopItemEdit();
            setTimeout(() => this.editingItem = new InterruptionItem(-1));
        },
        async startItemEdit(id: number): Promise<boolean> {
            const item = await interruptionItemHttpService.getItem(id);

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
