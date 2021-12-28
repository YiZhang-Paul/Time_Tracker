import axios from 'axios';
import { injectable } from 'inversify';

import { TaskItem } from '../../../models/task/task-item';

@injectable()
export class TaskItemHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/task-items`;

    public async getTaskItems(): Promise<TaskItem[]> {
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
