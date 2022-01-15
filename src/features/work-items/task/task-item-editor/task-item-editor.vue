<template>
    <div class="task-item-editor-container">
        <div class="header">
            <input type="text"
                class="name"
                v-model="item.name"
                maxlength="140"
                placeholder="enter title here..." />
        </div>

        <textarea class="description"
            v-model="item.description"
            placeholder="no descriptions...">
        </textarea>

        <div class="footer">
            <template v-if="item.id !== -1">
                <play-circle v-if="!isActiveWorkItem"
                    class="action-button start-button"
                    @click="$emit('start', item)" />

                <stop-circle v-if="isActiveWorkItem"
                    class="action-button stop-button"
                    @click="$emit('stop', item)" />
            </template>

            <div class="effort-selector" @click="onEffortSelect()">
                <weight class="icon" />
                <span>{{ item.effort }}</span>
            </div>

            <div class="filler"></div>
            <span v-if="item.creationTime">Created {{ creationTime }}</span>
            <content-save class="action-button save-button" @click="onSave()" />
            <delete class="action-button delete-button" @click="$emit('delete', item)" />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { ContentSave, Delete, Weight, PlayCircle, StopCircle } from 'mdue';

import { createStore } from '../../../../store';
import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';

const store = container.get<ReturnType<typeof createStore>>(types.Store);

class TaskItemEditorProp {
    public item = prop<TaskItem>({ default: new TaskItem(-1) });
}

@Options({
    components: {
        ContentSave,
        Delete,
        Weight,
        PlayCircle,
        StopCircle
    },
    emits: [
        'create',
        'update',
        'delete',
        'start',
        'stop'
    ]
})
export default class TaskItemEditor extends Vue.with(TaskItemEditorProp) {
    get isActiveWorkItem(): boolean {
        const key = store.event.getter.IsActiveWorkItem;

        return store.event.getters(key)(EventType.Task, this.item.id);
    }

    get creationTime(): string {
        return TimeUtility.getDateTimeString(new Date(this.item.creationTime));
    }

    public onEffortSelect(): void {
        const options = [1, 2, 3, 5, 8, 13];
        const index = options.indexOf(this.item.effort) + 1;
        this.item.effort = options[index % options.length];
    }

    public onSave(): void {
        if (this.item.name?.trim()) {
            const event = this.item.id === -1 ? 'create' : 'update';
            this.$emit(event, this.item);
        }
    }
}
</script>

<style lang="scss" scoped>
.task-item-editor-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

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
        animation: raise-header 0.2s ease forwards, shrink-header 0.4s ease 0.2s forwards;

        .name {
            width: 90%;
            border: none;
            outline: none;
            background-color: var(--primary-colors-8-00);
            color: var(--font-colors-0-00);
            text-align: center;
            font-size: var(--font-sizes-600);
            font-family: inherit;
            @include animate-opacity(0, 1, 0.3s, 0.6s);
        }

        @keyframes raise-header {
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
        @include animate-opacity(0, 1, 0.3s, 0.6s);

        .effort-selector {
            @include flex-row(center, center);
            transition: color 0.3s;

            &:hover {
                cursor: pointer;
                color: var(--font-colors-0-00);
            }

            .icon {
                margin-right: 4px;
            }
        }

        .filler {
            flex-grow: 1;
        }

        .action-button {
            cursor: pointer;
            font-size: var(--font-sizes-600);
            transition: color 0.3s;
        }

        .start-button, .stop-button {
            margin-right: 1vh;
        }

        .save-button, .delete-button {
            margin-left: 1vh;
        }

        .start-button {
            color: var(--start-button-color-inactive);

            &:hover {
                color: var(--start-button-color-active);
            }
        }

        .stop-button {
            color: var(--stop-button-color-inactive);

            &:hover {
                color: var(--stop-button-color-active);
            }
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
