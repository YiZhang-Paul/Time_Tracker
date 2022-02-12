import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';

import ItemEditorBase from './item-editor-base.vue';

describe('item editor base unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(ItemEditorBase, { global: { plugins: [createTestingPinia()] } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('last modified time', () => {
        test('should not show last modified time for new item', async() => {
            const item = new InterruptionItem(-1);
            await component.setProps({ item, type: EventType.Interruption });

            expect(component.find('.modified-time').text()).toEqual('not created yet');
        });

        test('should show last modified time for existing item', async() => {
            const item = new TaskItem(1);
            item.modifiedTime = new Date(2022, 1, 15, 5, 35, 20).toISOString();
            await component.setProps({ item, type: EventType.Task });

            expect(component.find('.modified-time').text()).toEqual('Updated 05:35 AM, 2/15/2022');
        });
    });

    describe('onSave', () => {
        test('should do nothing when name is whitespace', async() => {
            const item = new InterruptionItem(-1, ' ');
            await component.setProps({ item, type: EventType.Interruption });

            await component.find('.save-button').trigger('click');

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update).toBeFalsy();
        });

        test('should create new item', async() => {
            const item = new InterruptionItem(-1, 'item_name');
            await component.setProps({ item, type: EventType.Interruption });

            await component.find('.save-button').trigger('click');

            expect(component.emitted().create.length).toEqual(1);
            expect(component.emitted().create[0]).toEqual([item]);
            expect(component.emitted().update).toBeFalsy();
        });

        test('should save existing item', async() => {
            const item = new TaskItem(1, 'item_name');
            await component.setProps({ item, type: EventType.Task });

            await component.find('.save-button').trigger('click');

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update.length).toEqual(1);
            expect(component.emitted().update[0]).toEqual([item]);
        });
    });
});
