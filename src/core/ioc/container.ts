import 'reflect-metadata';
import { Container } from 'inversify';

import { AuthenticationService } from '../services/authentication/authentication.service';
import { UserHttpService } from '../services/http/user-http/user-http.service';
import { InterruptionItemHttpService } from '../services/http/interruption-item-http/interruption-item-http.service';
import { TaskItemHttpService } from '../services/http/task-item-http/task-item-http.service';
import { EventHttpService } from '../services/http/event-http/event-http.service';

import { types } from './types';

export const container = new Container();

container
    .bind<AuthenticationService>(types.AuthenticationService)
    .to(AuthenticationService)
    .inSingletonScope();

container
    .bind<UserHttpService>(types.UserHttpService)
    .to(UserHttpService)
    .inTransientScope();

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
