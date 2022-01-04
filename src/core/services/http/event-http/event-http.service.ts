import axios from 'axios';
import { injectable } from 'inversify';

import { OngoingEventTimeDistribution } from '../../../models/event/ongoing-event-time-distribution';

@injectable()
export class EventHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/events`;

    public async getOngoingTimeDistribution(start: Date): Promise<OngoingEventTimeDistribution> {
        try {
            return (await axios.get(`${this._api}/time-distribution/${start.toISOString()}`)).data;
        }
        catch {
            return new OngoingEventTimeDistribution();
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

    public async startBreakSession(): Promise<boolean> {
        try {
            return (await axios.put(`${this._api}/scheduled-break-prompts`)).data;
        }
        catch {
            return false;
        }
    }

    public async skipBreakSession(): Promise<boolean> {
        try {
            return (await axios.put(`${this._api}/scheduled-break-prompts?skip=true`)).data;
        }
        catch {
            return false;
        }
    }
}
