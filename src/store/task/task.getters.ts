import { GetterTree } from 'vuex';

import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';
import { OngoingEventTimeDistribution } from '../../core/models/event-history/ongoing-event-time-distribution';
import { EventType } from '../../core/enums/event-type.enum';
import { GetterKey as eventHistoryGetterKey } from '../event-history/event-history.getters';
import { key as eventHistoryKey } from '../event-history/event-history.store';

import { IState } from './task.state';

export enum GetterKey {
    Summaries = 'summaries',
    ActiveSummary = 'active_summary',
    EditingItem = 'editing_item'
}

export type Getters = {
    [GetterKey.Summaries](state: IState): (searchText: string) => TaskItemSummaryDto[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.ActiveSummary](state: IState, getters: any, rootState: any, rootGetters: any): TaskItemSummaryDto | null;
    [GetterKey.EditingItem](state: IState): TaskItem | null;
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.Summaries]: (state: IState) => (searchText: string) => {
        const summaries = state.summaries.filter(_ => _.name.toLowerCase().includes(searchText));

        return summaries.sort((a, b) => a.id - b.id);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.ActiveSummary]: (state: IState, _a: any, _b: any, rootGetters: any): TaskItemSummaryDto | null => {
        if (!rootGetters[`${eventHistoryKey}/${eventHistoryGetterKey.IsWorking}`]) {
            return null;
        }

        const key = `${eventHistoryKey}/${eventHistoryGetterKey.OngoingTimeDistribution}`;
        const { unconcluded } = rootGetters[key] as OngoingEventTimeDistribution;

        if (unconcluded!.eventType !== EventType.Task) {
            return null;
        }

        return state.summaries.find(_ => _.id === unconcluded!.resourceId) ?? null;
    },
    [GetterKey.EditingItem]: (state: IState): TaskItem | null => state.editingItem
};
