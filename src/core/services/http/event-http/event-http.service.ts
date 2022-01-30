import axios from 'axios';
import { injectable } from 'inversify';

import { BreakSessionConfirmationDto } from '../../../dtos/break-session-confirmation-dto';
import { OngoingEventTimeSummaryDto } from '../../../dtos/ongoing-event-time-summary-dto';
import { EventTimeBreakdownDto } from '../../../dtos/event-time-breakdown-dto';
import { EventHistorySummary } from '../../../models/event/event-history-summary';

@injectable()
export class EventHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/events`;

    public async getOngoingEventSummary(start: Date): Promise<OngoingEventTimeSummaryDto> {
        try {
            return (await axios.get(`${this._api}/time-summary/${start.toISOString()}`)).data;
        }
        catch {
            return new OngoingEventTimeSummaryDto();
        }
    }

    public async getTimeBreakdownByDay(start: Date): Promise<EventTimeBreakdownDto> {
        try {
            return (await axios.get(`${this._api}/time-breakdown/${start.toISOString()}`)).data;
        }
        catch {
            return new EventTimeBreakdownDto();
        }
    }

    public async getEventHistorySummariesByDay(start: Date): Promise<EventHistorySummary[]> {
        try {
            return (await axios.get(`${this._api}/event-summaries/${start.toISOString()}`)).data;
        }
        catch {
            return [];
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

    public async startBreak(duration: number): Promise<boolean> {
        try {
            const endpoint = `${this._api}/scheduled-break-prompts`;

            return (await axios.post(endpoint, new BreakSessionConfirmationDto(false, duration))).data;
        }
        catch {
            return false;
        }
    }

    public async skipBreak(): Promise<boolean> {
        try {
            const endpoint = `${this._api}/scheduled-break-prompts`;

            return (await axios.post(endpoint, new BreakSessionConfirmationDto())).data;
        }
        catch {
            return false;
        }
    }
}
