import { ActionContext, ActionTree } from 'vuex';

import { EventHttpService } from '../../core/services/http/event-http/event-http.service';

import { IState } from './event.state';
import { Mutations, MutationKey } from './event.mutations';

let eventHttpService: EventHttpService;

export const setActionServices = (eventHttp: EventHttpService): void => {
    eventHttpService = eventHttp;
};

export enum ActionKey {
    LoadOngoingEventSummary = 'load_ongoing_event_summary',
    StartIdling = 'start_idling',
    StartInterruption = 'start_interruption',
    StartTask = 'start_task',
    StartBreak = 'start_break',
    SkipBreak = 'skip_break'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload?: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadOngoingEventSummary](context: ActionAugments): Promise<void>;
    [ActionKey.StartIdling](context: ActionAugments): Promise<boolean>;
    [ActionKey.StartInterruption](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartTask](context: ActionAugments, id: number): Promise<boolean>;
    [ActionKey.StartBreak](context: ActionAugments): Promise<boolean>;
    [ActionKey.SkipBreak](context: ActionAugments): Promise<boolean>;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadOngoingEventSummary](context: ActionAugments): Promise<void> {
        const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const summary = await eventHttpService.getOngoingEventSummary(dayStart);
        context.commit(MutationKey.SetOngoingEventSummary, summary);
    },
    async [ActionKey.StartIdling](context: ActionAugments): Promise<boolean> {
        const isStarted = await eventHttpService.startIdling();

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingEventSummary);
        }

        return isStarted;
    },
    async [ActionKey.StartInterruption](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHttpService.startInterruption(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingEventSummary);
        }

        return isStarted;
    },
    async [ActionKey.StartTask](context: ActionAugments, id: number): Promise<boolean> {
        const isStarted = await eventHttpService.startTask(id);

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingEventSummary);
        }

        return isStarted;
    },
    async [ActionKey.StartBreak](context: ActionAugments): Promise<boolean> {
        const isStarted = await eventHttpService.startBreak();

        if (isStarted) {
            await context.dispatch(ActionKey.LoadOngoingEventSummary);
        }

        return isStarted;
    },
    async [ActionKey.SkipBreak](context: ActionAugments): Promise<boolean> {
        const isSkipped = await eventHttpService.skipBreak();

        if (isSkipped) {
            await context.dispatch(ActionKey.LoadOngoingEventSummary);
        }

        return isSkipped;
    }
};
