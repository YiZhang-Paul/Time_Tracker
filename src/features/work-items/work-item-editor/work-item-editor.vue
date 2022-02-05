<template>
    <div class="work-item-editor-container">
        <div v-if="!isEditing" class="placeholder">
            <span v-if="hasUnresolvedItem">You still got things to do. Pick one and get it done.</span>
            <span v-if="!hasUnresolvedItem">You sure you have nothing to do, you dipshit?</span>
        </div>

        <item-editor-base v-if="interruptionStore.editingItem"
            class="item-editor"
            :item="interruptionStore.editingItem"
            :type="eventType.Interruption"
            @create="$emit('create:interruption', $event)"
            @update="$emit('update:interruption', $event)"
            @delete="$emit('delete:interruption', $event)"
            @start="$emit('start:interruption', $event)"
            @stop="$emit('stop:interruption', $event)"
            @resolve="$emit('resolve:interruption', $event)"
            @unresolve="$emit('unresolve:interruption', $event)">

            <template v-slot:footerActions>
                <selection-group class="priority-selector"
                    :options="priorityOptions"
                    :selectedOption="priority"
                    @select="interruptionStore.editingItem.priority = $event.properties.priority">
                </selection-group>
            </template>
        </item-editor-base>

        <item-editor-base v-if="taskStore.editingItem"
            class="item-editor"
            :item="taskStore.editingItem"
            :type="eventType.Task"
            @create="$emit('create:task', $event)"
            @update="$emit('update:task', $event)"
            @delete="$emit('delete:task', $event)"
            @start="$emit('start:task', $event)"
            @stop="$emit('stop:task', $event)"
            @resolve="$emit('resolve:task', $event)"
            @unresolve="$emit('unresolve:task', $event)">

            <template v-slot:footerActions>
                <selection-group class="effort-selector"
                    :options="effortOptions"
                    :selectedOption="taskStore.editingItem.effort"
                    @select="taskStore.editingItem.effort = $event">

                    <dumbbell class="icon" />
                </selection-group>
            </template>
        </item-editor-base>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { Dumbbell } from 'mdue';

import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { DynamicComponentOption } from '../../../core/models/options/dynamic-component-option';
import { Priority } from '../../../core/enums/priority.enum';
import { EventType } from '../../../core/enums/event-type.enum';
import PriorityIndicator from '../../../shared/indicators/priority-indicator/priority-indicator.vue';
import SelectionGroup from '../../../shared/inputs/selection-group/selection-group.vue';

import ItemEditorBase from './item-editor-base/item-editor-base.vue';

@Options({
    components: {
        Dumbbell,
        PriorityIndicator,
        SelectionGroup,
        ItemEditorBase
    },
    emits: [
        'create:interruption',
        'create:task',
        'update:interruption',
        'update:task',
        'delete:interruption',
        'delete:task',
        'start:interruption',
        'start:task',
        'stop:interruption',
        'stop:task',
        'resolve:interruption',
        'resolve:task',
        'unresolve:interruption',
        'unresolve:task'
    ],
    computed: {
        ...mapStores(useInterruptionStore, useTaskStore)
    }
})
export default class WorkItemEditor extends Vue {
    public readonly eventType = EventType;
    public readonly effortOptions = [1, 2, 3, 5, 8, 13];
    public interruptionStore!: ReturnType<typeof useInterruptionStore>;
    public taskStore!: ReturnType<typeof useTaskStore>;

    public readonly priorityOptions = [Priority.Low, Priority.Medium, Priority.High].map(_ => {
        const component = markRaw(PriorityIndicator);
        const properties = { priority: _ };

        return new DynamicComponentOption(component, properties);
    });

    get isEditing(): boolean {
        return Boolean(this.interruptionStore.editingItem) || Boolean(this.taskStore.editingItem);
    }

    get hasUnresolvedItem(): boolean {
        const interruptions = this.interruptionStore.summaries.unresolved;
        const tasks = this.taskStore.summaries.unresolved;

        return Boolean(interruptions.length) || Boolean(tasks.length);
    }

    get priority(): DynamicComponentOption<typeof PriorityIndicator> {
        return this.priorityOptions.find(_ => _.properties.priority === this.interruptionStore.editingItem!.priority)!;
    }
}
</script>

<style lang="scss" scoped>
.work-item-editor-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    .item-editor, .placeholder {
        width: 100%;
        height: 100%;
    }

    .placeholder {
        @include flex-row(center, center);
        color: var(--font-colors-2-00);
        font-size: var(--font-sizes-700);
        @include animate-opacity(0, 1, 0.3s, 0.5s);
    }

    .priority-selector {
        font-size: var(--font-sizes-400);
    }

    .effort-selector {
        transition: color 0.3s;

        &:hover {
            color: var(--font-colors-0-00);
        }

        .icon {
            margin-right: 2px;
        }
    }
}
</style>
