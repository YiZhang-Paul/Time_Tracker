import { createStore } from '../../store';
import { ActionKey } from '../../store/dialog/dialog.actions';
import { DialogConfig } from '../../core/models/generic/dialog-config';

describe('dialog store unit test', () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        store = createStore();
    });

    describe(ActionKey.OpenDialog, () => {
        test('should push dialog configuration', () => {
            const config1 = new DialogConfig(null, 'config_1');
            const config2 = new DialogConfig(null, 'config_2');
            expect(store.dialog.getters(store.dialog.getter.Configs)).toEqual([]);

            store.dialog.dispatch(store.dialog.action.OpenDialog, config1);
            expect(store.dialog.getters(store.dialog.getter.Configs)).toEqual([config1]);

            store.dialog.dispatch(store.dialog.action.OpenDialog, config2);
            expect(store.dialog.getters(store.dialog.getter.Configs)).toEqual([config1, config2]);
        });
    });

    describe(ActionKey.CloseDialog, () => {
        test('should remove dialog configuration', () => {
            const config1 = new DialogConfig(null, 'config_1');
            const config2 = new DialogConfig(null, 'config_2');
            store.dialog.dispatch(store.dialog.action.OpenDialog, config1);
            store.dialog.dispatch(store.dialog.action.OpenDialog, config2);
            expect(store.dialog.getters(store.dialog.getter.Configs)).toEqual([config1, config2]);

            let target = store.dialog.getters(store.dialog.getter.Configs)[0];
            store.dialog.dispatch(store.dialog.action.CloseDialog, target);
            expect(store.dialog.getters(store.dialog.getter.Configs)).toEqual([config2]);

            target = store.dialog.getters(store.dialog.getter.Configs)[0];
            store.dialog.dispatch(store.dialog.action.CloseDialog, target);
            expect(store.dialog.getters(store.dialog.getter.Configs)).toEqual([]);
        });
    });
});
