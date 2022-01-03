import { GetterTree } from 'vuex';

import { DialogConfig } from '../../core/models/generic/dialog-config';

import { IState } from './dialog.state';

export enum GetterKey {
    Configs = 'configs'
}

export type Getters = {
    [GetterKey.Configs](state: IState): DialogConfig<unknown, unknown>[];
}

export const getters: GetterTree<IState, IState> & Getters = {
    [GetterKey.Configs]: (state: IState): DialogConfig<unknown, unknown>[] => state.configs
};
