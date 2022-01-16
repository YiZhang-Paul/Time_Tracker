import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { EventHistory } from '../../../models/event/event-history';
import { EventTimeSummary } from '../../../models/event/event-time-summary';
import { OngoingEventTimeSummary } from '../../../models/event/ongoing-event-time-summary';
import { EventType } from '../../../enums/event-type.enum';
import { EventHttpService } from '../../http/event-http/event-http.service';

import { EventStateService } from './event-state.service';

describe('event state service unit test', () => {
    let service: EventStateService;
    let eventHttpStub: SinonStubbedInstance<EventHttpService>;
    let summary: OngoingEventTimeSummary;

    beforeEach(() => {
        eventHttpStub = createStubInstance(EventHttpService);

        container
            .rebind<EventHttpService>(types.EventHttpService)
            .toConstantValue(eventHttpStub);

        container
            .rebind<ReturnType<typeof createStore>>(types.Store)
            .toDynamicValue(() => createStore())
            .inTransientScope();

        service = container.get<EventStateService>(types.EventStateService);
    });

    beforeEach(() => {
        summary = {
            concludedSinceStart: new EventTimeSummary(),
            concludedSinceLastBreakPrompt: new EventTimeSummary(),
            unconcludedSinceStart: new EventHistory(),
            unconcludedSinceLastBreakPrompt: new EventHistory()
        };

        eventHttpStub.getOngoingEventSummary.resolves(summary);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });

    describe('isWorking', () => {
        test('should return false when event summary is not available', () => {
            expect(service.ongoingEventSummary).toBeNull();
            expect(service.isWorking).toEqual(false);
        });

        test('should return false when idling session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await service.loadOngoingEventSummary();

            expect(service.isWorking).toEqual(false);
        });

        test('should return false when break session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await service.loadOngoingEventSummary();

            expect(service.isWorking).toEqual(false);
        });

        test('should return true when interruption item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            await service.loadOngoingEventSummary();

            expect(service.isWorking).toEqual(true);
        });

        test('should return true when task item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Task;
            await service.loadOngoingEventSummary();

            expect(service.isWorking).toEqual(true);
        });
    });

    describe('isNotWorking', () => {
        test('should return false when event summary is not available', () => {
            expect(service.ongoingEventSummary).toBeNull();
            expect(service.isNotWorking).toEqual(false);
        });

        test('should return false when interruption item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            await service.loadOngoingEventSummary();

            expect(service.isNotWorking).toEqual(false);
        });

        test('should return false when task item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Task;
            await service.loadOngoingEventSummary();

            expect(service.isNotWorking).toEqual(false);
        });

        test('should return true when idling session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await service.loadOngoingEventSummary();

            expect(service.isNotWorking).toEqual(true);
        });

        test('should return true when break session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await service.loadOngoingEventSummary();

            expect(service.isNotWorking).toEqual(true);
        });
    });

    describe('isActiveWorkItem', () => {
        test('should return false when event summary is not available', () => {
            expect(service.ongoingEventSummary).toBeNull();
            expect(service.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when idling session is active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await service.loadOngoingEventSummary();

            expect(service.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when break session is active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await service.loadOngoingEventSummary();

            expect(service.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when item is not active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            await service.loadOngoingEventSummary();

            expect(service.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return true when item is active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Task;
            await service.loadOngoingEventSummary();

            expect(service.isActiveWorkItem(EventType.Task, 1)).toEqual(true);
        });
    });

    describe('hasScheduledBreak', () => {
        test('should return false when event summary is not available', () => {
            expect(service.ongoingEventSummary).toBeNull();
            expect(service.hasScheduledBreak).toEqual(false);
        });

        test('should return false when idling session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await service.loadOngoingEventSummary();

            expect(service.hasScheduledBreak).toEqual(false);
        });

        test('should return false when break session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await service.loadOngoingEventSummary();

            expect(service.hasScheduledBreak).toEqual(false);
        });

        test('should return false when scheduled break is not needed', async() => {
            const limit = service.workDurationLimit;
            summary.unconcludedSinceStart.eventType = EventType.Interruption;

            summary.concludedSinceLastBreakPrompt.working = limit / 2;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            await service.loadOngoingEventSummary();
            expect(service.hasScheduledBreak).toEqual(false);

            summary.concludedSinceLastBreakPrompt.working = 0;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit / 2).toISOString();
            await service.loadOngoingEventSummary();
            expect(service.hasScheduledBreak).toEqual(false);
        });

        test('should return true when scheduled break is needed', async() => {
            const limit = service.workDurationLimit;
            summary.unconcludedSinceStart.eventType = EventType.Task;

            summary.concludedSinceLastBreakPrompt.working = limit;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            await service.loadOngoingEventSummary();
            expect(service.hasScheduledBreak).toEqual(true);

            summary.concludedSinceLastBreakPrompt.working = 0;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit).toISOString();
            await service.loadOngoingEventSummary();
            expect(service.hasScheduledBreak).toEqual(true);
        });
    });

    describe('workingDuration', () => {
        test('should return zero when event summary is not available', () => {
            expect(service.ongoingEventSummary).toBeNull();
            expect(service.workingDuration).toEqual(0);
        });

        test('should return correct duration when not working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.working = 2000;
            await service.loadOngoingEventSummary();

            expect(Math.abs(service.workingDuration - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.working = 2000;
            await service.loadOngoingEventSummary();

            expect(Math.abs(service.workingDuration - 5000)).toBeLessThan(100);
        });
    });

    describe('nonWorkingDuration', () => {
        test('should return zero when event summary is not available', () => {
            expect(service.ongoingEventSummary).toBeNull();
            expect(service.nonWorkingDuration).toEqual(0);
        });

        test('should return correct duration when working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Task;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.notWorking = 2000;
            await service.loadOngoingEventSummary();

            expect(Math.abs(service.nonWorkingDuration - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when not working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.notWorking = 2000;
            await service.loadOngoingEventSummary();

            expect(Math.abs(service.nonWorkingDuration - 5000)).toBeLessThan(100);
        });
    });

    describe('loadOngoingEventSummary', () => {
        test('should load ongoing event summary', async() => {
            const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
            expect(service.ongoingEventSummary).not.toEqual(summary);

            await service.loadOngoingEventSummary();

            sinonExpect.calledOnceWithExactly(eventHttpStub.getOngoingEventSummary, dayStart);
            expect(service.ongoingEventSummary).toEqual(summary);
        });
    });

    describe('startIdling', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startIdling.resolves(false);

            const result = await service.startIdling();

            sinonExpect.calledOnce(eventHttpStub.startIdling);
            expect(service.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing event summary on success', async() => {
            eventHttpStub.startIdling.resolves(true);

            const result = await service.startIdling();

            sinonExpect.calledOnce(eventHttpStub.startIdling);
            expect(service.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('startInterruption', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startInterruption.resolves(false);

            const result = await service.startInterruption(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruption, 1);
            expect(service.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing event summary on success', async() => {
            eventHttpStub.startInterruption.resolves(true);

            const result = await service.startInterruption(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruption, 1);
            expect(service.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('startTask', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startTask.resolves(false);

            const result = await service.startTask(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTask, 1);
            expect(service.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing event summary on success', async() => {
            eventHttpStub.startTask.resolves(true);

            const result = await service.startTask(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTask, 1);
            expect(service.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('startBreak', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startBreak.resolves(false);

            const result = await service.startBreak();

            sinonExpect.calledOnce(eventHttpStub.startBreak);
            expect(service.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing event summary on success', async() => {
            eventHttpStub.startBreak.resolves(true);

            const result = await service.startBreak();

            sinonExpect.calledOnce(eventHttpStub.startBreak);
            expect(service.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('skipBreak', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.skipBreak.resolves(false);

            const result = await service.skipBreak();

            sinonExpect.calledOnce(eventHttpStub.skipBreak);
            expect(service.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should skip session and load ongoing event summary on success', async() => {
            eventHttpStub.skipBreak.resolves(true);

            const result = await service.skipBreak();

            sinonExpect.calledOnce(eventHttpStub.skipBreak);
            expect(service.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });
});
