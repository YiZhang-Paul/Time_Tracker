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

    public async startInterruptionItem(id: number): Promise<boolean> {
        try {
            return (await axios.post(`${this._api}/interruption-items/${id}`)).data;
        }
        catch {
            return false;
        }
    }

    public async startTaskItem(id: number): Promise<boolean> {
        try {
            return (await axios.post(`${this._api}/task-items/${id}`)).data;
        }
        catch {
            return false;
        }
    }
}
