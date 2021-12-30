<template>
    <div class="work-items-container">
        <dialog-panel v-if="taskDeleteDialogOption"
            :dialog="taskDeleteDialog"
            :data="taskDeleteDialogOption"
            :width="'30vw'"
            :height="'15vh'"
            @cancel="taskDeleteDialogOption = null"
            @confirm="onTaskDelete($event)">
        </dialog-panel>

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
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';

import store from '../../store';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { TaskItem } from '../../core/models/task/task-item';
import CreationButton from '../../shared/buttons/creation-button/creation-button.vue';
import SearchBox from '../../shared/inputs/search-box/search-box.vue';
import DialogPanel from '../../shared/panels/dialog-panel/dialog-panel.vue';
import TaskDeleteDialog from '../../shared/dialogs/task-delete-dialog/task-delete-dialog.vue';

import TaskItemEditor from './task/task-item-editor/task-item-editor.vue';
import TaskItemList from './task/task-item-list/task-item-list.vue';

@Options({
    components: {
        TaskItemEditor,
        TaskItemList,
        CreationButton,
        SearchBox,
        DialogPanel
    }
})
export default class WorkItems extends Vue {
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

<style lang="scss" scoped>
.work-items-container {
    @import '../../styles/animations.scss';

    $border-gap: 1.5vh;
    $item-list-width: 20%;
    $creation-button-dimension: 5.5vh;

    box-sizing: border-box;
    position: relative;

    .search-box {
        $box-width: 35%;

        position: absolute;
        top: $border-gap;
        left: calc(50% - #{$box-width} / 2);
        width: $box-width;
        height: 9%;
    }

    .task-item-editor {
        $editor-width: 45%;

        position: absolute;
        left: calc(50% - #{$editor-width} / 2);
        bottom: calc(#{$creation-button-dimension} + 7.5%);
        width: $editor-width;
        height: 67.5%;
    }

    .task-item-list {
        position: absolute;
        top: 15%;
        right: $border-gap;
        width: $item-list-width;
    }

    .creation-button {
        position: absolute;
        left: calc(50% - #{$creation-button-dimension} / 2);
        bottom: 3.5vh;
        width: $creation-button-dimension;
        height: $creation-button-dimension;
        @include animate-opacity(0, 1, 0.3s, 0.3s);
    }
}
</style>
