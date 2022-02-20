import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, spy } from 'sinon';

import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { InterruptionItem } from '../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../core/models/task/task-item';

import WorkItemCreator from './work-item-creator.vue';

describe('work item creator unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let interruptionStore: ReturnType<typeof useInterruptionStore>;
    let taskStore: ReturnType<typeof useTaskStore>;

    beforeEach(() => {
        component = shallowMount(WorkItemCreator, { global: { plugins: [createTestingPinia()] } });
        interruptionStore = useInterruptionStore();
        taskStore = useTaskStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('canCreate', () => {
        test('should return false when new interruption is being added', () => {
            interruptionStore.editingItem = new InterruptionItem(-1);
            taskStore.editingItem = null;

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return false when new task is being added', () => {
            interruptionStore.editingItem = null;
            taskStore.editingItem = new TaskItem(-1);

            expect(component.vm.canCreate).toEqual(false);
        });

        test('should return true when nothing is being added', () => {
            interruptionStore.editingItem = null;
            // an id that is not -1 indicates the item is an existing item
            taskStore.editingItem = new TaskItem(1);

            expect(component.vm.canCreate).toEqual(true);
        });

        test('should return true when nothing is being edited', () => {
            interruptionStore.editingItem = null;
            taskStore.editingItem = null;

            expect(component.vm.canCreate).toEqual(true);
        });
    });

    describe('onTypeSelect', () => {
        test('should start new interruption when selected', () => {
            const startInterruptionItemCreateSpy = spy(interruptionStore, 'startItemCreate');
            const stopTaskItemEditSpy = spy(taskStore, 'stopItemEdit');

            component.vm.onTypeSelect(true);

            sinonExpect.calledOnce(startInterruptionItemCreateSpy);
            sinonExpect.calledOnce(stopTaskItemEditSpy);
            expect(component.find('.types').exists()).toEqual(false);
        });

        test('should start new task when selected', () => {
            const startTaskItemCreateSpy = spy(taskStore, 'startItemCreate');
            const stopInterruptionItemEditSpy = spy(interruptionStore, 'stopItemEdit');

            component.vm.onTypeSelect(false);

            sinonExpect.calledOnce(startTaskItemCreateSpy);
            sinonExpect.calledOnce(stopInterruptionItemEditSpy);
            expect(component.find('.types').exists()).toEqual(false);
        });
    });
});
