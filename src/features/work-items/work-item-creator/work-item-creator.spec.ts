import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createStubInstance, stub, SinonStubbedInstance } from 'sinon';

import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { InterruptionItem } from '../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../core/models/task/task-item';
import { DialogStateService } from '../../../core/services/states/dialog-state/dialog-state.service';
import { InterruptionStateService } from '../../../core/services/states/interruption-state/interruption-state.service';
import { TaskStateService } from '../../../core/services/states/task-state/task-state.service';
import { stubInterruptionStateService } from '../../../mocks/interruption-state.service.stub';
import { stubTaskStateService } from '../../../mocks/task-state.service.stub';

import WorkItemCreator from './work-item-creator.vue';

describe('work item creator unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let dialogStateStub: SinonStubbedInstance<DialogStateService>;
    let interruptionStateStub: SinonStubbedInstance<InterruptionStateService>;
    let taskStateStub: SinonStubbedInstance<TaskStateService>;

    beforeEach(() => {
        dialogStateStub = createStubInstance(DialogStateService);
        interruptionStateStub = stubInterruptionStateService();
        taskStateStub = stubTaskStateService();

        container
            .rebind<DialogStateService>(types.DialogStateService)
            .toConstantValue(dialogStateStub);

        container
            .rebind<InterruptionStateService>(types.InterruptionStateService)
            .toConstantValue(interruptionStateStub);

        container
            .rebind<TaskStateService>(types.TaskStateService)
            .toConstantValue(taskStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(WorkItemCreator);

        expect(component).toBeTruthy();
    });

    describe('canCreate', () => {
        test('should return false when new interruption is being added', () => {
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(-1));
            stub(taskStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return false when new task is being added', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            stub(taskStateStub, 'editingItem').get(() => new TaskItem(-1));
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return true when nothing is being added', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            stub(taskStateStub, 'editingItem').get(() => new TaskItem(1));
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(true);
        });

        test('should return true when nothing is being edited', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            stub(taskStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItemCreator);

            expect(component.vm.canCreate).toEqual(true);
        });
    });

    describe('onTypeSelectStart', () => {
        test('should prompt for work item type selection', () => {
            component = shallowMount(WorkItemCreator);

            component.vm.onTypeSelectStart();

            sinonExpect.calledOnce(dialogStateStub.open);
        });

        test('should start new interruption when selected', () => {
            component = shallowMount(WorkItemCreator);
            component.vm.onTypeSelectStart();

            dialogStateStub.open.getCall(0).args[0].options.postConfirm!(true);

            sinonExpect.calledOnce(taskStateStub.stopItemEdit);
            sinonExpect.calledOnce(interruptionStateStub.startItemCreate);
        });

        test('should start new task when selected', () => {
            component = shallowMount(WorkItemCreator);
            component.vm.onTypeSelectStart();

            dialogStateStub.open.getCall(0).args[0].options.postConfirm!(false);

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            sinonExpect.calledOnce(taskStateStub.startItemCreate);
        });
    });
});
