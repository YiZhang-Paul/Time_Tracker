import { shallowMount, VueWrapper } from '@vue/test-utils';

import { Priority } from '../../../core/enums/priority.enum';

import PriorityIndicator from './priority-indicator.vue';

describe('priority indicator unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(PriorityIndicator);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('color', () => {
        test('should return correct color', async() => {
            await component.setProps({ priority: Priority.Low });
            expect(component.vm.color).toEqual('var(--priority-colors-low-0-00)');

            await component.setProps({ priority: Priority.Medium });
            expect(component.vm.color).toEqual('var(--priority-colors-medium-0-00)');

            await component.setProps({ priority: Priority.High });
            expect(component.vm.color).toEqual('var(--priority-colors-high-0-00)');
        });
    });
});
