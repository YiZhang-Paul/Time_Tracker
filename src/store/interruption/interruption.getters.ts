import { GetterTree } from 'vuex';

import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { OngoingEventTimeDistribution } from '../../core/models/event-history/ongoing-event-time-distribution';
import { EventType } from '../../core/enums/event-type.enum';
import { GetterKey as eventHistoryGetterKey } from '../event-history/event-history.getters';
import { key as eventHistoryKey } from '../event-history/event-history.store';

import { IState } from './interruption.state';

export enum GetterKey {
    Summaries = 'summaries',
    ActiveSummary = 'active_summary',
    EditingItem = 'editing_item'
}

export type Getters = {
    [GetterKey.Summaries](state: IState): (searchText: string) => InterruptionItemSummaryDto[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.ActiveSummary](state: IState, getters: any, rootState: any, rootGetters: any): InterruptionItemSummaryDto | null;
    [GetterKey.EditingItem](state: IState): InterruptionItem | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.Summaries]: (state: IState) => (searchText: string) => {
        const summaries = state.summaries.filter(_ => _.name.toLowerCase().includes(searchText));

        return summaries.sort((a, b) => a.priority === b.priority ? a.id - b.id : b.priority - a.priority);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.ActiveSummary]: (state: IState, _a: any, _b: any, rootGetters: any): InterruptionItemSummaryDto | null => {
        if (!rootGetters[`${eventHistoryKey}/${eventHistoryGetterKey.IsWorking}`]) {
            return null;
        }

        const key = `${eventHistoryKey}/${eventHistoryGetterKey.OngoingTimeDistribution}`;
        const { unconcluded } = rootGetters[key] as OngoingEventTimeDistribution;

        if (unconcluded!.eventType !== EventType.Interruption) {
            return null;
        }

        return state.summaries.find(_ => _.id === unconcluded!.resourceId) ?? null;
    },
    [GetterKey.EditingItem]: (state: IState): InterruptionItem | null => state.editingItem
};
