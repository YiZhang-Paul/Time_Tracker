import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStub } from 'sinon';

import store from '../../store';

import EventTracker from './event-tracker.vue';

describe('event tracker unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let sandbox: SinonSandbox;
    let gettersStub: SinonStub;
    let dispatchStub: SinonStub;

    beforeEach(() => {
        sandbox = createSandbox();
        gettersStub = sandbox.stub(store.base, 'getters');
        dispatchStub = sandbox.stub(store.base, 'dispatch');
        component = shallowMount(EventTracker);
    });

    afterEach(() => {
        sandbox.restore();
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('created', () => {
        test('should update progress every second', () => {
            const { namespace, getter } = store.event;
            component.vm.workingDuration = '00:50:00';
            component.vm.notWorkingDuration = '00:10:00';

            gettersStub.value({
                [`${namespace}/${getter.WorkingDuration}`]: 3000000,
                [`${namespace}/${getter.NotWorkingDuration}`]: 601000
            });

            jest.advanceTimersByTime(1000);

            expect(component.vm.workingDuration).toEqual('00:50:00');
            expect(component.vm.notWorkingDuration).toEqual('00:10:01');

            gettersStub.value({
                [`${namespace}/${getter.WorkingDuration}`]: 3001000,
                [`${namespace}/${getter.NotWorkingDuration}`]: 601000
            });

            jest.advanceTimersByTime(1000);

            expect(component.vm.workingDuration).toEqual('00:50:01');
            expect(component.vm.notWorkingDuration).toEqual('00:10:01');
        });

        test('should prompt for break when applicable', () => {
            const { namespace, getter } = store.event;
            component.vm.isBreakPromptActive = false;
            gettersStub.value({ [`${namespace}/${getter.IsScheduledBreakNeeded}`]: true });
            jest.advanceTimersByTime(1000);
            // there will be 1.5 seconds delay before opening dialog
            sinonExpect.notCalled(dispatchStub);
            expect(component.vm.isBreakPromptActive).toEqual(true);

            jest.advanceTimersByTime(1500);

            sinonExpect.calledOnce(dispatchStub);
            expect(component.vm.isBreakPromptActive).toEqual(true);

            jest.advanceTimersByTime(60000);
            // only one dialog will be opened
            sinonExpect.calledOnce(dispatchStub);
            expect(component.vm.isBreakPromptActive).toEqual(true);
        });

        test('should not prompt for break again when the prompt is already active', () => {
            const { namespace, getter } = store.event;
            component.vm.isBreakPromptActive = true;
            gettersStub.value({ [`${namespace}/${getter.IsScheduledBreakNeeded}`]: true });
            jest.advanceTimersByTime(60000);

            sinonExpect.notCalled(dispatchStub);
            expect(component.vm.isBreakPromptActive).toEqual(true);
        });

        test('should not prompt for break when not applicable', () => {
            const { namespace, getter } = store.event;
            component.vm.isBreakPromptActive = false;
            gettersStub.value({ [`${namespace}/${getter.IsScheduledBreakNeeded}`]: false });
            jest.advanceTimersByTime(60000);

            sinonExpect.notCalled(dispatchStub);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });

        test('should properly start break session on confirmation', async() => {
            const { namespace, getter, action } = store.event;
            component.vm.isBreakPromptActive = false;
            gettersStub.value({ [`${namespace}/${getter.IsScheduledBreakNeeded}`]: true });
            jest.advanceTimersByTime(2500);

            const callback = dispatchStub.getCall(0).args[1].options.preConfirm;
            dispatchStub.resetHistory();
            await callback();

            sinonExpect.calledOnce(dispatchStub);
            expect(dispatchStub.getCall(0).args[0]).toEqual(`${namespace}/${action.StartBreakSession}`);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });

        test('should properly skip break session on cancellation', async() => {
            const { namespace, getter, action } = store.event;
            component.vm.isBreakPromptActive = false;
            gettersStub.value({ [`${namespace}/${getter.IsScheduledBreakNeeded}`]: true });
            jest.advanceTimersByTime(2500);

            const callback = dispatchStub.getCall(0).args[1].options.preCancel;
            dispatchStub.resetHistory();
            await callback();

            sinonExpect.calledOnce(dispatchStub);
            expect(dispatchStub.getCall(0).args[0]).toEqual(`${namespace}/${action.SkipBreakSession}`);
            expect(component.vm.isBreakPromptActive).toEqual(false);
        });
    });
});
