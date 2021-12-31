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

        <interruption-item-editor v-if="editingInterruptionItem"
            class="interruption-item-editor"
            :item="editingInterruptionItem"
            @create="onInterruptionCreate($event)">
        </interruption-item-editor>

        <task-item-editor v-if="editingTaskItem"
            class="task-item-editor"
            :item="editingTaskItem"
            @create="onTaskCreate($event)"
            @update="onTaskUpdate($event)"
            @delete="onTaskDeleteStart($event)">
        </task-item-editor>

        <interruption-item-list class="interruption-item-list"
            :searchText="searchText">
        </interruption-item-list>

        <task-item-list class="task-item-list"
            :searchText="searchText"
            @select="onTaskSelect($event)">
        </task-item-list>

        <work-item-creator class="work-item-creator"></work-item-creator>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';

import store from '../../store';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { TaskItem } from '../../core/models/task/task-item';
import SearchBox from '../../shared/inputs/search-box/search-box.vue';
import DialogPanel from '../../shared/panels/dialog-panel/dialog-panel.vue';
import TaskDeleteDialog from '../../shared/dialogs/task-delete-dialog/task-delete-dialog.vue';

import InterruptionItemEditor from './interruption/interruption-item-editor/interruption-item-editor.vue';
import InterruptionItemList from './interruption/interruption-item-list/interruption-item-list.vue';
import TaskItemEditor from './task/task-item-editor/task-item-editor.vue';
import TaskItemList from './task/task-item-list/task-item-list.vue';
import WorkItemCreator from './work-item-creator/work-item-creator.vue';

@Options({
    components: {
        SearchBox,
        DialogPanel,
        InterruptionItemEditor,
        InterruptionItemList,
        TaskItemEditor,
        TaskItemList,
        WorkItemCreator
    }
})
export default class WorkItems extends Vue {
    public readonly taskDeleteDialog = markRaw(TaskDeleteDialog);
    public taskDeleteDialogOption: TaskItem | null = null;
    public searchText = '';

    get editingInterruptionItem(): InterruptionItem | null {
        return store.interruption.getters(store.interruption.getter.EditingItem);
    }

    get editingTaskItem(): TaskItem | null {
        return store.task.getters(store.task.getter.EditingItem);
    }

    public async created(): Promise<void> {
        await store.interruption.dispatch(store.interruption.action.LoadInterruptionSummaries);
        await store.task.dispatch(store.task.action.LoadTaskSummaries);
        const items = store.task.getters(store.task.getter.Summaries)('');

        if (items.length) {
            store.interruption.dispatch(store.interruption.action.EndInterruptionItemEdit);
            store.task.dispatch(store.task.action.StartTaskItemEdit, items[0].id);
        }
    }

    public async onInterruptionCreate(item: InterruptionItem): Promise<void> {
        if (await store.interruption.dispatch(store.interruption.action.CreateInterruptionItem, item)) {
            store.interruption.dispatch(store.interruption.action.LoadInterruptionSummaries);
        }
    }

    public onTaskSelect(item: TaskItemSummaryDto): void {
        if (this.editingTaskItem?.id !== item.id) {
            store.interruption.dispatch(store.interruption.action.EndInterruptionItemEdit);
            store.task.dispatch(store.task.action.StartTaskItemEdit, item.id);
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
    $item-creator-dimension: 5.5vh;

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

    .interruption-item-editor, .task-item-editor {
        $editor-width: 45%;

        position: absolute;
        left: calc(50% - #{$editor-width} / 2);
        bottom: calc(#{$item-creator-dimension} + 7.5%);
        width: $editor-width;
        height: 67.5%;
    }

    .interruption-item-list, .task-item-list {
        position: absolute;
        top: 15%;
        width: $item-list-width;
    }

    .interruption-item-list {
        left: $border-gap;
    }

    .task-item-list {
        right: $border-gap;
    }

    .work-item-creator {
        position: absolute;
        width: $item-creator-dimension;
        height: $item-creator-dimension;
        left: calc(50% - #{$item-creator-dimension} / 2);
        bottom: 3.5vh;
        @include animate-opacity(0, 1, 0.3s, 0.3s);
    }
}
</style>
