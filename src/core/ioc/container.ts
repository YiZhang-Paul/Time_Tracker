import 'reflect-metadata';
import { Container } from 'inversify';

import { createStore } from '../../store';
import { InterruptionItemHttpService } from '../services/http/interruption-item-http/interruption-item-http.service';
import { TaskItemHttpService } from '../services/http/task-item-http/task-item-http.service';
import { EventHttpService } from '../services/http/event-http/event-http.service';
import { InterruptionStateService } from '../services/states/interruption-state/interruption-state.service';

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
    .bind<EventHttpService>(types.EventHttpService)
    .to(EventHttpService)
    .inTransientScope();

container
    .bind<ReturnType<typeof createStore>>(types.Store)
    .toConstantValue(createStore());

container
    .bind<InterruptionStateService>(types.InterruptionStateService)
    .to(InterruptionStateService)
    .inTransientScope();
