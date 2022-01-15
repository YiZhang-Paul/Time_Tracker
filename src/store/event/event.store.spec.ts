import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { createStore } from '../../store';
import { GetterKey } from '../../store/event/event.getters';
import { ActionKey } from '../../store/event/event.actions';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { EventHistory } from '../../core/models/event/event-history';
import { EventTimeSummary } from '../../core/models/event/event-time-summary';
import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
import { EventType } from '../../core/enums/event-type.enum';
import { EventHttpService } from '../../core/services/http/event-http/event-http.service';

describe('event store unit test', () => {
    let store: ReturnType<typeof createStore>;
    let eventHttpStub: SinonStubbedInstance<EventHttpService>;
    let timeSummary: OngoingEventTimeSummary;

    beforeEach(() => {
        eventHttpStub = createStubInstance(EventHttpService);

        container
            .rebind<EventHttpService>(types.EventHttpService)
            .toConstantValue(eventHttpStub as unknown as EventHttpService);

        store = createStore();
    });

    beforeEach(() => {
        timeSummary = {
            concludedSinceStart: new EventTimeSummary(),
            concludedSinceLastBreakPrompt: new EventTimeSummary(),
            unconcludedSinceStart: new EventHistory(),
            unconcludedSinceLastBreakPrompt: new EventHistory()
        };

        eventHttpStub.getOngoingTimeSummary.resolves(timeSummary);
    });

    describe(GetterKey.IsWorking, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, null);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(false);
        });

        test('should return false when idling session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(false);
        });

        test('should return false when break session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(false);
        });

        test('should return true when interruption item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(true);
        });

        test('should return true when task item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(true);
        });
    });

    describe(GetterKey.IsNotWorking, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, null);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(false);
        });

        test('should return false when interruption item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(false);
        });

        test('should return false when task item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(false);
        });

        test('should return true when idling session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(true);
        });

        test('should return true when break session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(true);
        });
    });

    describe(GetterKey.IsActiveWorkItem, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, null);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when idling session is active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when break session is active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when item is not active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return true when item is active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(true);
        });
    });

    describe(GetterKey.IsScheduledBreakNeeded, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, null);

            expect(store.event.getters(store.event.getter.IsScheduledBreakNeeded)).toEqual(false);
        });

        test('should return false when idling session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsScheduledBreakNeeded)).toEqual(false);
        });

        test('should return false when break session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsScheduledBreakNeeded)).toEqual(false);
        });

        test('should return false when scheduled break is not needed', () => {
            const limit = store.event.getters(store.event.getter.WorkingDurationLimit);
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;

            timeSummary.concludedSinceLastBreakPrompt.working = limit / 2;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);
            expect(store.event.getters(store.event.getter.IsScheduledBreakNeeded)).toEqual(false);

            timeSummary.concludedSinceLastBreakPrompt.working = 0;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit / 2).toISOString();
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);
            expect(store.event.getters(store.event.getter.IsScheduledBreakNeeded)).toEqual(false);
        });

        test('should return true when scheduled break is needed', () => {
            const limit = store.event.getters(store.event.getter.WorkingDurationLimit);
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;

            timeSummary.concludedSinceLastBreakPrompt.working = limit;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);
            expect(store.event.getters(store.event.getter.IsScheduledBreakNeeded)).toEqual(true);

            timeSummary.concludedSinceLastBreakPrompt.working = 0;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit).toISOString();
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);
            expect(store.event.getters(store.event.getter.IsScheduledBreakNeeded)).toEqual(true);
        });
    });

    describe(GetterKey.WorkingDuration, () => {
        test('should return zero when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, null);

            expect(store.event.getters(store.event.getter.WorkingDuration)).toEqual(0);
        });

        test('should return correct duration when not working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.working = 2000;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            const result = store.event.getters(store.event.getter.WorkingDuration);

            expect(Math.abs(result - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.working = 2000;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            const result = store.event.getters(store.event.getter.WorkingDuration);

            expect(Math.abs(result - 5000)).toBeLessThan(100);
        });
    });

    describe(GetterKey.NotWorkingDuration, () => {
        test('should return zero when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, null);

            expect(store.event.getters(store.event.getter.NotWorkingDuration)).toEqual(0);
        });

        test('should return correct duration when working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.notWorking = 2000;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            const result = store.event.getters(store.event.getter.NotWorkingDuration);

            expect(Math.abs(result - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when not working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.notWorking = 2000;
            store.event.commit(store.event.mutation.SetOngoingTimeSummary, timeSummary);

            const result = store.event.getters(store.event.getter.NotWorkingDuration);

            expect(Math.abs(result - 5000)).toBeLessThan(100);
        });
    });

    describe(ActionKey.LoadOngoingTimeSummary, () => {
        test('should load ongoing time summary', async() => {
            const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).not.toEqual(timeSummary);

            await store.event.dispatch(store.event.action.LoadOngoingTimeSummary);

            sinonExpect.calledOnceWithExactly(eventHttpStub.getOngoingTimeSummary, dayStart);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).toEqual(timeSummary);
        });
    });

    describe(ActionKey.StartIdlingSession, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startIdlingSession.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartIdlingSession);

            sinonExpect.calledOnce(eventHttpStub.startIdlingSession);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing time summary on success', async() => {
            eventHttpStub.startIdlingSession.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartIdlingSession);

            sinonExpect.calledOnce(eventHttpStub.startIdlingSession);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartInterruptionItem, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startInterruptionItem.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartInterruptionItem, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruptionItem, 1);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing time summary on success', async() => {
            eventHttpStub.startInterruptionItem.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartInterruptionItem, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruptionItem, 1);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartTaskItem, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startTaskItem.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartTaskItem, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTaskItem, 1);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing time summary on success', async() => {
            eventHttpStub.startTaskItem.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartTaskItem, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTaskItem, 1);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartBreakSession, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startBreakSession.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartBreakSession);

            sinonExpect.calledOnce(eventHttpStub.startBreakSession);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing time summary on success', async() => {
            eventHttpStub.startBreakSession.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartBreakSession);

            sinonExpect.calledOnce(eventHttpStub.startBreakSession);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.SkipBreakSession, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.skipBreakSession.resolves(false);

            const result = await store.event.dispatch(store.event.action.SkipBreakSession);

            sinonExpect.calledOnce(eventHttpStub.skipBreakSession);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should skip session and load ongoing time summary on success', async() => {
            eventHttpStub.skipBreakSession.resolves(true);

            const result = await store.event.dispatch(store.event.action.SkipBreakSession);

            sinonExpect.calledOnce(eventHttpStub.skipBreakSession);
            expect(store.event.getters(store.event.getter.OngoingTimeSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });
});
