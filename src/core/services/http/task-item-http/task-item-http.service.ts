import axios from 'axios';
import { injectable } from 'inversify';

import { TaskItemSummaryDto } from '../../../dtos/task-item-summary-dto';
import { TaskItem } from '../../../models/task/task-item';

@injectable()
export class TaskItemHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/task-items`;

    public async getTaskItem(id: number): Promise<TaskItem | null> {
        try {
            return (await axios.get(`${this._api}/${id}`)).data;
        }
        catch {
            return null;
        }
    }

    public async getTaskItems(): Promise<TaskItemSummaryDto[]> {
        try {
            return (await axios.get(`${this._api}/summaries`)).data;
        }
        catch {
            return [];
        }
    }

    public async createTaskItem(item: TaskItem): Promise<TaskItem | null> {
        try {
            return (await axios.post(this._api, item)).data;
        }
        catch {
            return null;
        }
    }
}
