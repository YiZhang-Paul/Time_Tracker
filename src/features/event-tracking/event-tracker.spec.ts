import { nextTick } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, spy, stub } from 'sinon';

import { useDialogStore } from '../../stores/dialog/dialog.store';
import { useEventStore } from '../../stores/event/event.store';

import EventTracker from './event-tracker.vue';

describe('event tracker unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let dialogStore: ReturnType<typeof useDialogStore>;
    let eventStore: ReturnType<typeof useEventStore>;

    beforeEach(() => {
        component = shallowMount(EventTracker, { global: { plugins: [createTestingPinia()] } });
        dialogStore = useDialogStore();
        eventStore = useEventStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('created', () => {
        test('should update progress every second when break session is not active', async() => {
            const getWorkingDurationStub = stub(eventStore, 'getWorkingDuration').returns(3000000);
            const getNonWorkingDurationStub = stub(eventStore, 'getNonWorkingDuration').returns(601000);
            stub(eventStore, 'isBreaking').get(() => false);
            jest.advanceTimersByTime(1000);
            await nextTick();

            expect(component.find('.working-duration').text()).toEqual('00:50:00');
            expect(component.find('.non-working-duration').text()).toEqual('00:10:01');

            getWorkingDurationStub.returns(3001000);
            getNonWorkingDurationStub.returns(601000);
            jest.advanceTimersByTime(1000);
            await nextTick();

            expect(component.find('.working-duration').text()).toEqual('00:50:01');
            expect(component.find('.non-working-duration').text()).toEqual('00:10:01');
        });

        test('should prompt for break start when applicable', () => {
            const openSpy = spy(dialogStore, 'open');
            stub(eventStore, 'isBreaking').get(() => false);
            stub(eventStore, 'hasScheduledBreak').returns(true);
            jest.advanceTimersByTime(2000);
            // there will be 1.5 seconds delay before opening dialog
            sinonExpect.notCalled(openSpy);

            jest.advanceTimersByTime(500);

            sinonExpect.calledOnce(openSpy);

            jest.advanceTimersByTime(60000);
            // only one dialog will be opened
            sinonExpect.calledOnce(openSpy);
        });

        test('should not prompt for break start when not applicable', () => {
            const openSpy = spy(dialogStore, 'open');
            stub(eventStore, 'isBreaking').get(() => false);
            stub(eventStore, 'hasScheduledBreak').returns(false);
            jest.advanceTimersByTime(60000);

            sinonExpect.notCalled(openSpy);
        });

        test('should properly start break session on confirmation', async() => {
            const openSpy = spy(dialogStore, 'open');
            const startBreakSpy = spy(eventStore, 'startBreak');
            stub(eventStore, 'isBreaking').get(() => false);
            stub(eventStore, 'hasScheduledBreak').returns(true);
            jest.advanceTimersByTime(2500);

            await openSpy.getCall(0).args[0].options.preConfirm!(null);

            sinonExpect.calledOnce(startBreakSpy);
        });

        test('should properly skip break session on cancellation', async() => {
            const openSpy = spy(dialogStore, 'open');
            const skipBreakSpy = spy(eventStore, 'skipBreak');
            stub(eventStore, 'isBreaking').get(() => false);
            stub(eventStore, 'hasScheduledBreak').returns(true);
            jest.advanceTimersByTime(2500);

            await openSpy.getCall(0).args[0].options.preCancel!(null);

            sinonExpect.calledOnce(skipBreakSpy);
        });

        test('should update remaining break time every second when break session is active', async() => {
            const getRemainingBreakStub = stub(eventStore, 'getRemainingBreak').returns(300000);
            stub(eventStore, 'isBreaking').get(() => true);
            jest.advanceTimersByTime(1000);
            await nextTick();

            expect(component.find('.remaining-break').text()).toEqual('break left: 00:05:00');

            getRemainingBreakStub.returns(299000);
            jest.advanceTimersByTime(1000);
            await nextTick();

            expect(component.find('.remaining-break').text()).toEqual('break left: 00:04:59');
        });

        test('should update remaining break time every second when break session is active', async() => {
            const getRemainingBreakStub = stub(eventStore, 'getRemainingBreak').returns(300000);
            stub(eventStore, 'isBreaking').get(() => true);
            jest.advanceTimersByTime(1000);
            await nextTick();

            expect(component.find('.remaining-break').text()).toEqual('break left: 00:05:00');

            getRemainingBreakStub.returns(299000);
            jest.advanceTimersByTime(1000);
            await nextTick();

            expect(component.find('.remaining-break').text()).toEqual('break left: 00:04:59');
        });

        test('should prompt for break end and start idling when applicable', () => {
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            stub(eventStore, 'isBreaking').get(() => true);
            stub(eventStore, 'getRemainingBreak').returns(0);
            jest.advanceTimersByTime(1000);

            sinonExpect.calledOnce(openSpy);
            sinonExpect.calledOnce(startIdlingSpy);

            jest.advanceTimersByTime(60000);
            // only one dialog will be opened
            sinonExpect.calledOnce(openSpy);
            sinonExpect.calledOnce(startIdlingSpy);
        });

        test('should not prompt for break end when not applicable', () => {
            const openSpy = spy(dialogStore, 'open');
            const startIdlingSpy = spy(eventStore, 'startIdling');
            stub(eventStore, 'isBreaking').get(() => true);
            stub(eventStore, 'getRemainingBreak').returns(30000);
            jest.advanceTimersByTime(60000);

            sinonExpect.notCalled(openSpy);
            sinonExpect.notCalled(startIdlingSpy);
        });
    });
});
