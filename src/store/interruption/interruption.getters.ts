import { GetterTree } from 'vuex';

import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
import { EventType } from '../../core/enums/event-type.enum';
import { GetterKey as eventGetterKey } from '../event/event.getters';
import { key as eventKey } from '../event/event.store';

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
        if (!rootGetters[`${eventKey}/${eventGetterKey.IsWorking}`]) {
            return null;
        }

        const key = `${eventKey}/${eventGetterKey.OngoingTimeSummary}`;
        const { unconcludedSinceStart } = rootGetters[key] as OngoingEventTimeSummary;

        if (unconcludedSinceStart.eventType !== EventType.Interruption) {
            return null;
        }

        return state.summaries.find(_ => _.id === unconcludedSinceStart.resourceId) ?? null;
    },
    [GetterKey.EditingItem]: (state: IState): InterruptionItem | null => state.editingItem
};
