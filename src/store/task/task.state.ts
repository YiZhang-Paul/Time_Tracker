import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';

export interface IState {
    summaries: TaskItemSummaryDto[];
    editingItem: TaskItem | null;
}

export const state = (): IState => ({
    summaries: [],
    editingItem: null
});
