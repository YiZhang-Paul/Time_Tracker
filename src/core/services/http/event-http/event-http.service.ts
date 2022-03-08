import axios from 'axios';
import { injectable } from 'inversify';

import { BreakSessionConfirmationDto } from '../../../dtos/break-session-confirmation-dto';
import { OngoingEventTimeSummaryDto } from '../../../dtos/ongoing-event-time-summary-dto';
import { EventSummariesDto } from '../../../dtos/event-summaries-dto';
import { Change } from '../../../models/generic/change';
import { EventTimelineEditorOption } from '../../../models/options/event-timeline-editor-option';

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

    public async getEventSummariesByDay(start: Date): Promise<EventSummariesDto> {
        try {
            return (await axios.get(`${this._api}/event-summaries/${start.toISOString()}`)).data;
        }
        catch {
            return new EventSummariesDto();
        }
    }

    public async downloadTimesheetsByDay(start: Date): Promise<boolean> {
        try {
            const endpoint = `${this._api}/timesheets/${start.toISOString()}`;
            const { data, headers } = await axios.get(endpoint, { responseType: 'blob' });
            const disposition = headers['content-disposition'].split(';').find(_ => /filename=/.test(_));
            const date = start.toLocaleDateString('en-CA').replace(/-/g, '_');
            const name = disposition?.replace(/^.*filename=/, '') ?? `timesheets_${date}`;
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(data);
            link.setAttribute('download', name);
            link.click();

            return true;
        }
        catch {
            return false;
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

    public async updateTimeRange(change: Change<EventTimelineEditorOption>): Promise<boolean> {
        try {
            return (await axios.put(`${this._api}/time-range`, change)).data;
        }
        catch {
            return false;
        }
    }
}
