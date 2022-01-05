import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';

import { InterruptionItemHttpService } from './interruption-item-http.service';

describe('interruption item http service unit test', () => {
    let service: InterruptionItemHttpService;

    beforeEach(() => {
        service = container.get<InterruptionItemHttpService>(types.InterruptionItemHttpService);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });
});
