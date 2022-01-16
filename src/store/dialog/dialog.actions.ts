import { ActionContext, ActionTree } from 'vuex';

import { DialogConfig } from '../../core/models/generic/dialog-config';

import { IState } from './dialog.state';
import { Mutations, MutationKey } from './dialog.mutations';

export enum ActionKey {
    Open = 'open',
    Close = 'close'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload?: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.Open](context: ActionAugments, config: DialogConfig<unknown, unknown>): void;
    [ActionKey.Close](context: ActionAugments, config: DialogConfig<unknown, unknown>): void;
}

export const actions: ActionTree<IState, IState> & Actions = {
    [ActionKey.Open](context: ActionAugments, config: DialogConfig<unknown, unknown>): void {
        context.commit(MutationKey.AddConfig, config);
    },
    [ActionKey.Close](context: ActionAugments, config: DialogConfig<unknown, unknown>): void {
        context.commit(MutationKey.DeleteConfig, config);
    }
};
