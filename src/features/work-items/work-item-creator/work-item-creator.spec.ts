import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { useDialogStore } from '../../../stores/dialog/dialog.store';
import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { InterruptionItem } from '../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../core/models/task/task-item';
import { InterruptionStateService } from '../../../core/services/states/interruption-state/interruption-state.service';
import { TaskStateService } from '../../../core/services/states/task-state/task-state.service';
import { stubInterruptionStateService } from '../../../mocks/interruption-state.service.stub';
import { stubTaskStateService } from '../../../mocks/task-state.service.stub';

import WorkItemCreator from './work-item-creator.vue';

describe('work item creator unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let interruptionStateStub: SinonStubbedInstance<InterruptionStateService>;
    let taskStateStub: SinonStubbedInstance<TaskStateService>;
    let dialogStore: ReturnType<typeof useDialogStore>;

    beforeEach(() => {
        interruptionStateStub = stubInterruptionStateService();
        taskStateStub = stubTaskStateService();

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
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();

            component.vm.onTypeSelectStart();

            expect(dialogStore.open).toHaveBeenCalledTimes(1);
        });

        test('should start new interruption when selected', () => {
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            component.vm.onTypeSelectStart();

            const { mock } = dialogStore.open as jest.Mock;
            mock.calls[0][0].options.postConfirm(true);

            sinonExpect.calledOnce(taskStateStub.stopItemEdit);
            sinonExpect.calledOnce(interruptionStateStub.startItemCreate);
        });

        test('should start new task when selected', () => {
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            component.vm.onTypeSelectStart();

            const { mock } = dialogStore.open as jest.Mock;
            mock.calls[0][0].options.postConfirm(false);

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            sinonExpect.calledOnce(taskStateStub.startItemCreate);
        });
    });
});
