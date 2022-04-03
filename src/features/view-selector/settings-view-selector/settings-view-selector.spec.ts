import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsViewSelector from './settings-view-selector.vue';

describe('settings view selector unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(SettingsViewSelector, { global: { plugins: [createTestingPinia()] } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
