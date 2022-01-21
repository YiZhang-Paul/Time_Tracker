import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { stub } from 'sinon';

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
        test('should update progress every second', () => {
            const getWorkingDurationStub = stub(eventStore, 'getWorkingDuration').returns(3000000);
            const getNonWorkingDurationStub = stub(eventStore, 'getNonWorkingDuration').returns(601000);
            jest.advanceTimersByTime(1000);

            expect(component.vm.workingDuration).toEqual('00:50:00');
            expect(component.vm.nonWorkingDuration).toEqual('00:10:01');

            getWorkingDurationStub.returns(3001000);
            getNonWorkingDurationStub.returns(601000);
            jest.advanceTimersByTime(1000);

            expect(component.vm.workingDuration).toEqual('00:50:01');
            expect(component.vm.nonWorkingDuration).toEqual('00:10:01');
        });

        test('should prompt for break when applicable', () => {
            stub(eventStore, 'hasScheduledBreak').returns(true);
            jest.advanceTimersByTime(2000);
            // there will be 1.5 seconds delay before opening dialog
            expect(dialogStore.open).not.toHaveBeenCalled();
            expect(component.vm.isBreakPromptActive).toEqual(true);

            jest.advanceTimersByTime(500);

            expect(dialogStore.open).toHaveBeenCalledTimes(1);
            expect(component.vm.isBreakPromptActive).toEqual(true);

            jest.advanceTimersByTime(60000);
            // only one dialog will be opened
            expect(dialogStore.open).toHaveBeenCalledTimes(1);
            expect(component.vm.isBreakPromptActive).toEqual(true);
        });

        test('should not prompt for break when not applicable', () => {
            stub(eventStore, 'hasScheduledBreak').returns(false);
            jest.advanceTimersByTime(60000);

            expect(dialogStore.open).not.toHaveBeenCalled();
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });

        test('should properly start break session on confirmation', async() => {
            stub(eventStore, 'hasScheduledBreak').returns(true);
            jest.advanceTimersByTime(2500);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preConfirm(null);

            expect(eventStore.startBreak).toHaveBeenCalledTimes(1);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });

        test('should properly skip break session on cancellation', async() => {
            stub(eventStore, 'hasScheduledBreak').returns(true);
            jest.advanceTimersByTime(2500);

            const { mock } = dialogStore.open as jest.Mock;
            await mock.calls[0][0].options.preCancel(null);

            expect(eventStore.skipBreak).toHaveBeenCalledTimes(1);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });
    });
});
