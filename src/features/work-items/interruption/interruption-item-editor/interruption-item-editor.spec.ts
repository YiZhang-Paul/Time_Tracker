import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, SinonStubbedInstance } from 'sinon';

import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import { Priority } from '../../../../core/enums/priority.enum';
import { EventStateService } from '../../../../core/services/states/event-state/event-state.service';
import { stubEventStateService } from '../../../../mocks/event-state.service.stub';

import InterruptionItemEditor from './interruption-item-editor.vue';

describe('interruption item editor unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let eventStateStub: SinonStubbedInstance<EventStateService>;

    beforeEach(() => {
        eventStateStub = stubEventStateService();

        container
            .rebind<EventStateService>(types.EventStateService)
            .toConstantValue(eventStateStub);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(InterruptionItemEditor);

        expect(component).toBeTruthy();
    });

    describe('isActiveWorkItem', () => {
        test('should check correct item type', () => {
            const item = new InterruptionItem(1);
            eventStateStub.isActiveWorkItem.returns(true);
            component = shallowMount(InterruptionItemEditor, { props: { item } });

            sinonExpect.calledWithExactly(eventStateStub.isActiveWorkItem, EventType.Interruption, 1);
            expect(component.vm.isActiveWorkItem).toEqual(true);
        });
    });

    describe('creationTime', () => {
        test('should return correct creation time', () => {
            component = shallowMount(InterruptionItemEditor);
            component.vm.item.creationTime = new Date(2022, 1, 15, 5, 35, 20).toISOString();

            expect(component.vm.creationTime).toEqual('5:35 AM, 2/15/2022');
        });
    });

    describe('onPrioritySelect', () => {
        test('should select next available priority', () => {
            component = shallowMount(InterruptionItemEditor);
            expect(component.vm.item.priority).toEqual(Priority.Low);

            component.vm.onPrioritySelect();
            expect(component.vm.item.priority).toEqual(Priority.Medium);

            component.vm.onPrioritySelect();
            expect(component.vm.item.priority).toEqual(Priority.High);

            component.vm.onPrioritySelect();
            expect(component.vm.item.priority).toEqual(Priority.Low);
        });
    });

    describe('onSave', () => {
        test('should do nothing when name does not exist', () => {
            component = shallowMount(InterruptionItemEditor);
            component.vm.item.name = null;

            component.vm.onSave();

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update).toBeFalsy();
        });

        test('should do nothing when name is whitespace', () => {
            component = shallowMount(InterruptionItemEditor);
            component.vm.item.name = ' ';

            component.vm.onSave();

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update).toBeFalsy();
        });

        test('should create new item', () => {
            component = shallowMount(InterruptionItemEditor);
            component.vm.item.id = -1;
            component.vm.item.name = 'item_name';

            component.vm.onSave();

            expect(component.emitted().create.length).toEqual(1);
            expect(component.emitted().create[0]).toEqual([component.vm.item]);
            expect(component.emitted().update).toBeFalsy();
        });

        test('should save existing item', () => {
            component = shallowMount(InterruptionItemEditor);
            component.vm.item.id = 1;
            component.vm.item.name = 'item_name';

            component.vm.onSave();

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update.length).toEqual(1);
            expect(component.emitted().update[0]).toEqual([component.vm.item]);
        });
    });
});
