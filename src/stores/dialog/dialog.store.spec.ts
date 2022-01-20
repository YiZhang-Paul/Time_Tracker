import { setActivePinia, createPinia } from 'pinia';

import { DialogConfig } from '../../core/models/generic/dialog-config';

import { useDialogStore } from './dialog.store';

describe('dialog store unit test', () => {
    let store: ReturnType<typeof useDialogStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useDialogStore();
    });

    describe('open', () => {
        test('should open dialog', () => {
            const config1 = new DialogConfig(null, 'config_1');
            const config2 = new DialogConfig(null, 'config_2');
            expect(store.configs).toEqual([]);

            store.open(config1);
            expect(store.configs).toEqual([config1]);

            store.open(config2);
            expect(store.configs).toEqual([config1, config2]);
        });
    });

    describe('close', () => {
        test('should close dialog', () => {
            const config1 = new DialogConfig(null, 'config_1');
            const config2 = new DialogConfig(null, 'config_2');
            store.open(config1);
            store.open(config2);
            expect(store.configs).toEqual([config1, config2]);

            store.close(store.configs[0]);
            expect(store.configs).toEqual([config2]);

            store.close(store.configs[0]);
            expect(store.configs).toEqual([]);
        });
    });
});
