import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';

import { UserHttpService } from './user-http.service';

describe('user http service unit test', () => {
    let service: UserHttpService;

    beforeEach(() => {
        service = container.get<UserHttpService>(types.UserHttpService);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });
});
