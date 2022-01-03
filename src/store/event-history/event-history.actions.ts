import { ActionContext, ActionTree } from 'vuex';

import { EventHistoryHttpService } from '../../core/services/http/event-history-http/event-history-http.service';

import { IState } from './event-history.state';
import { Mutations, MutationKey } from './event-history.mutations';

let eventHistoryHttpService: EventHistoryHttpService;

export const setActionServices = (eventHistoryHttp: EventHistoryHttpService): void => {
    eventHistoryHttpService = eventHistoryHttp;
};

export enum ActionKey {
    LoadCurrentTimeDistribution = 'load_current_time_distribution',
    StartIdlingSession = 'start_idling_session',
    StartInterruptionItem = 'start_interruption_item',
    StartTaskItem = 'start_task_item'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload?: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadCurrentTimeDistribution](context: ActionAugments): Promise<void>;
    [ActionKey.StartIdlingSession](context: ActionAugments): Promise<boolean>;
    [ActionKey.StartInterruptionItem](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartTaskItem](context: ActionAugments, id: number): Promise<boolean>;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadCurrentTimeDistribution](context: ActionAugments): Promise<void> {
        const distribution = await eventHistoryHttpService.getCurrentTimeDistribution();
        context.commit(MutationKey.SetCurrentTimeDistribution, distribution);
    },
    async [ActionKey.StartIdlingSession](context: ActionAugments): Promise<boolean> {
        const isStarted = await eventHistoryHttpService.startIdlingSession();

        if (isStarted) {
            await context.dispatch(ActionKey.LoadCurrentTimeDistribution);
        }

        return isStarted;
    },
    async [ActionKey.StartInterruptionItem](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHistoryHttpService.startInterruptionItem(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadCurrentTimeDistribution);
        }

        return isStarted;
    },
    async [ActionKey.StartTaskItem](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHistoryHttpService.startTaskItem(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadCurrentTimeDistribution);
        }

        return isStarted;
    }
};
