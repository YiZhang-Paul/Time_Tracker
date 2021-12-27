import { Module, Store } from 'vuex';

import { TaskItemHttpService } from '../../core/services/http/task-item-http/task-item-http.service';
import { DataStoreUtility } from '../../core/utilities/data-store-utility/data-store-utility';

import { IState, state } from './task.state';
import { GetterKey, getters, Getters } from './task.getters';
import { Mutations, MutationKey, mutations } from './task.mutations';
import { ActionKey, actions, Actions, setActionServices } from './task.actions';
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
    setActionServices(new TaskItemHttpService());

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
