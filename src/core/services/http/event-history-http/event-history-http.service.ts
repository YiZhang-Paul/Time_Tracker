import axios from 'axios';
import { injectable } from 'inversify';

import { EventHistory } from '../../../models/event-history/event-history';

@injectable()
export class EventHistoryHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/event-histories`;

    public async getLastEventHistory(): Promise<EventHistory | null> {
        try {
            return (await axios.get(`${this._api}/last-history`)).data;
        }
        catch {
            return null;
        }
    }
}
