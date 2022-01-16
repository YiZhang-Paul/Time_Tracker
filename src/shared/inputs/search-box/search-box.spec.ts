import { shallowMount, VueWrapper } from '@vue/test-utils';

import SearchBox from './search-box.vue';

describe('search box unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        component = shallowMount(SearchBox);

        expect(component).toBeTruthy();
    });

    describe('onSearch', () => {
        test('should default to empty string for invalid search text value', () => {
            component = shallowMount(SearchBox);

            component.vm.onSearch(null);
            jest.advanceTimersByTime(200);

            expect(component.emitted().search).toBeFalsy();
        });

        test('should emit nothing when search text is not changed', () => {
            component = shallowMount(SearchBox);
            component.vm.onSearch('search_text');
            jest.advanceTimersByTime(200);
            const emitCount = component.emitted().search.length;

            component.vm.onSearch('search_text');
            jest.advanceTimersByTime(200);
            expect(component.emitted().search.length).toEqual(emitCount);

            component.vm.onSearch(' search_text ');
            jest.advanceTimersByTime(200);
            expect(component.emitted().search.length).toEqual(emitCount);
        });

        test('should debounce on search', () => {
            component = shallowMount(SearchBox);

            component.vm.onSearch('search_text');
            jest.advanceTimersByTime(150);
            expect(component.emitted().search).toBeFalsy();

            component.vm.onSearch('different_search_text');
            jest.advanceTimersByTime(50);
            expect(component.emitted().search).toBeFalsy();

            component.vm.onSearch('final_search_text');
            jest.advanceTimersByTime(150);
            expect(component.emitted().search).toBeFalsy();

            jest.advanceTimersByTime(50);
            expect(component.emitted().search.length).toEqual(1);
            expect(component.emitted().search[0]).toEqual(['final_search_text']);
        });
    });
});
