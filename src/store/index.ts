import { createStore as createBaseStore, Store } from 'vuex';

import { createModule as createInterruptionModule, createHandlers as createInterruptionHandlers } from './interruption/interruption.store';
import { createModule as createTaskModule, createHandlers as createTaskHandlers } from './task/task.store';
import { createModule as createEventHistoryModule, createHandlers as createEventHistoryHandlers } from './event-history/event-history.store';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: Store<any>;
const getStore = () => store;
const interruptionKey = 'interruption';
const taskKey = 'task';
const eventHistoryKey = 'eventHistory';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createStore = () => {
    store = createBaseStore({
        modules: {
            [interruptionKey]: createInterruptionModule(),
            [taskKey]: createTaskModule(),
            [eventHistoryKey]: createEventHistoryModule()
        }
    });

    return {
        store,
        [interruptionKey]: createInterruptionHandlers(interruptionKey, getStore),
        [taskKey]: createTaskHandlers(taskKey, getStore),
        [eventHistoryKey]: createEventHistoryHandlers(eventHistoryKey, getStore)
    };
};

export default createStore();
