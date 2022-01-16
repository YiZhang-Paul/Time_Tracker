import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';

import { TaskItemHttpService } from './task-item-http.service';

describe('task item http service unit test', () => {
    let service: TaskItemHttpService;

    beforeEach(() => {
        service = container.get<TaskItemHttpService>(types.TaskItemHttpService);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });
});
