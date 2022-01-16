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

    public searchSummaries(searchText: string): InterruptionItemSummaryDto[] {
        return this.store.interruption.getters(this.store.interruption.getter.Summaries)(searchText);
    }

    public async loadSummaries(): Promise<void> {
        await this.store.interruption.dispatch(this.store.interruption.action.LoadSummaries);
    }

    public startItemCreate(): void {
        this.store.interruption.dispatch(this.store.interruption.action.StartItemCreate);
    }

    public async startItemEdit(id: number): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.StartItemEdit, id);
    }

    public stopItemEdit(): void {
        this.store.interruption.dispatch(this.store.interruption.action.StopItemEdit);
    }

    public async createItem(item: InterruptionItem): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.CreateItem, item);
    }

    public async updateItem(item: InterruptionItem): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.UpdateItem, item);
    }

    public async deleteItem(id: number): Promise<boolean> {
        return await this.store.interruption.dispatch(this.store.interruption.action.DeleteItem, id);
    }
}
