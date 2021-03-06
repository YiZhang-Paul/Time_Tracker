import axios from 'axios';
import { injectable } from 'inversify';

import { ItemSummariesDto } from '../../../dtos/item-summaries-dto';
import { InterruptionItemSummaryDto } from '../../../dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../../models/interruption/interruption-item';
import { ResolveAction } from '../../../enums/resolve-action.enum';

@injectable()
export class InterruptionItemHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/interruption-items`;

    public async getItem(id: number): Promise<InterruptionItem | null> {
        try {
            return (await axios.get(`${this._api}/${id}`)).data;
        }
        catch {
            return null;
        }
    }

    public async searchSummaries(searchText: string): Promise<InterruptionItemSummaryDto[]> {
        try {
            return (await axios.get(`${this._api}/summaries?searchText=${searchText}`)).data;
        }
        catch {
            return [];
        }
    }

    public async getSummaries(start: Date): Promise<ItemSummariesDto<InterruptionItemSummaryDto>> {
        try {
            return (await axios.get(`${this._api}/summaries/${start.toISOString()}`)).data;
        }
        catch {
            return new ItemSummariesDto<InterruptionItemSummaryDto>();
        }
    }

    public async createItem(item: InterruptionItem): Promise<InterruptionItem | null> {
        try {
            return (await axios.post(this._api, item)).data;
        }
        catch {
            return null;
        }
    }

    public async updateItem(item: InterruptionItem): Promise<InterruptionItem | null> {
        try {
            return (await axios.put(this._api, item)).data;
        }
        catch {
            return null;
        }
    }

    public async deleteItem(id: number): Promise<boolean> {
        try {
            return (await axios.delete(`${this._api}/${id}`)).data;
        }
        catch {
            return false;
        }
    }

    public async resolveItem(item: InterruptionItem): Promise<boolean> {
        try {
            const endpoint = `${this._api}?resolve=${ResolveAction.Resolve}`;
            const { data } = await axios.put(endpoint, item);

            return Boolean(data);
        }
        catch {
            return false;
        }
    }

    public async unresolveItem(item: InterruptionItem): Promise<boolean> {
        try {
            const endpoint = `${this._api}?resolve=${ResolveAction.Unresolve}`;
            const { data } = await axios.put(endpoint, item);

            return Boolean(data);
        }
        catch {
            return false;
        }
    }
}
