<template>
    <dialog-panel v-if="taskDeleteDialogOption"
        :dialog="taskDeleteDialog"
        :data="taskDeleteDialogOption"
        :width="'30vw'"
        :height="'15vh'"
        @cancel="taskDeleteDialogOption = null"
        @confirm="onTaskDelete($event)">
    </dialog-panel>

    <time-display class="time-display"></time-display>
    <search-box class="search-box" @search="searchText = $event"></search-box>

    <task-item-editor v-if="editingTaskItem"
        class="task-item-editor"
        :item="editingTaskItem"
        @create="onTaskCreate($event)"
        @update="onTaskUpdate($event)"
        @delete="onTaskDeleteStart($event)">
    </task-item-editor>

    <task-item-list class="task-item-list"
        :searchText="searchText"
        @select="onTaskSelect($event)">
    </task-item-list>

    <creation-button class="creation-button"
        @click="onTaskCreationStart()"
        :isDisabled="!canCreateTask">
    </creation-button>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';

import store from './store';
import { TaskItemSummaryDto } from './core/dtos/task-item-summary-dto';
import { TaskItem } from './core/models/task/task-item';
import TimeDisplay from './features/time-display/time-display.vue';
import TaskItemEditor from './features/task/task-item-editor/task-item-editor.vue';
import TaskItemList from './features/task/task-item-list/task-item-list.vue';
import CreationButton from './shared/buttons/creation-button/creation-button.vue';
import SearchBox from './shared/inputs/search-box/search-box.vue';
import DialogPanel from './shared/panels/dialog-panel/dialog-panel.vue';
import TaskDeleteDialog from './shared/dialogs/task-delete-dialog/task-delete-dialog.vue';

@Options({
    components: {
        TimeDisplay,
        TaskItemEditor,
        TaskItemList,
        SearchBox,
        CreationButton,
        DialogPanel,
        TaskDeleteDialog
    }
})
export default class App extends Vue {
    public readonly taskDeleteDialog = markRaw(TaskDeleteDialog);
    public taskDeleteDialogOption: TaskItem | null = null;
    public searchText = '';

    get canCreateTask(): boolean {
        return this.editingTaskItem?.id !== -1;
    }

    get editingTaskItem(): TaskItem | null {
        return store.task.getters(store.task.getter.EditingItem);
    }

    public async created(): Promise<void> {
        await store.task.dispatch(store.task.action.LoadTaskSummaries);
        const items = store.task.getters(store.task.getter.Summaries)('');

        if (items.length) {
            store.task.dispatch(store.task.action.StartTaskItemEdit, items[0].id);
        }
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
            store.task.dispatch(store.task.action.LoadTaskSummaries);
        }
    }

    public async onTaskUpdate(item: TaskItem): Promise<void> {
        if (await store.task.dispatch(store.task.action.UpdateTaskItem, item)) {
            store.task.dispatch(store.task.action.LoadTaskSummaries);
        }
    }

    public onTaskDeleteStart(item: TaskItem): void {
        if (item.id === -1) {
            store.task.dispatch(store.task.action.EndTaskItemEdit);
        }
        else {
            this.taskDeleteDialogOption = item;
        }
    }

    public onTaskDelete(item: TaskItem): void {
        store.task.dispatch(store.task.action.DeleteTaskItem, item.id);
        this.taskDeleteDialogOption = null;
    }
}
</script>

<style lang="scss">
@import './styles/presets.scss';
@import './styles/animations.scss';

@font-face {
    font-family: 'Jost';
    src: url('./assets/fonts/Jost-Regular.ttf');
}

$border-gap: 1.5vh;
$content-top: 27.5vh;
$item-list-width: 20vw;

html, body, #app {
    box-sizing: border-box;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    font-family: 'Jost';
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

.search-box {
    $width: 35vw;
    $height: 7.5vh;

    position: absolute;
    top: calc(#{$content-top} - #{$height} - 5vh);
    left: calc(50vw - #{$width} / 2);
    width: $width;
    height: $height;
}

.task-item-editor {
    $width: 45vw;

    position: absolute;
    top: $content-top;
    left: calc(50vw - #{$width} / 2);
    width: $width;
    height: 57.5vh;
}

.task-item-list {
    position: absolute;
    top: calc(#{$content-top} - 2.5vh);
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
    @include animate-opacity(0, 1, 0.3s, 0.3s);
}
</style>
