<template>
    <div v-if="data" class="task-delete-dialog-container">
        <div class="title">
            <alert class="icon" />
            <span>The task will be permanently deleted. Proceed?</span>
        </div>

        <div class="actions">
            <button class="cancel-button" @click="$emit('cancel')">Cancel</button>
            <raised-button class="delete-button" @click="$emit('confirm', data)">Delete</raised-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Alert } from 'mdue';

import { TaskItem } from '../../../core/models/task/task-item';
import RaisedButton from '../../../shared/buttons/raised-button/raised-button.vue';

class TaskDeleteDialogProp {
    public data = prop<TaskItem>({ default: null });
}

@Options({
    components: {
        Alert,
        RaisedButton
    },
    emits: [
        'cancel',
        'confirm'
    ]
})
export default class TaskDeleteDialog extends Vue.with(TaskDeleteDialogProp) { }
</script>

<style lang="scss" scoped>
.task-delete-dialog-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, center);
    color: var(--font-colors-0-00);
    font-size: var(--font-sizes-600);

    .title {
        @include flex-row(center, center);

        .icon {
            margin-right: 8px;
            font-size: var(--font-sizes-700);
        }
    }

    .actions {
        @include flex-row(center, flex-end);
        margin-top: 5vh;
        width: 90%;
        font-size: var(--font-sizes-500);

        .delete-button {
            margin-left: 12px;

            &:hover ::v-deep(.content-wrapper) {
                background-color: var(--context-colors-warning-0-00);
            }

            ::v-deep(.content-wrapper) {
                background-color: var(--context-colors-warning-1-00);
            }
        }
    }
}
</style>
