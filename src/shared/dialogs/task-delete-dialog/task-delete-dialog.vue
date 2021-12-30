<template>
    <div v-if="data" class="task-delete-dialog-container">
        <div class="title">
            <alert class="icon" />
            <span>The task will be permanently deleted. Proceed?</span>
        </div>

        <div class="actions">
            <flat-button class="cancel-button" @click="$emit('cancel')">Cancel</flat-button>
            <raised-button class="delete-button" @click="$emit('confirm', data)">Delete</raised-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Alert } from 'mdue';

import { TaskItem } from '../../../core/models/task/task-item';
import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';
import RaisedButton from '../../../shared/buttons/raised-button/raised-button.vue';

class TaskDeleteDialogProp {
    public data = prop<TaskItem>({ default: null });
}

@Options({
    components: {
        Alert,
        FlatButton,
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
    @import '../../../styles/animations.scss';

    @include flex-column(center, center);
    color: var(--font-colors-0-00);
    font-size: var(--font-sizes-600);

    .title {
        @include flex-row(center, center);
        @include animate-opacity(0, 1, 0.3s, 0.2s);

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

        .cancel-button {
            color: var(--font-colors-3-00);

            &:hover ::v-deep(.content-wrapper) {
                color: var(--font-colors-0-00);
            }
        }

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
