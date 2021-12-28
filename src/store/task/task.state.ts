import { TaskItem } from '../../core/models/task/task-item';

export interface IState {
    items: TaskItem[];
}

export const state = (): IState => ({
    items: []
});
