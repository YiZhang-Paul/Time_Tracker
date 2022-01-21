import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub, SinonStubbedInstance } from 'sinon';

import { useDialogStore } from '../../../stores/dialog/dialog.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { InterruptionItem } from '../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../core/models/task/task-item';
import { InterruptionStateService } from '../../../core/services/states/interruption-state/interruption-state.service';
import { stubInterruptionStateService } from '../../../mocks/interruption-state.service.stub';

import WorkItemCreator from './work-item-creator.vue';

describe('work item creator unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let interruptionStateStub: SinonStubbedInstance<InterruptionStateService>;
    let dialogStore: ReturnType<typeof useDialogStore>;
    let taskStore: ReturnType<typeof useTaskStore>;

    beforeEach(() => {
        interruptionStateStub = stubInterruptionStateService();

        container
            .rebind<InterruptionStateService>(types.InterruptionStateService)
            .toConstantValue(interruptionStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });

        expect(component).toBeTruthy();
    });

    describe('canCreate', () => {
        test('should return false when new interruption is being added', () => {
            stub(interruptionStateStub, 'editingItem').get(() => new InterruptionItem(-1));
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            taskStore.editingItem = null;

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return false when new task is being added', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            taskStore.editingItem = new TaskItem(-1);

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return true when nothing is being added', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            taskStore.editingItem = new TaskItem(1);

            expect(component.vm.canCreate).toEqual(true);
        });

        test('should return true when nothing is being edited', () => {
            stub(interruptionStateStub, 'editingItem').get(() => null);
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            taskStore = useTaskStore();
            taskStore.editingItem = null;

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
            taskStore = useTaskStore();
            const stopItemEditStub = stub(taskStore, 'stopItemEdit');
            component.vm.onTypeSelectStart();

            const { mock } = dialogStore.open as jest.Mock;
            mock.calls[0][0].options.postConfirm(true);

            sinonExpect.calledOnce(stopItemEditStub);
            sinonExpect.calledOnce(interruptionStateStub.startItemCreate);
        });

        test('should start new task when selected', () => {
            component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
            dialogStore = useDialogStore();
            taskStore = useTaskStore();
            const startItemCreateStub = stub(taskStore, 'startItemCreate');
            component.vm.onTypeSelectStart();

            const { mock } = dialogStore.open as jest.Mock;
            mock.calls[0][0].options.postConfirm(false);

            sinonExpect.calledOnce(interruptionStateStub.stopItemEdit);
            sinonExpect.calledOnce(startItemCreateStub);
        });
    });
});
