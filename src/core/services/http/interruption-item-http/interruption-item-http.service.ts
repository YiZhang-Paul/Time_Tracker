import axios from 'axios';
import { injectable } from 'inversify';

import { InterruptionItemSummaryDto } from '../../../dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../../models/interruption/interruption-item';

@injectable()
export class InterruptionItemHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/interruption-items`;

    public async getInterruptionItem(id: number): Promise<InterruptionItem | null> {
        try {
            return (await axios.get(`${this._api}/${id}`)).data;
        }
        catch {
            return null;
        }
    }

    public async getInterruptionSummaries(): Promise<InterruptionItemSummaryDto[]> {
        try {
            return (await axios.get(`${this._api}/summaries`)).data;
        }
        catch {
            return [];
        }
    }

    public async createInterruptionItem(item: InterruptionItem): Promise<InterruptionItem | null> {
        try {
            return (await axios.post(this._api, item)).data;
        }
        catch {
            return null;
        }
    }
}
