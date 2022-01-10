import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStub } from 'sinon';

import store from '../../../store';
import { InterruptionItem } from '../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../core/models/task/task-item';

import WorkItemCreator from './work-item-creator.vue';

describe('work item creator unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let sandbox: SinonSandbox;
    let gettersStub: SinonStub;
    let dispatchStub: SinonStub;

    beforeEach(() => {
        sandbox = createSandbox();
        gettersStub = sandbox.stub(store.base, 'getters');
        dispatchStub = sandbox.stub(store.base, 'dispatch');
        component = shallowMount(WorkItemCreator);
    });

    afterEach(() => {
        sandbox.restore();
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('canCreate', () => {
        test('should return false when new interruption is being added', () => {
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${interruptionKey}/${interruptionGetter.EditingItem}`]: new InterruptionItem(-1),
                [`${taskKey}/${taskGetter.EditingItem}`]: null
            });

            component.unmount();
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return false when new task is being added', () => {
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${interruptionKey}/${interruptionGetter.EditingItem}`]: null,
                [`${taskKey}/${taskGetter.EditingItem}`]: new TaskItem(-1)
            });

            component.unmount();
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return true when nothing is being added', () => {
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${interruptionKey}/${interruptionGetter.EditingItem}`]: null,
                [`${taskKey}/${taskGetter.EditingItem}`]: new TaskItem(1)
            });

            component.unmount();
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(true);
        });

        test('should return true when nothing is being edited', () => {
            const { namespace: interruptionKey, getter: interruptionGetter } = store.interruption;
            const { namespace: taskKey, getter: taskGetter } = store.task;

            gettersStub.value({
                [`${interruptionKey}/${interruptionGetter.EditingItem}`]: null,
                [`${taskKey}/${taskGetter.EditingItem}`]: null
            });

            component.unmount();
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(true);
        });
    });

    describe('onTypeSelectStart', () => {
        test('should prompt for work item type selection', () => {
            component.vm.onTypeSelectStart();

            sinonExpect.calledOnce(dispatchStub);
        });

        test('should start new interruption when selected', () => {
            const { namespace: interruptionKey, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, action: taskAction } = store.task;
            component.vm.onTypeSelectStart();

            const callback = dispatchStub.getCall(0).args[1].options.postConfirm;
            dispatchStub.resetHistory();
            // eslint-disable-next-line standard/no-callback-literal
            callback(true);

            sinonExpect.calledTwice(dispatchStub);
            expect(dispatchStub.getCall(0).args[0]).toEqual(`${taskKey}/${taskAction.EndTaskItemEdit}`);
            expect(dispatchStub.getCall(1).args[0]).toEqual(`${interruptionKey}/${interruptionAction.StartInterruptionItemCreation}`);
        });

        test('should start new task when selected', () => {
            const { namespace: interruptionKey, action: interruptionAction } = store.interruption;
            const { namespace: taskKey, action: taskAction } = store.task;
            component.vm.onTypeSelectStart();

            const callback = dispatchStub.getCall(0).args[1].options.postConfirm;
            dispatchStub.resetHistory();
            // eslint-disable-next-line standard/no-callback-literal
            callback(false);

            sinonExpect.calledTwice(dispatchStub);
            expect(dispatchStub.getCall(0).args[0]).toEqual(`${interruptionKey}/${interruptionAction.EndInterruptionItemEdit}`);
            expect(dispatchStub.getCall(1).args[0]).toEqual(`${taskKey}/${taskAction.StartTaskItemCreation}`);
        });
    });
});
