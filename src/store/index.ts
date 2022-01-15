import { createStore as createStoreBase } from 'vuex';

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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createStore = () => {
    const base = createStoreBase({
        modules: {
            [interruptionKey]: createInterruptionModule(),
            [taskKey]: createTaskModule(),
            [eventKey]: createEventModule(),
            [dialogKey]: createDialogModule()
        }
    });

    return {
        base,
        [interruptionKey]: createInterruptionHandlers(interruptionKey, () => base),
        [taskKey]: createTaskHandlers(taskKey, () => base),
        [eventKey]: createEventHandlers(eventKey, () => base),
        [dialogKey]: createDialogHandlers(dialogKey, () => base)
    };
};
