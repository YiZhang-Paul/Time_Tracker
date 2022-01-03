import { MutationTree } from 'vuex';

import { DialogConfig } from '../../core/models/generic/dialog-config';

import { IState } from './dialog.state';

export enum MutationKey {
    EnqueueConfig = 'enqueue_config'
}

export type Mutations = {
    [MutationKey.EnqueueConfig](state: IState, config: DialogConfig<unknown, unknown>): void;
}

export const mutations: MutationTree<IState> & Mutations = {
    [MutationKey.EnqueueConfig](state: IState, config: DialogConfig<unknown, unknown>): void {
        state.configs.push(config);
    }
};
