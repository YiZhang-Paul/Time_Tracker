import { shallowMount, VueWrapper } from '@vue/test-utils';
import { assert as sinonExpect, createSandbox, SinonSandbox, SinonStub } from 'sinon';

import store from '../../../store';
import { DialogConfig } from '../../../core/models/generic/dialog-config';

import DialogsBase from './dialogs-base.vue';

describe('dialogs base unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let sandbox: SinonSandbox;
    let dispatchStub: SinonStub;

    beforeEach(() => {
        sandbox = createSandbox();
        dispatchStub = sandbox.stub(store.base, 'dispatch');
        component = shallowMount(DialogsBase);
    });

    afterEach(() => {
        sandbox.restore();
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('onCancel', () => {
        test('should close dialog', async() => {
            await component.vm.onCancel({ name: 'payload' }, new DialogConfig(null));

            sinonExpect.calledOnce(dispatchStub);
        });

        test('should invoke pre/post cancel hooks when available', async() => {
            const preCancelStub = sandbox.stub();
            const postCancelStub = sandbox.stub();
            const payload = { name: 'payload' };
            const config = new DialogConfig(null, null, { preCancel: preCancelStub, postCancel: postCancelStub });

            await component.vm.onCancel(payload, config);

            sinonExpect.calledOnceWithExactly(preCancelStub, payload);
            sinonExpect.calledOnceWithExactly(postCancelStub, payload);
        });
    });

    describe('onConfirm', () => {
        test('should close dialog', async() => {
            await component.vm.onConfirm({ name: 'payload' }, new DialogConfig(null));

            sinonExpect.calledOnce(dispatchStub);
        });

        test('should invoke pre/post confirm hooks when available', async() => {
            const preConfirmStub = sandbox.stub();
            const postConfirmStub = sandbox.stub();
            const payload = { name: 'payload' };
            const config = new DialogConfig(null, null, { preConfirm: preConfirmStub, postConfirm: postConfirmStub });

            await component.vm.onConfirm(payload, config);

            sinonExpect.calledOnceWithExactly(preConfirmStub, payload);
            sinonExpect.calledOnceWithExactly(postConfirmStub, payload);
        });
    });
});
