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

        eventHttpStub.getOngoingEventSummary.resolves(timeSummary);
    });

    describe(GetterKey.IsWorking, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingEventSummary, null);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(false);
        });

        test('should return false when idling session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(false);
        });

        test('should return false when break session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(false);
        });

        test('should return true when interruption item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(true);
        });

        test('should return true when task item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsWorking)).toEqual(true);
        });
    });

    describe(GetterKey.IsNotWorking, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingEventSummary, null);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(false);
        });

        test('should return false when interruption item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(false);
        });

        test('should return false when task item is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(false);
        });

        test('should return true when idling session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(true);
        });

        test('should return true when break session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsNotWorking)).toEqual(true);
        });
    });

    describe(GetterKey.IsActiveWorkItem, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingEventSummary, null);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when idling session is active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when break session is active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return false when item is not active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(false);
        });

        test('should return true when item is active', () => {
            timeSummary.unconcludedSinceStart.resourceId = 1;
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, 1)).toEqual(true);
        });
    });

    describe(GetterKey.HasScheduledBreak, () => {
        test('should return false when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingEventSummary, null);

            expect(store.event.getters(store.event.getter.HasScheduledBreak)).toEqual(false);
        });

        test('should return false when idling session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.HasScheduledBreak)).toEqual(false);
        });

        test('should return false when break session is active', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            expect(store.event.getters(store.event.getter.HasScheduledBreak)).toEqual(false);
        });

        test('should return false when scheduled break is not needed', () => {
            const limit = store.event.getters(store.event.getter.WorkDurationLimit);
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;

            timeSummary.concludedSinceLastBreakPrompt.working = limit / 2;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);
            expect(store.event.getters(store.event.getter.HasScheduledBreak)).toEqual(false);

            timeSummary.concludedSinceLastBreakPrompt.working = 0;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit / 2).toISOString();
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);
            expect(store.event.getters(store.event.getter.HasScheduledBreak)).toEqual(false);
        });

        test('should return true when scheduled break is needed', () => {
            const limit = store.event.getters(store.event.getter.WorkDurationLimit);
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;

            timeSummary.concludedSinceLastBreakPrompt.working = limit;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date().toISOString();
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);
            expect(store.event.getters(store.event.getter.HasScheduledBreak)).toEqual(true);

            timeSummary.concludedSinceLastBreakPrompt.working = 0;
            timeSummary.unconcludedSinceLastBreakPrompt.timestamp = new Date(Date.now() - limit).toISOString();
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);
            expect(store.event.getters(store.event.getter.HasScheduledBreak)).toEqual(true);
        });
    });

    describe(GetterKey.WorkingDuration, () => {
        test('should return zero when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingEventSummary, null);

            expect(store.event.getters(store.event.getter.WorkingDuration)).toEqual(0);
        });

        test('should return correct duration when not working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Break;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.working = 2000;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            const result = store.event.getters(store.event.getter.WorkingDuration);

            expect(Math.abs(result - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Interruption;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.working = 2000;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            const result = store.event.getters(store.event.getter.WorkingDuration);

            expect(Math.abs(result - 5000)).toBeLessThan(100);
        });
    });

    describe(GetterKey.NonWorkingDuration, () => {
        test('should return zero when time summary is not available', () => {
            store.event.commit(store.event.mutation.SetOngoingEventSummary, null);

            expect(store.event.getters(store.event.getter.NonWorkingDuration)).toEqual(0);
        });

        test('should return correct duration when working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Task;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.notWorking = 2000;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            const result = store.event.getters(store.event.getter.NonWorkingDuration);

            expect(Math.abs(result - 2000)).toBeLessThan(100);
        });

        test('should return correct duration when not working', () => {
            timeSummary.unconcludedSinceStart.eventType = EventType.Idling;
            timeSummary.unconcludedSinceStart.timestamp = new Date(Date.now() - 3000).toISOString();
            timeSummary.concludedSinceStart.notWorking = 2000;
            store.event.commit(store.event.mutation.SetOngoingEventSummary, timeSummary);

            const result = store.event.getters(store.event.getter.NonWorkingDuration);

            expect(Math.abs(result - 5000)).toBeLessThan(100);
        });
    });

    describe(ActionKey.LoadOngoingEventSummary, () => {
        test('should load ongoing time summary', async() => {
            const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).not.toEqual(timeSummary);

            await store.event.dispatch(store.event.action.LoadOngoingEventSummary);

            sinonExpect.calledOnceWithExactly(eventHttpStub.getOngoingEventSummary, dayStart);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).toEqual(timeSummary);
        });
    });

    describe(ActionKey.StartIdling, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startIdling.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartIdling);

            sinonExpect.calledOnce(eventHttpStub.startIdling);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing time summary on success', async() => {
            eventHttpStub.startIdling.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartIdling);

            sinonExpect.calledOnce(eventHttpStub.startIdling);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartInterruption, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startInterruption.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartInterruption, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruption, 1);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing time summary on success', async() => {
            eventHttpStub.startInterruption.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartInterruption, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startInterruption, 1);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartTask, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startTask.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartTask, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTask, 1);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start item and load ongoing time summary on success', async() => {
            eventHttpStub.startTask.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartTask, 1);

            sinonExpect.calledOnceWithExactly(eventHttpStub.startTask, 1);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartBreak, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.startBreak.resolves(false);

            const result = await store.event.dispatch(store.event.action.StartBreak);

            sinonExpect.calledOnce(eventHttpStub.startBreak);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should start session and load ongoing time summary on success', async() => {
            eventHttpStub.startBreak.resolves(true);

            const result = await store.event.dispatch(store.event.action.StartBreak);

            sinonExpect.calledOnce(eventHttpStub.startBreak);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.SkipBreak, () => {
        test('should do nothing on failure', async() => {
            eventHttpStub.skipBreak.resolves(false);

            const result = await store.event.dispatch(store.event.action.SkipBreak);

            sinonExpect.calledOnce(eventHttpStub.skipBreak);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).not.toEqual(timeSummary);
            expect(result).toEqual(false);
        });

        test('should skip session and load ongoing time summary on success', async() => {
            eventHttpStub.skipBreak.resolves(true);

            const result = await store.event.dispatch(store.event.action.SkipBreak);

            sinonExpect.calledOnce(eventHttpStub.skipBreak);
            expect(store.event.getters(store.event.getter.OngoingEventSummary)).toEqual(timeSummary);
            expect(result).toEqual(true);
        });
    });
});
