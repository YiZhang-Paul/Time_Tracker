import { injectable } from 'inversify';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { InterruptionItemSummaryDto } from '../../../dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../../models/interruption/interruption-item';

@injectable()
export class InterruptionStateService {
    private store = container.get<ReturnType<typeof createStore>>(types.Store);

    get editingItem(): InterruptionItem | null {
        return this.store.interruption.getters(this.store.interruption.getter.EditingItem);
    }

    get activeSummary(): InterruptionItemSummaryDto | null {
        return this.store.interruption.getters(this.store.interruption.getter.ActiveSummary);
    }

    public getSummaries(searchText: string): InterruptionItemSummaryDto[] {
        return this.store.interruption.getters(this.store.interruption.getter.Summaries)(searchText);
    }

    public async loadInterruptionSummaries(): Promise<void> {
        await this.store.interruption.dispatch(this.store.interruption.action.LoadInterruptionSummaries);
    }

    public startInterruptionItemCreation(): void {
        this.store.interruption.dispatch(this.store.interruption.action.StartInterruptionItemCreation);
    }

    public async startInterruptionItemEdit(id: number): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.StartInterruptionItemEdit, id);
    }

    public endInterruptionItemEdit(): void {
        this.store.interruption.dispatch(this.store.interruption.action.EndInterruptionItemEdit);
    }

    public async createInterruptionItem(item: InterruptionItem): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.CreateInterruptionItem, item);
    }

    public async updateInterruptionItem(item: InterruptionItem): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.UpdateInterruptionItem, item);
    }

    public async deleteInterruptionItem(id: number): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.DeleteInterruptionItem, id);
    }
}
