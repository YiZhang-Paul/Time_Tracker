import { ActionContext, ActionTree } from 'vuex';

import { EventHttpService } from '../../core/services/http/event-http/event-http.service';

import { IState } from './event.state';
import { Mutations, MutationKey } from './event.mutations';

let eventHttpService: EventHttpService;

export const setActionServices = (eventHttp: EventHttpService): void => {
    eventHttpService = eventHttp;
};

export enum ActionKey {
    LoadOngoingTimeSummary = 'load_ongoing_time_summary',
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
    [ActionKey.LoadOngoingTimeSummary](context: ActionAugments): Promise<void>;
    [ActionKey.StartIdlingSession](context: ActionAugments): Promise<boolean>;
    [ActionKey.StartInterruptionItem](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartTaskItem](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartBreakSession](context: ActionAugments): Promise<boolean>;
    [ActionKey.SkipBreakSession](context: ActionAugments): Promise<boolean>;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadOngoingTimeSummary](context: ActionAugments): Promise<void> {
        const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const summary = await eventHttpService.getOngoingTimeSummary(dayStart);
        context.commit(MutationKey.SetOngoingTimeSummary, summary);
    },
    async [ActionKey.StartIdlingSession](context: ActionAugments): Promise<boolean> {
        const isStarted = await eventHttpService.startIdlingSession();

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeSummary);
        }

        return isStarted;
    },
    async [ActionKey.StartInterruptionItem](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHttpService.startInterruptionItem(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeSummary);
        }

        return isStarted;
    },
    async [ActionKey.StartTaskItem](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHttpService.startTaskItem(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeSummary);
        }

        return isStarted;
    },
    async [ActionKey.StartBreakSession](context: ActionAugments): Promise<boolean> {
        const isStarted = await eventHttpService.startBreakSession();

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingTimeSummary);
        }

        return isStarted;
    },
    async [ActionKey.SkipBreakSession](context: ActionAugments): Promise<boolean> {
        const isSkipped = await eventHttpService.skipBreakSession();

        if (isSkipped) {
            await context.dispatch(ActionKey.LoadOngoingTimeSummary);
        }

        return isSkipped;
    }
};
