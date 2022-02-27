import { shallowMount, VueWrapper } from '@vue/test-utils';

import { ChecklistEntry } from '../../../../../../core/models/generic/checklist-entry';

import ChecklistEntryCard from './checklist-entry-card.vue';

describe('checklist entry card unit test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: VueWrapper<any>;

    beforeEach(() => {
        component = shallowMount(ChecklistEntryCard, { props: { entry: new ChecklistEntry('0|zzzzzz:') } });
    });

    afterEach(() => {
        component.unmount();
    });

    test('should create component instance', () => {
        expect(component).toBeTruthy();
    });
});
