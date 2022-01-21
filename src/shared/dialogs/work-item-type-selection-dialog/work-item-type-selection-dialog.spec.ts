import { shallowMount, VueWrapper } from '@vue/test-utils';

import WorkItemTypeSelectionDialog from './work-item-type-selection-dialog.vue';

describe('work item type selection dialog unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(WorkItemTypeSelectionDialog);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
