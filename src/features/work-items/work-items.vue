<template>
    <div class="work-items-container">
        <dialog-panel v-if="interruptionDeleteDialogOption"
            :dialog="confirmationDialog"
            :data="interruptionDeleteDialogOption"
            :width="'30vw'"
            :height="'15vh'"
            @cancel="interruptionDeleteDialogOption = null"
            @confirm="onInterruptionDelete($event)">
        </dialog-panel>

        <dialog-panel v-if="taskDeleteDialogOption"
            :dialog="confirmationDialog"
            :data="taskDeleteDialogOption"
            :width="'30vw'"
            :height="'15vh'"
            @cancel="taskDeleteDialogOption = null"
            @confirm="onTaskDelete($event)">
        </dialog-panel>

        <search-box class="search-box" @search="searchText = $event"></search-box>
        <work-item-creator class="work-item-creator"></work-item-creator>

        <interruption-item-editor v-if="editingInterruptionItem"
            class="interruption-item-editor"
            :item="editingInterruptionItem"
            @create="onInterruptionCreate($event)"
            @update="onInterruptionUpdate($event)"
            @delete="onInterruptionDeleteStart($event)">
        </interruption-item-editor>

        <task-item-editor v-if="editingTaskItem"
            class="task-item-editor"
            :item="editingTaskItem"
            @create="onTaskCreate($event)"
            @update="onTaskUpdate($event)"
            @delete="onTaskDeleteStart($event)">
        </task-item-editor>

        <interruption-item-list class="interruption-item-list"
            :searchText="searchText"
            @select="onInterruptionSelect($event)">
        </interruption-item-list>

        <task-item-list class="task-item-list"
            :searchText="searchText"
            @select="onTaskSelect($event)">
        </task-item-list>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';

import store from '../../store';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { TaskItem } from '../../core/models/task/task-item';
import { ConfirmationDialogOption } from '../../core/models/options/confirmation-dialog-option';
import SearchBox from '../../shared/inputs/search-box/search-box.vue';
import DialogPanel from '../../shared/panels/dialog-panel/dialog-panel.vue';
import ConfirmationDialog from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.vue';

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
    public readonly confirmationDialog = markRaw(ConfirmationDialog);
    public interruptionDeleteDialogOption: ConfirmationDialogOption<InterruptionItem> | null = null;
    public taskDeleteDialogOption: ConfirmationDialogOption<TaskItem> | null = null;
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
        const interruptions = store.interruption.getters(store.interruption.getter.Summaries)('');
        const tasks = store.task.getters(store.task.getter.Summaries)('');

        if (interruptions.length) {
            this.onInterruptionSelect(interruptions[0]);
        }
        else if (tasks.length) {
            this.onTaskSelect(tasks[0]);
        }
    }

    public onInterruptionSelect(item: InterruptionItemSummaryDto): void {
        if (this.editingInterruptionItem?.id !== item.id) {
            store.task.dispatch(store.task.action.EndTaskItemEdit);
            store.interruption.dispatch(store.interruption.action.StartInterruptionItemEdit, item.id);
        }
    }

    public async onInterruptionCreate(item: InterruptionItem): Promise<void> {
        if (await store.interruption.dispatch(store.interruption.action.CreateInterruptionItem, item)) {
            store.interruption.dispatch(store.interruption.action.LoadInterruptionSummaries);
        }
    }

    public async onInterruptionUpdate(item: InterruptionItem): Promise<void> {
        if (await store.interruption.dispatch(store.interruption.action.UpdateInterruptionItem, item)) {
            store.interruption.dispatch(store.interruption.action.LoadInterruptionSummaries);
        }
    }

    public onInterruptionDeleteStart(item: InterruptionItem): void {
        if (item.id === -1) {
            store.interruption.dispatch(store.interruption.action.EndInterruptionItemEdit);
        }
        else {
            const title = 'The item will be permanently deleted. Proceed?';
            this.interruptionDeleteDialogOption = new ConfirmationDialogOption(title, 'Delete', 'Cancel', true, item);
        }
    }

    public onInterruptionDelete(item: InterruptionItem): void {
        store.interruption.dispatch(store.interruption.action.DeleteInterruptionItem, item.id);
        this.interruptionDeleteDialogOption = null;
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
            const title = 'The task will be permanently deleted. Proceed?';
            this.taskDeleteDialogOption = new ConfirmationDialogOption(title, 'Delete', 'Cancel', true, item);
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
    $search-box-width: 35%;
    $search-box-height: 9%;
    $item-list-width: 20%;
    $item-creator-dimension: 5.5vh;

    box-sizing: border-box;
    position: relative;

    .search-box {
        position: absolute;
        top: $border-gap;
        left: calc(50% - #{$search-box-width} / 2);
        width: $search-box-width;
        height: $search-box-height;
    }

    .work-item-creator {
        z-index: 1;
        position: absolute;
        width: $item-creator-dimension;
        height: $item-creator-dimension;
        top: calc(#{$border-gap} + (#{$search-box-height} - #{$item-creator-dimension}) / 2);
        left: calc(50% + #{$search-box-width} / 2 + 2.5vh);
        @include animate-opacity(0, 1, 0.3s, 0.5s);
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
}
</style>
