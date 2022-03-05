import { shallowMount, VueWrapper } from '@vue/test-utils';

import EventTimelineEditor from './event-timeline-editor.vue';

describe('event timeline editor unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(EventTimelineEditor);
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
