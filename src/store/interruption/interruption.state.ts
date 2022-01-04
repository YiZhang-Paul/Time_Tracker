import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';

export interface IState {
    summaries: InterruptionItemSummaryDto[];
    editingItem: InterruptionItem | null;
}

export const state = (): IState => ({
    summaries: [],
    editingItem: null
});
