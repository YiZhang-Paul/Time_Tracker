import { ActionContext, ActionTree } from 'vuex';

import { DialogConfig } from '../../core/models/generic/dialog-config';

import { IState } from './dialog.state';
import { Mutations, MutationKey } from './dialog.mutations';

export enum ActionKey {
    OpenDialog = 'open_dialog',
    CloseDialog = 'close_dialog'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload?: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.OpenDialog](context: ActionAugments, config: DialogConfig<unknown, unknown>): void;
    [ActionKey.CloseDialog](context: ActionAugments, config: DialogConfig<unknown, unknown>): void;
}

export const actions: ActionTree<IState, IState> & Actions = {
    [ActionKey.OpenDialog](context: ActionAugments, config: DialogConfig<unknown, unknown>): void {
        context.commit(MutationKey.AddConfig, config);
    },
    [ActionKey.CloseDialog](context: ActionAugments, config: DialogConfig<unknown, unknown>): void {
        context.commit(MutationKey.DeleteConfig, config);
    }
};
