import axios from 'axios';
import { SinonStub, stub } from 'sinon';

import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { BreakSessionConfirmationDto } from '../../../dtos/break-session-confirmation-dto';

import { EventHttpService } from './event-http.service';

describe('event http service unit test', () => {
    let service: EventHttpService;
    let postStub: SinonStub;

    beforeEach(() => {
        postStub = stub(axios, 'post');
        service = container.get<EventHttpService>(types.EventHttpService);
    });

    afterEach(() => {
        postStub.restore();
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });

    describe('startBreak', () => {
        test('should send correct payload', () => {
            service.startBreak(5000);

            const payload = postStub.getCall(0).args[1] as BreakSessionConfirmationDto;

            expect(payload.isSkip).toEqual(false);
            expect(payload.targetDuration).toEqual(5000);
        });
    });

    describe('skipBreak', () => {
        test('should send correct payload', () => {
            service.skipBreak();

            const payload = postStub.getCall(0).args[1] as BreakSessionConfirmationDto;

            expect(payload.isSkip).toEqual(true);
            expect(payload.targetDuration).toEqual(-1);
        });
    });
});
