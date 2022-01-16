import { shallowMount, VueWrapper } from '@vue/test-utils';

import TimeDisplay from './time-display.vue';

describe('time display unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(TimeDisplay);

        expect(component).toBeTruthy();
    });

    describe('time', () => {
        test('should return correct time', () => {
            component = shallowMount(TimeDisplay);
            component.vm.current = new Date(2022, 1, 2, 15, 30, 55);

            expect(component.vm.time).toEqual('3:30 PM');
        });
    });

    describe('month', () => {
        test('should return correct month', () => {
            component = shallowMount(TimeDisplay);
            component.vm.current = new Date(2022, 1, 2, 15, 30, 55);

            expect(component.vm.month).toEqual('Feb');
        });
    });

    describe('dateSuffix', () => {
        test('should return correct date suffix', () => {
            component = shallowMount(TimeDisplay);
            component.vm.current = new Date(2022, 1, 2, 15, 30, 55);

            expect(component.vm.dateSuffix).toEqual('nd');
        });
    });
});
