import 'reflect-metadata';
import { Container } from 'inversify';

import { InterruptionItemHttpService } from '../services/http/interruption-item-http/interruption-item-http.service';
import { TaskItemHttpService } from '../services/http/task-item-http/task-item-http.service';
import { EventHistoryHttpService } from '../services/http/event-history-http/event-history-http.service';

import { types } from './types';

export const container = new Container();

container
    .bind<InterruptionItemHttpService>(types.InterruptionItemHttpService)
    .to(InterruptionItemHttpService)
    .inTransientScope();

container
    .bind<TaskItemHttpService>(types.TaskItemHttpService)
    .to(TaskItemHttpService)
    .inTransientScope();

container
    .bind<EventHistoryHttpService>(types.EventHistoryHttpService)
    .to(EventHistoryHttpService)
    .inTransientScope();
