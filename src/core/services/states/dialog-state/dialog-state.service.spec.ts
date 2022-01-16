import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { DialogConfig } from '../../../models/generic/dialog-config';

import { DialogStateService } from './dialog-state.service';

describe('dialog state service unit test', () => {
    let service: DialogStateService;

    beforeEach(() => {
        container
            .rebind<ReturnType<typeof createStore>>(types.Store)
            .toDynamicValue(() => createStore())
            .inTransientScope();

        service = container.get<DialogStateService>(types.DialogStateService);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });

    describe('open', () => {
        test('should open dialog', () => {
            const config1 = new DialogConfig(null, 'config_1');
            const config2 = new DialogConfig(null, 'config_2');
            expect(service.configs).toEqual([]);

            service.open(config1);
            expect(service.configs).toEqual([config1]);

            service.open(config2);
            expect(service.configs).toEqual([config1, config2]);
        });
    });

    describe('close', () => {
        test('should close dialog', () => {
            const config1 = new DialogConfig(null, 'config_1');
            const config2 = new DialogConfig(null, 'config_2');
            service.open(config1);
            service.open(config2);
            expect(service.configs).toEqual([config1, config2]);

            service.close(service.configs[0]);
            expect(service.configs).toEqual([config2]);

            service.close(service.configs[0]);
            expect(service.configs).toEqual([]);
        });
    });
});
