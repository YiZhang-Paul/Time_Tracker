import { Module, Store } from 'vuex';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { EventHttpService } from '../../core/services/http/event-http/event-http.service';
import { DataStoreUtility } from '../../core/utilities/data-store-utility/data-store-utility';

import { IState, state } from './event.state';
import { GetterKey, getters, Getters } from './event.getters';
import { Mutations, MutationKey, mutations } from './event.mutations';
import { ActionKey, actions, Actions, setActionServices } from './event.actions';

export const key = 'event';
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
    setActionServices(container.get<EventHttpService>(types.EventHttpService));

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
