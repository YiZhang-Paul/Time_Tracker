import { nextTick } from 'vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';

import TimeDisplay from './time-display.vue';

describe('time display unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(TimeDisplay);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('time display', () => {
        test('should display correct date and time', async() => {
            component.vm.current = new Date(2022, 1, 2, 15, 30, 55);
            await nextTick();

            expect(component.find('.time-display-container').text()).toEqual('3:30 PMFeb 2nd, 2022');

            component.vm.current = new Date(2023, 11, 25, 9, 15, 5);
            await nextTick();

            expect(component.find('.time-display-container').text()).toEqual('9:15 AMDec 25th, 2023');
        });
    });
});
