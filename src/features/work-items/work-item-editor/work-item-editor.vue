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
            v-model:isSaved="isBaseSaved"
            @close="$emit('close:interruption', $event)"
            @create="$emit('create:interruption', $event)"
            @update="$emit('update:interruption', $event)"
            @update:isSaved="$emit('update:isSaved', $event)"
            @delete="$emit('delete:interruption', $event)"
            @start="$emit('start:interruption', $event)"
            @stop="$emit('stop:interruption', $event)"
            @resolve="$emit('resolve:interruption', $event)"
            @unresolve="$emit('unresolve:interruption', $event)">

            <template v-slot:selector>
                <selection-group class="priority-selector"
                    :options="priorityOptions"
                    :selectedOption="priority"
                    @select="onPrioritySelect($event)">
                </selection-group>
            </template>
        </item-editor-base>

        <item-editor-base v-if="taskStore.editingItem"
            class="item-editor"
            :item="taskStore.editingItem"
            :type="eventType.Task"
            v-model:isSaved="isBaseSaved"
            @close="$emit('close:task', $event)"
            @create="$emit('create:task', $event)"
            @update="$emit('update:task', $event)"
            @update:isSaved="$emit('update:isSaved', $event)"
            @delete="$emit('delete:task', $event)"
            @start="$emit('start:task', $event)"
            @stop="$emit('stop:task', $event)"
            @resolve="$emit('resolve:task', $event)"
            @unresolve="$emit('unresolve:task', $event)">

            <template v-slot:selector>
                <selection-group class="effort-selector"
                    :options="effortOptions"
                    :selectedOption="taskStore.editingItem.effort"
                    @select="onEffortSelect($event)">
                </selection-group>
            </template>
        </item-editor-base>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue, prop } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { DynamicComponentOption } from '../../../core/models/options/dynamic-component-option';
import { Priority } from '../../../core/enums/priority.enum';
import { EventType } from '../../../core/enums/event-type.enum';
import PriorityIndicator from '../../../shared/indicators/priority-indicator/priority-indicator.vue';
import SelectionGroup from '../../../shared/inputs/selection-group/selection-group.vue';

import ItemEditorBase from './item-editor-base/item-editor-base.vue';

class WorkItemEditorProp {
    public isSaved = prop<boolean>({ default: true });
}

@Options({
    components: {
        PriorityIndicator,
        SelectionGroup,
        ItemEditorBase
    },
    emits: [
        'close:interruption',
        'close:task',
        'create:interruption',
        'create:task',
        'update:interruption',
        'update:task',
        'update:isSaved',
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
export default class WorkItemEditor extends Vue.with(WorkItemEditorProp) {
    public readonly eventType = EventType;
    public readonly effortOptions = [1, 2, 3, 5, 8, 13];
    public interruptionStore!: ReturnType<typeof useInterruptionStore>;
    public taskStore!: ReturnType<typeof useTaskStore>;
    public isBaseSaved = this.isSaved;

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

    public onPrioritySelect(option: DynamicComponentOption<typeof PriorityIndicator>): void {
        this.interruptionStore.editingItem!.priority = option.properties.priority as Priority;
        this.$emit('update:isSaved', false);
    }

    public onEffortSelect(effort: number): void {
        this.taskStore.editingItem!.effort = effort;
        this.$emit('update:isSaved', false);
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

    .priority-selector, .effort-selector {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        transition: background-color 0.3s, color 0.3s;

        &:hover {
            background-color: var(--primary-colors-7-00);
        }
    }

    .effort-selector {

        &:hover {
            color: var(--font-colors-0-00);
        }

        .icon {
            margin-right: 2px;
        }
    }
}
</style>
