import { createStore as createBaseStore, Store } from 'vuex';

import { createModule as createTaskModule, createHandlers as createTaskHandlers } from './task/task.store';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: Store<any>;
const getStore = () => store;
const taskKey = 'task';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createStore = () => {
    store = createBaseStore({
        modules: {
            [taskKey]: createTaskModule()
        }
    });

    return {
        store,
        [taskKey]: createTaskHandlers(taskKey, getStore)
    };
};

export default createStore();
