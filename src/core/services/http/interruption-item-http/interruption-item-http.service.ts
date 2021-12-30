import axios from 'axios';
import { injectable } from 'inversify';

import { InterruptionItem } from '../../../models/interruption/interruption-item';

@injectable()
export class InterruptionItemHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/interruption-items`;

    public async createInterruptionItem(item: InterruptionItem): Promise<InterruptionItem | null> {
        try {
            return (await axios.post(this._api, item)).data;
        }
        catch {
            return null;
        }
    }
}
