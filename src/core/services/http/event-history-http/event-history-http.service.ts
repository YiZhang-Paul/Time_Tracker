import axios from 'axios';
import { injectable } from 'inversify';

import { EventTimeDistribution } from '../../../models/event-history/event-time-distribution';

@injectable()
export class EventHistoryHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/event-histories`;

    public async getTimeDistribution(start: Date): Promise<EventTimeDistribution> {
        try {
            return (await axios.get(`${this._api}/time-distribution/${start.toISOString()}`)).data;
        }
        catch {
            return new EventTimeDistribution();
        }
    }

    public async startIdlingSession(): Promise<boolean> {
        try {
            return (await axios.post(`${this._api}/idling-sessions`)).data;
        }
        catch {
            return false;
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
