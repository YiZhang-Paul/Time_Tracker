import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';

import { EventHttpService } from './event-http.service';

describe('event http service unit test', () => {
    let service: EventHttpService;

    beforeEach(() => {
        service = container.get<EventHttpService>(types.EventHttpService);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });
});
