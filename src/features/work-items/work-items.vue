<template>
    <div class="work-items-container">
        <search-box class="search-box" @search="searchText = $event"></search-box>
        <work-item-creator class="work-item-creator"></work-item-creator>

        <interruption-item-editor v-if="editingInterruptionItem"
            class="interruption-item-editor"
            :item="editingInterruptionItem"
            @create="onInterruptionCreate($event)"
            @update="onInterruptionUpdate($event)"
            @delete="onInterruptionDeleteStart($event)"
            @start="onInterruptionStart($event)"
            @stop="onIdlingStart()">
        </interruption-item-editor>

        <task-item-editor v-if="editingTaskItem"
            class="task-item-editor"
            :item="editingTaskItem"
            @create="onTaskCreate($event)"
            @update="onTaskUpdate($event)"
            @delete="onTaskDeleteStart($event)"
            @start="onTaskStart($event)"
            @stop="onIdlingStart()">
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

import { createStore } from '../../store';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../core/dtos/task-item-summary-dto';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { TaskItem } from '../../core/models/task/task-item';
import { ConfirmationDialogOption } from '../../core/models/options/confirmation-dialog-option';
import { DialogConfig } from '../../core/models/generic/dialog-config';
import { ButtonType } from '../../core/enums/button-type.enum';
import { EventType } from '../../core/enums/event-type.enum';
import SearchBox from '../../shared/inputs/search-box/search-box.vue';
import ConfirmationDialog from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.vue';

import InterruptionItemEditor from './interruption/interruption-item-editor/interruption-item-editor.vue';
import InterruptionItemList from './interruption/interruption-item-list/interruption-item-list.vue';
import TaskItemEditor from './task/task-item-editor/task-item-editor.vue';
import TaskItemList from './task/task-item-list/task-item-list.vue';
import WorkItemCreator from './work-item-creator/work-item-creator.vue';

const store = container.get<ReturnType<typeof createStore>>(types.Store);

@Options({
    components: {
        SearchBox,
        InterruptionItemEditor,
        InterruptionItemList,
        TaskItemEditor,
        TaskItemList,
        WorkItemCreator
    }
})
export default class WorkItems extends Vue {
    public searchText = '';
    /* istanbul ignore next */
    get editingInterruptionItem(): InterruptionItem | null {
        return store.interruption.getters(store.interruption.getter.EditingItem);
    }

    /* istanbul ignore next */
    get editingTaskItem(): TaskItem | null {
        return store.task.getters(store.task.getter.EditingItem);
    }

    public async created(): Promise<void> {
        await store.event.dispatch(store.event.action.LoadOngoingTimeSummary);
        await store.interruption.dispatch(store.interruption.action.LoadInterruptionSummaries);
        await store.task.dispatch(store.task.action.LoadTaskSummaries);

        if (store.event.getters(store.event.getter.IsWorking)) {
            this.openActiveWorkItem();
        }
        else {
            this.openAvailableWorkItem();
        }
    }

    /* istanbul ignore next */
    public onIdlingStart(): void {
        store.event.dispatch(store.event.action.StartIdlingSession);
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
            const data = new ConfirmationDialogOption(title, 'Delete', 'Wait NO', ButtonType.Warning, item);
            const preConfirm = this.onInterruptionDelete.bind(this);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { preConfirm });
            store.dialog.dispatch(store.dialog.action.OpenDialog, config);
        }
    }

    /* istanbul ignore next */
    public onInterruptionStart(item: InterruptionItem): void {
        store.event.dispatch(store.event.action.StartInterruptionItem, item.id);
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
            const data = new ConfirmationDialogOption(title, 'Delete', 'Wait NO', ButtonType.Warning, item);
            const preConfirm = this.onTaskDelete.bind(this);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { preConfirm });
            store.dialog.dispatch(store.dialog.action.OpenDialog, config);
        }
    }

    /* istanbul ignore next */
    public onTaskStart(item: TaskItem): void {
        store.event.dispatch(store.event.action.StartTaskItem, item.id);
    }

    private openActiveWorkItem(): void {
        const activeInterruption = store.interruption.getters(store.interruption.getter.ActiveSummary);
        const activeTask = store.task.getters(store.task.getter.ActiveSummary);

        if (activeInterruption) {
            this.onInterruptionSelect(activeInterruption);
        }
        else if (activeTask) {
            this.onTaskSelect(activeTask);
        }
    }

    private openAvailableWorkItem(): void {
        const interruptions = store.interruption.getters(store.interruption.getter.Summaries)(this.searchText);
        const tasks = store.task.getters(store.task.getter.Summaries)(this.searchText);

        if (interruptions.length) {
            this.onInterruptionSelect(interruptions[0]);
        }
        else if (tasks.length) {
            this.onTaskSelect(tasks[0]);
        }
    }

    private async onInterruptionDelete(item: InterruptionItem): Promise<void> {
        if (!await store.interruption.dispatch(store.interruption.action.DeleteInterruptionItem, item.id)) {
            return;
        }

        if (store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Interruption, item.id)) {
            await store.event.dispatch(store.event.action.StartIdlingSession);
        }
    }

    private async onTaskDelete(item: TaskItem): Promise<void> {
        if (!await store.task.dispatch(store.task.action.DeleteTaskItem, item.id)) {
            return;
        }

        if (store.event.getters(store.event.getter.IsActiveWorkItem)(EventType.Task, item.id)) {
            await store.event.dispatch(store.event.action.StartIdlingSession);
        }
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
        @include animate-opacity(0, 1, 0.3s, 0.8s);
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
