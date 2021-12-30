import { InterruptionItem } from '../../core/models/interruption/interruption-item';

export interface IState {
    editingItem: InterruptionItem | null;
}

export const state = (): IState => ({
    editingItem: null
});
