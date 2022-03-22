import { types } from '../../ioc/types';
import { container } from '../../ioc/container';

import { AuthenticationService } from './authentication.service';

describe('authentication service unit test', () => {
    let service: AuthenticationService;

    beforeEach(() => {
        service = container.get<AuthenticationService>(types.AuthenticationService);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });
});
