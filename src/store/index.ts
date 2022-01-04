import { createStore as createBaseStore, Store } from 'vuex';

import {
    createModule as createInterruptionModule,
    createHandlers as createInterruptionHandlers,
    key as interruptionKey
} from './interruption/interruption.store';

import {
    createModule as createTaskModule,
    createHandlers as createTaskHandlers,
    key as taskKey
} from './task/task.store';

import {
    createModule as createEventModule,
    createHandlers as createEventHandlers,
    key as eventKey
} from './event/event.store';

import {
    createModule as createDialogModule,
    createHandlers as createDialogHandlers,
    key as dialogKey
} from './dialog/dialog.store';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: Store<any>;
const getStore = () => store;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createStore = () => {
    store = createBaseStore({
        modules: {
            [interruptionKey]: createInterruptionModule(),
            [taskKey]: createTaskModule(),
            [eventKey]: createEventModule(),
            [dialogKey]: createDialogModule()
        }
    });

    return {
        store,
        [interruptionKey]: createInterruptionHandlers(interruptionKey, getStore),
        [taskKey]: createTaskHandlers(taskKey, getStore),
        [eventKey]: createEventHandlers(eventKey, getStore),
        [dialogKey]: createDialogHandlers(dialogKey, getStore)
    };
};

export default createStore();
