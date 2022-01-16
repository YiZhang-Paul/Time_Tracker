import { shallowMount, VueWrapper } from '@vue/test-utils';

import { ConfirmationDialogOption } from '../../../core/models/options/confirmation-dialog-option';
import { ButtonType } from '../../../core/enums/button-type.enum';

import ConfirmationDialog from './confirmation-dialog.vue';

describe('confirmation dialog unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(ConfirmationDialog);

        expect(component).toBeTruthy();
    });

    describe('confirmButtonClasses', () => {
        test('should return correct classes for confirm type', async() => {
            const data: ConfirmationDialogOption = { ...new ConfirmationDialogOption(), type: ButtonType.Confirm };
            component = shallowMount(ConfirmationDialog, { props: { data } });

            expect(component.vm.confirmButtonClasses.confirm).toEqual(true);
            expect(component.vm.confirmButtonClasses.warning).toEqual(false);
        });

        test('should return correct classes for warning type', async() => {
            const data: ConfirmationDialogOption = { ...new ConfirmationDialogOption(), type: ButtonType.Warning };
            component = shallowMount(ConfirmationDialog, { props: { data } });

            expect(component.vm.confirmButtonClasses.confirm).toEqual(false);
            expect(component.vm.confirmButtonClasses.warning).toEqual(true);
        });
    });
});
