import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStub } from 'sinon';

import store from '../../../../store';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';

import TaskItemEditor from './task-item-editor.vue';

describe('task item editor unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let sandbox: SinonSandbox;
    let gettersStub: SinonStub;

    beforeEach(() => {
        sandbox = createSandbox();
        gettersStub = sandbox.stub(store.base, 'getters');
        component = shallowMount(TaskItemEditor);
    });

    afterEach(() => {
        sandbox.restore();
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('isActiveWorkItem', () => {
        test('should check correct item type', async() => {
            const { namespace, getter } = store.event;
            const stub = sandbox.stub().returns(true);
            gettersStub.value({ [`${namespace}/${getter.IsActiveWorkItem}`]: stub });
            await component.setProps({ item: new TaskItem(1) });

            sinonExpect.calledOnceWithExactly(stub, EventType.Task, 1);
            expect(component.vm.isActiveWorkItem).toEqual(true);
        });
    });

    describe('creationTime', () => {
        test('should return correct creation time', () => {
            component.vm.item.creationTime = new Date(2022, 1, 15, 5, 35, 20).toISOString();

            expect(component.vm.creationTime).toEqual('5:35 AM, 2/15/2022');
        });
    });

    describe('onEffortSelect', () => {
        test('should select next available effort value', () => {
            expect(component.vm.item.effort).toEqual(1);

            component.vm.onEffortSelect();
            expect(component.vm.item.effort).toEqual(2);

            component.vm.onEffortSelect();
            expect(component.vm.item.effort).toEqual(3);

            component.vm.onEffortSelect();
            expect(component.vm.item.effort).toEqual(5);

            component.vm.onEffortSelect();
            expect(component.vm.item.effort).toEqual(8);

            component.vm.onEffortSelect();
            expect(component.vm.item.effort).toEqual(13);

            component.vm.onEffortSelect();
            expect(component.vm.item.effort).toEqual(1);
        });
    });

    describe('onSave', () => {
        test('should do nothing when name does not exist', () => {
            component.vm.item.name = null;

            component.vm.onSave();

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update).toBeFalsy();
        });

        test('should do nothing when name is whitespace', () => {
            component.vm.item.name = ' ';

            component.vm.onSave();

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update).toBeFalsy();
        });

        test('should create new item', () => {
            component.vm.item.id = -1;
            component.vm.item.name = 'item_name';

            component.vm.onSave();

            expect(component.emitted().create.length).toEqual(1);
            expect(component.emitted().create[0]).toEqual([component.vm.item]);
            expect(component.emitted().update).toBeFalsy();
        });

        test('should save existing item', () => {
            component.vm.item.id = 1;
            component.vm.item.name = 'item_name';

            component.vm.onSave();

            expect(component.emitted().create).toBeFalsy();
            expect(component.emitted().update.length).toEqual(1);
            expect(component.emitted().update[0]).toEqual([component.vm.item]);
        });
    });
});
