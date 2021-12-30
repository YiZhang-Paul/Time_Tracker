import { Module, Store } from 'vuex';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { InterruptionItemHttpService } from '../../core/services/http/interruption-item-http/interruption-item-http.service';
import { DataStoreUtility } from '../../core/utilities/data-store-utility/data-store-utility';

import { IState, state } from './interruption.state';
import { GetterKey, getters, Getters } from './interruption.getters';
import { Mutations, MutationKey, mutations } from './interruption.mutations';
import { ActionKey, actions, Actions, setActionServices } from './interruption.actions';
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
    setActionServices(container.get<InterruptionItemHttpService>(types.InterruptionItemHttpService));

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
