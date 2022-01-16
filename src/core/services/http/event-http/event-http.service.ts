import axios from 'axios';
import { injectable } from 'inversify';

import { OngoingEventTimeSummary } from '../../../models/event/ongoing-event-time-summary';

@injectable()
export class EventHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/events`;

    public async getOngoingEventSummary(start: Date): Promise<OngoingEventTimeSummary> {
        try {
            return (await axios.get(`${this._api}/time-summary/${start.toISOString()}`)).data;
        }
        catch {
            return new OngoingEventTimeSummary();
        }
    }

    public async startIdling(): Promise<boolean> {
        try {
            return (await axios.post(`${this._api}/idling-sessions`)).data;
        }
        catch {
            return false;
        }
    }

    public async startInterruption(id: number): Promise<boolean> {
        try {
            return (await axios.post(`${this._api}/interruption-items/${id}`)).data;
        }
        catch {
            return false;
        }
    }

    public async startTask(id: number): Promise<boolean> {
        try {
            return (await axios.post(`${this._api}/task-items/${id}`)).data;
        }
        catch {
            return false;
        }
    }

    public async startBreak(): Promise<boolean> {
        try {
            return (await axios.put(`${this._api}/scheduled-break-prompts`)).data;
        }
        catch {
            return false;
        }
    }

    public async skipBreak(): Promise<boolean> {
        try {
            return (await axios.put(`${this._api}/scheduled-break-prompts?skip=true`)).data;
        }
        catch {
            return false;
        }
    }
}
