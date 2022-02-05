import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { InterruptionItem } from '../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../core/models/task/task-item';

import WorkItemList from './work-item-list.vue';

describe('work item list unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let interruptionStore: ReturnType<typeof useInterruptionStore>;
    let taskStore: ReturnType<typeof useTaskStore>;

    beforeEach(() => {
        component = shallowMount(WorkItemList, { global: { plugins: [createTestingPinia()] } });
        interruptionStore = useInterruptionStore();
        taskStore = useTaskStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('selectedInterruptionItemId', () => {
        test('should return -1 when no item selected', () => {
            interruptionStore.editingItem = null;

            expect(component.vm.selectedInterruptionItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            interruptionStore.editingItem = new InterruptionItem(5);

            expect(component.vm.selectedInterruptionItemId).toEqual(5);
        });
    });

    describe('selectedTaskItemId', () => {
        test('should return -1 when no item selected', () => {
            taskStore.editingItem = null;

            expect(component.vm.selectedTaskItemId).toEqual(-1);
        });

        test('should return id of selected item', () => {
            taskStore.editingItem = new TaskItem(5);

            expect(component.vm.selectedTaskItemId).toEqual(5);
        });
    });
});
