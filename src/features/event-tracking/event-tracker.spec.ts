import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { DialogStateService } from '../../core/services/states/dialog-state/dialog-state.service';
import { EventStateService } from '../../core/services/states/event-state/event-state.service';
import { stubDialogStateService } from '../../mocks/dialog-state.service.stub';
import { stubEventStateService } from '../../mocks/event-state.service.stub';

import EventTracker from './event-tracker.vue';

describe('event tracker unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let dialogStateStub: SinonStubbedInstance<DialogStateService>;
    let eventStateStub: SinonStubbedInstance<EventStateService>;

    beforeEach(() => {
        dialogStateStub = stubDialogStateService();
        eventStateStub = stubEventStateService();

        container
            .rebind<DialogStateService>(types.DialogStateService)
            .toConstantValue(dialogStateStub);

        container
            .rebind<EventStateService>(types.EventStateService)
            .toConstantValue(eventStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(EventTracker);

        expect(component).toBeTruthy();
    });

    describe('created', () => {
        test('should update progress every second', () => {
            stub(eventStateStub, 'workingDuration').get(() => 3000000);
            stub(eventStateStub, 'nonWorkingDuration').get(() => 601000);
            component = shallowMount(EventTracker);
            jest.advanceTimersByTime(1000);

            expect(component.vm.workingDuration).toEqual('00:50:00');
            expect(component.vm.nonWorkingDuration).toEqual('00:10:01');

            stub(eventStateStub, 'workingDuration').get(() => 3001000);
            stub(eventStateStub, 'nonWorkingDuration').get(() => 601000);
            jest.advanceTimersByTime(1000);

            expect(component.vm.workingDuration).toEqual('00:50:01');
            expect(component.vm.nonWorkingDuration).toEqual('00:10:01');
        });

        test('should prompt for break when applicable', () => {
            stub(eventStateStub, 'hasScheduledBreak').get(() => true);
            component = shallowMount(EventTracker);
            jest.advanceTimersByTime(1000);
            // there will be 1.5 seconds delay before opening dialog
            sinonExpect.notCalled(dialogStateStub.open);
            expect(component.vm.isBreakPromptActive).toEqual(true);

            jest.advanceTimersByTime(500);

            sinonExpect.calledOnce(dialogStateStub.open);
            expect(component.vm.isBreakPromptActive).toEqual(true);

            jest.advanceTimersByTime(60000);
            // only one dialog will be opened
            sinonExpect.calledOnce(dialogStateStub.open);
            expect(component.vm.isBreakPromptActive).toEqual(true);
        });

        test('should not prompt for break when not applicable', () => {
            stub(eventStateStub, 'hasScheduledBreak').get(() => false);
            component = shallowMount(EventTracker);
            jest.advanceTimersByTime(60000);

            sinonExpect.notCalled(dialogStateStub.open);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });

        test('should properly start break session on confirmation', async() => {
            stub(eventStateStub, 'hasScheduledBreak').get(() => true);
            component = shallowMount(EventTracker);
            jest.advanceTimersByTime(1500);

            await dialogStateStub.open.getCall(0).args[0].options.preConfirm!(null);

            sinonExpect.calledOnce(eventStateStub.startBreak);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });

        test('should properly skip break session on cancellation', async() => {
            stub(eventStateStub, 'hasScheduledBreak').get(() => true);
            component = shallowMount(EventTracker);
            jest.advanceTimersByTime(1500);

            await dialogStateStub.open.getCall(0).args[0].options.preCancel!(null);

            sinonExpect.calledOnce(eventStateStub.skipBreak);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });
    });
});
