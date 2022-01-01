import { ActionContext, ActionTree } from 'vuex';

import { EventHistoryHttpService } from '../../core/services/http/event-history-http/event-history-http.service';

import { IState } from './event-history.state';
import { Mutations, MutationKey } from './event-history.mutations';

let eventHistoryHttpService: EventHistoryHttpService;

export const setActionServices = (eventHistoryHttp: EventHistoryHttpService): void => {
    eventHistoryHttpService = eventHistoryHttp;
};

export enum ActionKey {
    LoadLastHistory = 'load_last_history'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadLastHistory](context: ActionAugments): Promise<void>;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadLastHistory](context: ActionAugments): Promise<void> {
        context.commit(MutationKey.SetLastHistory, await eventHistoryHttpService.getLastEventHistory());
    }
};
