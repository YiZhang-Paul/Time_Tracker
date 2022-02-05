<template>
    <div class="work-item-editor-container">
        <div v-if="!isEditing" class="placeholder">
            <span v-if="hasUnresolvedItem">You still got things to do. Pick one and get it done.</span>
            <span v-if="!hasUnresolvedItem">You sure you have nothing to do, you dipshit?</span>
        </div>

        <interruption-item-editor v-if="interruptionStore.editingItem"
            class="item-editor"
            :item="interruptionStore.editingItem"
            @create="$emit('create:interruption', $event)"
            @update="$emit('update:interruption', $event)"
            @delete="$emit('delete:interruption', $event)"
            @start="$emit('start:interruption', $event)"
            @stop="$emit('stop:interruption', $event)"
            @resolve="$emit('resolve:interruption', $event)"
            @unresolve="$emit('unresolve:interruption', $event)">
        </interruption-item-editor>

        <task-item-editor v-if="taskStore.editingItem"
            class="item-editor"
            :item="taskStore.editingItem"
            @create="$emit('create:task', $event)"
            @update="$emit('update:task', $event)"
            @delete="$emit('delete:task', $event)"
            @start="$emit('start:task', $event)"
            @stop="$emit('stop:task', $event)"
            @resolve="$emit('resolve:task', $event)"
            @unresolve="$emit('unresolve:task', $event)">
        </task-item-editor>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import InterruptionItemEditor from '../interruption/interruption-item-editor/interruption-item-editor.vue';
import TaskItemEditor from '../task/task-item-editor/task-item-editor.vue';

@Options({
    components: {
        InterruptionItemEditor,
        TaskItemEditor
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
    public interruptionStore!: ReturnType<typeof useInterruptionStore>;
    public taskStore!: ReturnType<typeof useTaskStore>;

    get isEditing(): boolean {
        return Boolean(this.interruptionStore.editingItem) || Boolean(this.taskStore.editingItem);
    }

    get hasUnresolvedItem(): boolean {
        const interruptions = this.interruptionStore.summaries.unresolved;
        const tasks = this.taskStore.summaries.unresolved;

        return Boolean(interruptions.length) || Boolean(tasks.length);
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
}
</style>
