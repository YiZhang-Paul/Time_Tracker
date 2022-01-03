import { Module, Store } from 'vuex';

import { DataStoreUtility } from '../../core/utilities/data-store-utility/data-store-utility';

import { IState, state } from './dialog.state';
import { GetterKey, getters, Getters } from './dialog.getters';
import { Mutations, MutationKey, mutations } from './dialog.mutations';
import { ActionKey, actions, Actions } from './dialog.actions';

export const key = 'dialog';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createModule = (): Module<IState, any> => ({
    namespaced: true,
    state,
    getters,
    mutations,
    actions
});
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const createHandlers = (namespace: string, getStore: () => Store<any>) => {
    return DataStoreUtility.getHandlers<
        IState,
        Getters,
        Mutations,
        Actions,
        typeof GetterKey,
        typeof MutationKey,
        typeof ActionKey
    >(namespace, GetterKey, MutationKey, ActionKey, getStore);
};
