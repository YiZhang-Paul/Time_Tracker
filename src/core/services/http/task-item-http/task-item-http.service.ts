import axios from 'axios';

import { TaskItem } from '../../../models/task/task-item';

export class TaskItemHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/task-items`;

    public async getTaskItems(): Promise<TaskItem[]> {
        try {
            return (await axios.get(this._api)).data;
        }
        catch {
            return [];
        }
    }
}
