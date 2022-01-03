import { MutationTree } from 'vuex';

import { DialogConfig } from '../../core/models/generic/dialog-config';

import { IState } from './dialog.state';

export enum MutationKey {
    AddConfig = 'add_config',
    DeleteConfig = 'delete_config'
}

export type Mutations = {
    [MutationKey.AddConfig](state: IState, config: DialogConfig<unknown, unknown>): void;
    [MutationKey.DeleteConfig](state: IState, config: DialogConfig<unknown, unknown>): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.AddConfig](state: IState, config: DialogConfig<unknown, unknown>): void {
        state.configs = [...state.configs, config];
    },
    [MutationKey.DeleteConfig](state: IState, config: DialogConfig<unknown, unknown>): void {
        state.configs = state.configs.filter(_ => _ !== config);
    }
};
