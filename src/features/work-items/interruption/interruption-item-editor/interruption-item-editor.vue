<template>
    <work-item-editor class="interruption-item-editor-container"
        :item="item"
        :type="type"
        @create="$emit('create', $event)"
        @update="$emit('update', $event)"
        @delete="$emit('delete', $event)"
        @start="$emit('start', $event)"
        @stop="$emit('stop', $event)"
        @resolve="$emit('resolve', $event)"
        @unresolve="$emit('unresolve', $event)">

        <template v-slot:footerActions>
            <selection-group class="priority-selector"
                :options="priorityOptions"
                :selectedOption="priority"
                @select="item.priority = $event.properties.priority">
            </selection-group>
        </template>
    </work-item-editor>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue, prop } from 'vue-class-component';

import { DynamicComponentOption } from '../../../../core/models/options/dynamic-component-option';
import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { Priority } from '../../../../core/enums/priority.enum';
import { EventType } from '../../../../core/enums/event-type.enum';
import PriorityIndicator from '../../../../shared/indicators/priority-indicator/priority-indicator.vue';
import SelectionGroup from '../../../../shared/inputs/selection-group/selection-group.vue';
import WorkItemEditor from '../../../../shared/editors/work-item-editor/work-item-editor.vue';

class InterruptionItemEditorProp {
    public item = prop<InterruptionItem>({ default: new InterruptionItem(-1) });
}

@Options({
    components: {
        PriorityIndicator,
        SelectionGroup,
        WorkItemEditor
    },
    emits: [
        'create',
        'update',
        'delete',
        'start',
        'stop',
        'resolve',
        'unresolve'
    ]
})
export default class InterruptionItemEditor extends Vue.with(InterruptionItemEditorProp) {
    public readonly type = EventType.Interruption;

    public readonly priorityOptions = [Priority.Low, Priority.Medium, Priority.High].map(_ => {
        const component = markRaw(PriorityIndicator);
        const properties = { priority: _ };

        return new DynamicComponentOption(component, properties);
    });

    get priority(): DynamicComponentOption<typeof PriorityIndicator> {
        return this.priorityOptions.find(_ => _.properties.priority === this.item.priority)!;
    }
}
</script>

<style lang="scss" scoped>
.interruption-item-editor-container {

    .priority-selector {
        font-size: var(--font-sizes-400);
    }
}
</style>
