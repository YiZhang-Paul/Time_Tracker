import { shallowMount, VueWrapper } from '@vue/test-utils';

import { Priority } from '../../../core/enums/priority.enum';

import PriorityIndicator from './priority-indicator.vue';

describe('priority indicator unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(PriorityIndicator);

        expect(component).toBeTruthy();
    });

    describe('color', () => {
        test('should return correct color', async() => {
            component = shallowMount(PriorityIndicator, { props: { priority: Priority.Low } });
            expect(component.vm.color).toEqual('var(--priority-colors-low-0-00)');

            await component.setProps({ priority: Priority.Medium });
            expect(component.vm.color).toEqual('var(--priority-colors-medium-0-00)');

            await component.setProps({ priority: Priority.High });
            expect(component.vm.color).toEqual('var(--priority-colors-high-0-00)');
        });
    });

    describe('icons', () => {
        test('should return correct icons count', async() => {
            component = shallowMount(PriorityIndicator, { props: { priority: Priority.Low } });
            expect(component.vm.icons).toEqual(1);

            await component.setProps({ priority: Priority.Medium });
            expect(component.vm.icons).toEqual(2);

            await component.setProps({ priority: Priority.High });
            expect(component.vm.icons).toEqual(3);
        });
    });
});
