import { shallowMount, VueWrapper } from '@vue/test-utils';

import SearchBox from './search-box.vue';

describe('search box unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(SearchBox);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });

    describe('onReset', () => {
        test('should not show reset button when no search text exists', async() => {
            const input = component.find('input');
            await input.setValue('');

            expect(component.find('.reset-button').exists()).toEqual(false);
        });

        test('should allow reset when search text exists', async() => {
            const input = component.find('input');
            await input.setValue('search_text');
            await input.trigger('keyup');
            jest.advanceTimersByTime(200);
            expect(component.emitted().search.length).toEqual(1);

            await component.find('.reset-button').trigger('click');
            jest.advanceTimersByTime(200);
            // button will be hidden again after reset
            expect(component.find('.reset-button').exists()).toEqual(false);
            expect(component.emitted().search.length).toEqual(2);
            expect(component.emitted().search[1]).toEqual(['']);
        });
    });

    describe('onSearch', () => {
        test('should emit nothing when search text is not changed', async() => {
            const input = component.find('input');
            await input.setValue('search_text');
            await input.trigger('keyup');
            jest.advanceTimersByTime(200);
            const emitCount = component.emitted().search.length;

            await input.setValue('search_text');
            await input.trigger('keyup');
            jest.advanceTimersByTime(200);
            expect(component.emitted().search.length).toEqual(emitCount);
        });

        test('should debounce on search', async() => {
            const input = component.find('input');
            await input.setValue('search_text');
            await input.trigger('keyup');
            jest.advanceTimersByTime(150);
            expect(component.emitted().search).toBeFalsy();

            await input.setValue('different_search_text');
            await input.trigger('keyup');
            jest.advanceTimersByTime(50);
            expect(component.emitted().search).toBeFalsy();

            await input.setValue('final_search_text');
            await input.trigger('keyup');
            jest.advanceTimersByTime(150);
            expect(component.emitted().search).toBeFalsy();

            jest.advanceTimersByTime(50);
            expect(component.emitted().search.length).toEqual(1);
            expect(component.emitted().search[0]).toEqual(['final_search_text']);
        });
    });
});
