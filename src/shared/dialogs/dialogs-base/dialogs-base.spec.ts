import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { assert as sinonExpect, createSandbox, SinonSandbox, spy } from 'sinon';

import { useDialogStore } from '../../../stores/dialog/dialog.store';
import { DialogConfig } from '../../../core/models/generic/dialog-config';

import DialogsBase from './dialogs-base.vue';

describe('dialogs base unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;
    let dialogStore: ReturnType<typeof useDialogStore>;
    let sandbox: SinonSandbox;

    beforeEach(() => {
        component = shallowMount(DialogsBase, { global: { plugins: [createTestingPinia()] } });
        dialogStore = useDialogStore();
        sandbox = createSandbox();
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
            const closeSpy = spy(dialogStore, 'close');

            await component.vm.onCancel({ name: 'payload' }, new DialogConfig(null));

            sinonExpect.calledOnce(closeSpy);
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
            const closeSpy = spy(dialogStore, 'close');

            await component.vm.onConfirm({ name: 'payload' }, new DialogConfig(null));

            sinonExpect.calledOnce(closeSpy);
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
