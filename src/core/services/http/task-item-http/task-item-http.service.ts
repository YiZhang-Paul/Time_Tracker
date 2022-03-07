import axios from 'axios';
import { injectable } from 'inversify';

import { ItemSummariesDto } from '../../../dtos/item-summaries-dto';
import { TaskItemSummaryDto } from '../../../dtos/task-item-summary-dto';
import { TaskItem } from '../../../models/task/task-item';
import { ResolveAction } from '../../../enums/resolve-action.enum';

@injectable()
export class TaskItemHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/task-items`;

    public async getItem(id: number): Promise<TaskItem | null> {
        try {
            return (await axios.get(`${this._api}/${id}`)).data;
        }
        catch {
            return null;
        }
    }

    public async searchSummaries(searchText: string): Promise<TaskItemSummaryDto[]> {
        try {
            return (await axios.get(`${this._api}/summaries?searchText=${searchText}`)).data;
        }
        catch {
            return [];
        }
    }

    public async getSummaries(start: Date): Promise<ItemSummariesDto<TaskItemSummaryDto>> {
        try {
            return (await axios.get(`${this._api}/summaries/${start.toISOString()}`)).data;
        }
        catch {
            return new ItemSummariesDto<TaskItemSummaryDto>();
        }
    }

    public async createItem(item: TaskItem): Promise<TaskItem | null> {
        try {
            return (await axios.post(this._api, item)).data;
        }
        catch {
            return null;
        }
    }

    public async updateItem(item: TaskItem): Promise<TaskItem | null> {
        try {
            return (await axios.put(this._api, item)).data;
        }
        catch {
            return null;
        }
    }

    public async deleteItem(id: number): Promise<boolean> {
        try {
            return (await axios.delete(`${this._api}/${id}`)).data;
        }
        catch {
            return false;
        }
    }

    public async resolveItem(item: TaskItem): Promise<boolean> {
        try {
            const endpoint = `${this._api}?resolve=${ResolveAction.Resolve}`;
            const { data } = await axios.put(endpoint, item);

            return Boolean(data);
        }
        catch {
            return false;
        }
    }

    public async unresolveItem(item: TaskItem): Promise<boolean> {
        try {
            const endpoint = `${this._api}?resolve=${ResolveAction.Unresolve}`;
            const { data } = await axios.put(endpoint, item);

            return Boolean(data);
        }
        catch {
            return false;
        }
    }
}
