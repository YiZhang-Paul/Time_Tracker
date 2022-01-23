import { setActivePinia, createPinia } from 'pinia';
import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { OngoingEventTimeSummaryDto } from '../../core/dtos/ongoing-event-time-summary-dto';
import { EventHistory } from '../../core/models/event/event-history';
import { EventTimeSummary } from '../../core/models/event/event-time-summary';
import { EventType } from '../../core/enums/event-type.enum';
import { EventHttpService } from '../../core/services/http/event-http/event-http.service';

import { setServices, useEventStore } from './event.store';

describe('event store unit test', () => {
    let store: ReturnType<typeof useEventStore>;
    let eventHttpStub: SinonStubbedInstance<EventHttpService>;
    let summary: OngoingEventTimeSummaryDto;

    beforeEach(() => {
        eventHttpStub = createStubInstance(EventHttpService);
        setServices(eventHttpStub);
        setActivePinia(createPinia());
        store = useEventStore();
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

    describe('isWorking', () => {
        test('should return false when event summary is not available', () => {
            expect(store.ongoingEventSummary).toBeNull();
            expect(store.isWorking).toEqual(false);
        });

        test('should return false when idling session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await store.loadOngoingEventSummary();

            expect(store.isWorking).toEqual(false);
        });

        test('should return false when break session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await store.loadOngoingEventSummary();

            expect(store.isWorking).toEqual(false);
        });

        test('should return true when interruption item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            await store.loadOngoingEventSummary();

            expect(store.isWorking).toEqual(true);
        });

        test('should return true when task item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Task;
            await store.loadOngoingEventSummary();

            expect(store.isWorking).toEqual(true);
        });
    });

    describe('isNotWorking', () => {
        test('should return false when event summary is not available', () => {
            expect(store.ongoingEventSummary).toBeNull();
            expect(store.isNotWorking).toEqual(false);
        });

        test('should return false when interruption item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            await store.loadOngoingEventSummary();

            expect(store.isNotWorking).toEqual(false);
        });

        test('should return false when task item is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Task;
            await store.loadOngoingEventSummary();

            expect(store.isNotWorking).toEqual(false);
        });

        test('should return true when idling session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await store.loadOngoingEventSummary();

            expect(store.isNotWorking).toEqual(true);
        });

        test('should return true when break session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await store.loadOngoingEventSummary();

            expect(store.isNotWorking).toEqual(true);
        });
    });

    describe('isBreaking', () => {
        test('should return false when event summary is not available', () => {
            expect(store.ongoingEventSummary).toBeNull();
            expect(store.isBreaking).toEqual(false);
        });

        test('should return false when break session is not active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await store.loadOngoingEventSummary();

            expect(store.isBreaking).toEqual(false);
        });

        test('should return true when break session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await store.loadOngoingEventSummary();

            expect(store.isBreaking).toEqual(true);
        });
    });

    describe('isActiveWorkItem', () => {
        test('should return false when event summary is not available', () => {
            expect(store.ongoingEventSummary).toBeNull();
            expect(store.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when idling session is active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await store.loadOngoingEventSummary();

            expect(store.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when break session is active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await store.loadOngoingEventSummary();

            expect(store.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when item is not active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            await store.loadOngoingEventSummary();

            expect(store.isActiveWorkItem(EventType.Task, 1)).toEqual(false);
        });

        test('should return true when item is active', async() => {
            summary.unconcludedSinceStart.resourceId = 1;
            summary.unconcludedSinceStart.eventType = EventType.Task;
            await store.loadOngoingEventSummary();

            expect(store.isActiveWorkItem(EventType.Task, 1)).toEqual(true);
        });
    });

    describe('hasScheduledBreak', () => {
        test('should return false when event summary is not available', () => {
            const result = store.hasScheduledBreak();

            expect(store.ongoingEventSummary).toBeNull();
            expect(result).toEqual(false);
        });

        test('should return false when idling session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await store.loadOngoingEventSummary();

            expect(store.hasScheduledBreak()).toEqual(false);
        });

        test('should return false when break session is active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            await store.loadOngoingEventSummary();

            expect(store.hasScheduledBreak()).toEqual(false);
        });

        test('should return false when scheduled break is not needed', async() => {
            const limit = store.workDurationLimit;
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            summary.concludedSinceLastBreakPrompt.working = limit / 2;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            await store.loadOngoingEventSummary();

            expect(store.hasScheduledBreak()).toEqual(false);

            summary.concludedSinceLastBreakPrompt.working = 0;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit / 2).toISOString();
            await store.loadOngoingEventSummary();

            expect(store.hasScheduledBreak()).toEqual(false);
        });

        test('should return true when scheduled break is needed', async() => {
            const limit = store.workDurationLimit;
            summary.unconcludedSinceStart.eventType = EventType.Task;
            summary.concludedSinceLastBreakPrompt.working = limit;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            await store.loadOngoingEventSummary();

            expect(store.hasScheduledBreak()).toEqual(true);

            summary.concludedSinceLastBreakPrompt.working = 0;
            summary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit).toISOString();
            await store.loadOngoingEventSummary();

            expect(store.hasScheduledBreak()).toEqual(true);
        });
    });

    describe('getWorkingDuration', () => {
        test('should return zero when event summary is not available', () => {
            const result = store.getWorkingDuration();

            expect(store.ongoingEventSummary).toBeNull();
            expect(result).toEqual(0);
        });

        test('should return correct duration when not working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.working = 2000;
            await store.loadOngoingEventSummary();

            expect(Math.abs(store.getWorkingDuration() - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Interruption;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.working = 2000;
            await store.loadOngoingEventSummary();

            expect(Math.abs(store.getWorkingDuration() - 5000)).toBeLessThan(100);
        });
    });

    describe('getNonWorkingDuration', () => {
        test('should return zero when event summary is not available', () => {
            const result = store.getNonWorkingDuration();

            expect(store.ongoingEventSummary).toBeNull();
            expect(result).toEqual(0);
        });

        test('should return correct duration when working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Task;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.notWorking = 2000;
            await store.loadOngoingEventSummary();

            expect(Math.abs(store.getNonWorkingDuration() - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when not working', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            summary.concludedSinceStart.notWorking = 2000;
            await store.loadOngoingEventSummary();

            expect(Math.abs(store.getNonWorkingDuration() - 5000)).toBeLessThan(100);
        });
    });

    describe('getRemainingBreak', () => {
        test('should return zero when event summary is not available', () => {
            const result = store.getRemainingBreak();

            expect(store.ongoingEventSummary).toBeNull();
            expect(result).toEqual(0);
        });

        test('should return zero when break session is not active', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Idling;
            await store.loadOngoingEventSummary();

            expect(store.getRemainingBreak()).toEqual(0);
        });

        test('should return zero when break session has ended', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            summary.unconcludedSinceStart.targetDuration = 3000;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 9000).toISOString();
            await store.loadOngoingEventSummary();

            expect(store.getRemainingBreak()).toEqual(0);
        });

        test('should return remaining break time', async() => {
            summary.unconcludedSinceStart.eventType = EventType.Break;
            summary.unconcludedSinceStart.targetDuration = 6000;
            summary.unconcludedSinceStart.timestamp = new Date(Date.now() - 4000).toISOString();
            await store.loadOngoingEventSummary();

            expect(Math.abs(store.getRemainingBreak() - 2000)).toBeLessThan(100);
        });
    });

    describe('loadOngoingEventSummary', () => {
        test('should load ongoing event summary', async() => {
            const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
            expect(store.ongoingEventSummary).not.toEqual(summary);

            await store.loadOngoingEventSummary();

            sinonExpect.calledOnceWithExactly(eventHttpStub.getOngoingEventSummary, dayStart);
            expect(store.ongoingEventSummary).toEqual(summary);
        });
    });

    describe('startIdling', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startIdling.resolves(false);

            const result = await store.startIdling();

            sinonExpect.calledOnce(eventHttpStub.startIdling);
            expect(store.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing event summary on success', async() => {
            eventHttpStub.startIdling.resolves(true);

            const result = await store.startIdling();

            sinonExpect.calledOnce(eventHttpStub.startIdling);
            expect(store.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('startInterruption', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startInterruption.resolves(false);

            const result = await store.startInterruption(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruption, 1);
            expect(store.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing event summary on success', async() => {
            eventHttpStub.startInterruption.resolves(true);

            const result = await store.startInterruption(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruption, 1);
            expect(store.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('startTask', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startTask.resolves(false);

            const result = await store.startTask(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTask, 1);
            expect(store.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing event summary on success', async() => {
            eventHttpStub.startTask.resolves(true);

            const result = await store.startTask(1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTask, 1);
            expect(store.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('startBreak', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startBreak.resolves(false);

            const result = await store.startBreak();

            sinonExpect.calledOnce(eventHttpStub.startBreak);
            expect(store.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing event summary on success', async() => {
            eventHttpStub.startBreak.resolves(true);

            const result = await store.startBreak();

            sinonExpect.calledOnceWithExactly(eventHttpStub.startBreak, store.breakDuration);
            expect(store.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });

    describe('skipBreak', () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.skipBreak.resolves(false);

            const result = await store.skipBreak();

            sinonExpect.calledOnce(eventHttpStub.skipBreak);
            expect(store.ongoingEventSummary).not.toEqual(summary);
            expect(result).toEqual(false);
        });

        test('should skip session and load ongoing event summary on success', async() => {
            eventHttpStub.skipBreak.resolves(true);

            const result = await store.skipBreak();

            sinonExpect.calledOnce(eventHttpStub.skipBreak);
            expect(store.ongoingEventSummary).toEqual(summary);
            expect(result).toEqual(true);
        });
    });
});
