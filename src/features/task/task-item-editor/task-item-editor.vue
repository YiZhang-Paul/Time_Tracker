<template>
    <div class="task-item-editor-container">
        <div class="header">
            <input type="text"
                class="name"
                v-model="item.name"
                placeholder="enter title here..." />
        </div>

        <textarea class="description"
            v-model="item.description"
            placeholder="no descriptions...">
        </textarea>

        <div class="footer">
            <span v-if="item.creationTime">Created {{ item.creationTime }}</span>
            <content-save class="save-button" />
            <delete class="delete-button" @click="$emit('delete', item)" />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { ContentSave, Delete } from 'mdue';

import { TaskItem } from '../../../core/models/task/task-item';

class TaskItemEditorProp {
    public item = prop<TaskItem>({ default: new TaskItem(-1) });
}

@Options({
    components: {
        ContentSave,
        Delete
    },
    emits: [
        'delete'
    ]
})
export default class TaskItemEditor extends Vue.with(TaskItemEditorProp) { }
</script>

<style lang="scss" scoped>
.task-item-editor-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $content-width: 95%;

    @include flex-column(center, center);
    position: relative;
    box-sizing: border-box;

    .header {
        $starting-height: 87.5%;

        @include flex-row(center, center);
        position: absolute;
        top: 5%;
        width: calc(#{$content-width} + 2.5vh);
        height: $starting-height;
        border-radius: 5px;
        background-color: var(--primary-colors-10-00);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.35);
        animation: emerge-header 0.2s ease forwards, shrink-header 0.4s ease 0.2s forwards;

        @keyframes emerge-header {
            from {
                background-color: var(--primary-colors-10-00);
                box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.35);
            }
            to {
                background-color: var(--primary-colors-8-00);
                box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
            }
        }

        @keyframes shrink-header {
            from { height: $starting-height; }
            to { height: 12.5%; }
        }

        .name {
            width: 90%;
            border: none;
            outline: none;
            background-color: var(--primary-colors-8-00);
            color: var(--font-colors-0-00);
            font-size: var(--font-sizes-600);
            text-align: center;
            @include animate-opacity(0, 1, 0.3s, 0.6s);
        }
    }

    .description {
        box-sizing: border-box;
        padding: 1.75vh 1vh;
        margin-top: 10%;
        width: $content-width;
        height: 80%;
        border: none;
        outline: none;
        resize: none;
        border-radius: 0 0 5px 5px;
        background-color: var(--text-editor-color);
        color: var(--font-colors-0-00);
        font-size: inherit;
        font-family: inherit;
    }

    .footer {
        @include flex-row(center, flex-end);
        width: $content-width;
        height: 10%;
        color: var(--font-colors-2-00);
        font-size: var(--font-sizes-300);

        .save-button, .delete-button {
            margin-left: 1vh;
            cursor: pointer;
            font-size: var(--font-sizes-500);
            transition: color 0.3s;
            @include animate-opacity(0, 1, 0.3s, 0.6s);
        }

        .save-button {
            color: var(--context-colors-info-1-00);

            &:hover {
                color: var(--context-colors-info-0-00);
            }
        }

        .delete-button {
            color: var(--context-colors-warning-1-00);

            &:hover {
                color: var(--context-colors-warning-0-00);
            }
        }
    }
}
</style>
