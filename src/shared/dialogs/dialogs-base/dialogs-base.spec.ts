import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStubbedInstance } from 'sinon';

import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import { DialogStateService } from '../../../core/services/states/dialog-state/dialog-state.service';
import { stubDialogStateService } from '../../../mocks/dialog-state.service.stub';

import DialogsBase from './dialogs-base.vue';

describe('dialogs base unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let dialogStateStub: SinonStubbedInstance<DialogStateService>;
    let sandbox: SinonSandbox;

    beforeEach(() => {
        dialogStateStub = stubDialogStateService();

        container
            .rebind<DialogStateService>(types.DialogStateService)
            .toConstantValue(dialogStateStub);

        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(DialogsBase);

        expect(component).toBeTruthy();
    });

    describe('onCancel', () => {
        test('should close dialog', async() => {
            component = shallowMount(DialogsBase);

            await component.vm.onCancel({ name: 'payload' }, new DialogConfig(null));

            sinonExpect.calledOnce(dialogStateStub.closeDialog);
        });

        test('should invoke pre/post cancel hooks when available', async() => {
            const preCancelStub = sandbox.stub();
            const postCancelStub = sandbox.stub();
            const payload = { name: 'payload' };
            const config = new DialogConfig(null, null, { preCancel: preCancelStub, postCancel: postCancelStub });
            component = shallowMount(DialogsBase);

            await component.vm.onCancel(payload, config);

            sinonExpect.calledOnceWithExactly(preCancelStub, payload);
            sinonExpect.calledOnceWithExactly(postCancelStub, payload);
        });
    });

    describe('onConfirm', () => {
        test('should close dialog', async() => {
            component = shallowMount(DialogsBase);

            await component.vm.onConfirm({ name: 'payload' }, new DialogConfig(null));

            sinonExpect.calledOnce(dialogStateStub.closeDialog);
        });

        test('should invoke pre/post confirm hooks when available', async() => {
            const preConfirmStub = sandbox.stub();
            const postConfirmStub = sandbox.stub();
            const payload = { name: 'payload' };
            const config = new DialogConfig(null, null, { preConfirm: preConfirmStub, postConfirm: postConfirmStub });
            component = shallowMount(DialogsBase);

            await component.vm.onConfirm(payload, config);

            sinonExpect.calledOnceWithExactly(preConfirmStub, payload);
            sinonExpect.calledOnceWithExactly(postConfirmStub, payload);
        });
    });
});
