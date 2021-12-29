<template>
    <time-display class="time-display"></time-display>

    <task-item-editor v-if="editingTaskItem"
        class="task-item-editor"
        :item="editingTaskItem"
        @create="onTaskCreate($event)"
        @delete="onTaskDelete($event)">
    </task-item-editor>

    <task-item-list class="task-item-list" @select="onTaskSelect($event)"></task-item-list>

    <creation-button class="creation-button"
        @click="onTaskCreationStart()"
        :isDisabled="!canCreateTask">
    </creation-button>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from './store';
import { TaskItemSummaryDto } from './core/dtos/task-item-summary-dto';
import { TaskItem } from './core/models/task/task-item';
import TimeDisplay from './features/time-display/time-display.vue';
import TaskItemEditor from './features/task/task-item-editor/task-item-editor.vue';
import TaskItemList from './features/task/task-item-list/task-item-list.vue';
import CreationButton from './shared/buttons/creation-button.vue';

@Options({
    components: {
        TimeDisplay,
        TaskItemEditor,
        TaskItemList,
        CreationButton
    }
})
export default class App extends Vue {
    get canCreateTask(): boolean {
        return this.editingTaskItem?.id !== -1;
    }

    get editingTaskItem(): TaskItem | null {
        return store.task.getters(store.task.getter.EditingItem);
    }

    public created(): void {
        store.task.dispatch(store.task.action.LoadTaskItems);
    }

    public onTaskSelect(item: TaskItemSummaryDto): void {
        if (this.editingTaskItem?.id !== item.id) {
            store.task.dispatch(store.task.action.StartTaskItemEdit, item.id);
        }
    }

    public onTaskCreationStart(): void {
        if (this.canCreateTask) {
            store.task.dispatch(store.task.action.StartTaskItemCreation);
        }
    }

    public async onTaskCreate(item: TaskItem): Promise<void> {
        if (await store.task.dispatch(store.task.action.CreateTaskItem, item)) {
            store.task.dispatch(store.task.action.LoadTaskItems);
        }
    }

    public onTaskDelete(item: TaskItem): void {
        if (item.id === -1) {
            store.task.dispatch(store.task.action.EndTaskItemEdit);
        }
        else {
            store.task.dispatch(store.task.action.DeleteTaskItem, item.id);
        }
    }
}
</script>

<style lang="scss">
@import './styles/presets.scss';
@import './styles/animations.scss';

$border-gap: 1.5vh;
$content-top: 25vh;
$item-list-width: 15vw;

html, body, #app {
    box-sizing: border-box;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    user-select: none;
}

#app {
    background-color: var(--primary-colors-10-00);
}

.time-display {
    position: absolute;
    top: $border-gap;
    right: $border-gap;
}

.task-item-editor {
    $width: 45vw;

    position: absolute;
    top: $content-top;
    left: calc((100vw - #{$width}) / 2);
    width: $width;
    height: 57.5vh;
}

.task-item-list {
    position: absolute;
    top: $content-top;
    right: $border-gap;
    width: $item-list-width;
}

.creation-button {
    $dimension: 5.5vh;

    position: absolute;
    left: calc(50vw - #{$dimension} / 2);
    bottom: 3.5vh;
    width: $dimension;
    height: $dimension;
}
</style>
