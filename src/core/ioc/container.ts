import 'reflect-metadata';
import { Container } from 'inversify';

import { TaskItemHttpService } from '../services/http/task-item-http/task-item-http.service';

import { types } from './types';

export const container = new Container();

container
    .bind<TaskItemHttpService>(types.TaskItemHttpService)
    .to(TaskItemHttpService)
    .inTransientScope();
