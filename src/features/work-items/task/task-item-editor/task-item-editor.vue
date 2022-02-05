<template>
    <item-editor-base class="task-item-editor-container"
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
            <selection-group class="effort-selector"
                :options="effortOptions"
                :selectedOption="item.effort"
                @select="item.effort = $event">

                <dumbbell class="icon" />
            </selection-group>
        </template>
    </item-editor-base>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Dumbbell } from 'mdue';

import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import SelectionGroup from '../../../../shared/inputs/selection-group/selection-group.vue';
import ItemEditorBase from '../../../../shared/editors/item-editor-base/item-editor-base.vue';

class TaskItemEditorProp {
    public item = prop<TaskItem>({ default: new TaskItem(-1) });
}

@Options({
    components: {
        Dumbbell,
        SelectionGroup,
        ItemEditorBase
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
export default class TaskItemEditor extends Vue.with(TaskItemEditorProp) {
    public readonly type = EventType.Task;
    public readonly effortOptions = [1, 2, 3, 5, 8, 13];
}
</script>

<style lang="scss" scoped>
.task-item-editor-container {

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
