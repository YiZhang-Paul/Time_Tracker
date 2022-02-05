import { shallowMount, VueWrapper } from '@vue/test-utils';

import InterruptionItemEditor from './interruption-item-editor.vue';

describe('interruption item editor unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(InterruptionItemEditor);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
