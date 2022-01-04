import { ActionContext, ActionTree } from 'vuex';

import { EventHistoryHttpService } from '../../core/services/http/event-history-http/event-history-http.service';

import { IState } from './event-history.state';
import { Mutations, MutationKey } from './event-history.mutations';

let eventHistoryHttpService: EventHistoryHttpService;

export const setActionServices = (eventHistoryHttp: EventHistoryHttpService): void => {
    eventHistoryHttpService = eventHistoryHttp;
};

export enum ActionKey {
    LoadOngoingTimeDistribution = 'load_ongoing_time_distribution',
    StartIdlingSession = 'start_idling_session',
    StartInterruptionItem = 'start_interruption_item',
    StartTaskItem = 'start_task_item',
    StartBreakSession = 'start_break_session',
    SkipBreakSession = 'skip_break_session'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload?: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadOngoingTimeDistribution](context: ActionAugments): Promise<void>;
    [ActionKey.StartIdlingSession](context: ActionAugments): Promise<boolean>;
    [ActionKey.StartInterruptionItem](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartTaskItem](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartBreakSession](context: ActionAugments): Promise<boolean>;
    [ActionKey.SkipBreakSession](context: ActionAugments): Promise<boolean>;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadOngoingTimeDistribution](context: ActionAugments): Promise<void> {
        const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const distribution = await eventHistoryHttpService.getOngoingTimeDistribution(dayStart);
        context.commit(MutationKey.SetOngoingTimeDistribution, distribution);
    },
    async [ActionKey.StartIdlingSession](context: ActionAugments): Promise<boolean> {
        const isStarted = await eventHistoryHttpService.startIdlingSession();

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeDistribution);
        }

        return isStarted;
    },
    async [ActionKey.StartInterruptionItem](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHistoryHttpService.startInterruptionItem(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeDistribution);
        }

        return isStarted;
    },
    async [ActionKey.StartTaskItem](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHistoryHttpService.startTaskItem(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeDistribution);
        }

        return isStarted;
    },
    async [ActionKey.StartBreakSession](context: ActionAugments): Promise<boolean> {
        const isStarted = await eventHistoryHttpService.startBreakSession();

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeDistribution);
        }

        return isStarted;
    },
    async [ActionKey.SkipBreakSession](context: ActionAugments): Promise<boolean> {
        const isSkipped = await eventHistoryHttpService.skipBreakSession();

        if (isSkipped) {
            await context.dispatch(ActionKey.LoadOngoingTimeDistribution);
        }

        return isSkipped;
    }
};
