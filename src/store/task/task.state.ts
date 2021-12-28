import { TaskItem } from '../../core/models/task/task-item';

export interface IState {
    items: TaskItem[];
    editingItem: TaskItem | null;
}

export const state = (): IState => ({
    items: [],
    editingItem: null
});
