import { createStore as createBaseStore, Store } from 'vuex';

import { createModule as createInterruptionModule, createHandlers as createInterruptionHandlers } from './interruption/interruption.store';
import { createModule as createTaskModule, createHandlers as createTaskHandlers } from './task/task.store';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: Store<any>;
const getStore = () => store;
const interruptionKey = 'interruption';
const taskKey = 'task';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createStore = () => {
    store = createBaseStore({
        modules: {
            [interruptionKey]: createInterruptionModule(),
            [taskKey]: createTaskModule()
        }
    });

    return {
        store,
        [interruptionKey]: createInterruptionHandlers(interruptionKey, getStore),
        [taskKey]: createTaskHandlers(taskKey, getStore)
    };
};

export default createStore();
