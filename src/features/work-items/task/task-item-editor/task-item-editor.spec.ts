import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, stub } from 'sinon';

import { useEventStore } from '../../../../stores/event/event.store';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';

import TaskItemEditor from './task-item-editor.vue';

describe('task item editor unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let eventStore: ReturnType<typeof useEventStore>;

    beforeEach(() => {
        component = shallowMount(TaskItemEditor, { global: { plugins: [createTestingPinia()] } });
        eventStore = useEventStore();
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('isActiveWorkItem', () => {
        test('should show start button when item is not active', async() => {
            const isActiveWorkItemStub = stub().returns(false);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            await component.setProps({ item: new TaskItem(5) });

            sinonExpect.calledWithExactly(isActiveWorkItemStub, EventType.Task, 5);
            expect(component.find('.start-button').exists()).toEqual(true);
            expect(component.find('.stop-button').exists()).toEqual(false);
        });

        test('should show stop button when item is active', async() => {
            const isActiveWorkItemStub = stub().returns(true);
            stub(eventStore, 'isActiveWorkItem').get(() => isActiveWorkItemStub);
            await component.setProps({ item: new TaskItem(5) });

            sinonExpect.calledWithExactly(isActiveWorkItemStub, EventType.Task, 5);
            expect(component.find('.start-button').exists()).toEqual(false);
            expect(component.find('.stop-button').exists()).toEqual(true);
        });
    });

    describe('creationTime', () => {
        test('should return correct creation time', async() => {
            const item = new TaskItem(-1);
            item.creationTime = new Date(2022, 1, 15, 5, 35, 20).toISOString();
            await component.setProps({ item });

            expect(component.find('.footer > span').text()).toEqual('Created 05:35 AM, 2/15/2022');
        });
    });

    describe('onSave', () => {
        test('should do nothing when name is whitespace', async() => {
            await component.setProps({ item: new TaskItem(-1, ' ') });

            await component.find('.save-button').trigger('click');

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update).toBeFalsy();
        });

        test('should create new item', async() => {
            const item = new TaskItem(-1, 'item_name');
            await component.setProps({ item });

            await component.find('.save-button').trigger('click');

            expect(component.emitted().create.length).toEqual(1);
            expect(component.emitted().create[0]).toEqual([item]);
            expect(component.emitted().update).toBeFalsy();
        });

        test('should save existing item', async() => {
            const item = new TaskItem(1, 'item_name');
            await component.setProps({ item });

            await component.find('.save-button').trigger('click');

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update.length).toEqual(1);
            expect(component.emitted().update[0]).toEqual([item]);
        });
    });
});
