import { GetterTree } from 'vuex';

import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';
import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
import { EventType } from '../../core/enums/event-type.enum';
import { GetterKey as eventGetterKey } from '../event/event.getters';
import { key as eventKey } from '../event/event.store';

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
        const text = searchText.toLowerCase();
        const summaries = state.summaries.filter(_ => _.name.toLowerCase().includes(text));

        return summaries.sort((a, b) => a.id - b.id);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [GetterKey.ActiveSummary]: (state: IState, _a: any, _b: any, rootGetters: any): TaskItemSummaryDto | null => {
        if (!rootGetters[`${eventKey}/${eventGetterKey.IsWorking}`]) {
            return null;
        }

        const key = `${eventKey}/${eventGetterKey.OngoingEventSummary}`;
        const { unconcludedSinceStart } = rootGetters[key] as OngoingEventTimeSummary;

        if (unconcludedSinceStart.eventType !== EventType.Task) {
            return null;
        }

        return state.summaries.find(_ => _.id === unconcludedSinceStart.resourceId)!;
    },
    [GetterKey.EditingItem]: (state: IState): TaskItem | null => state.editingItem
};
