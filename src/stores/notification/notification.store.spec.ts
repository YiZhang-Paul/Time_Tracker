import { setActivePinia, createPinia } from 'pinia';

import { useNotificationStore } from './notification.store';

describe('notification store unit test', () => {
    let store: ReturnType<typeof useNotificationStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useNotificationStore();
    });
});
