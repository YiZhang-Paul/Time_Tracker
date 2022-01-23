<template>
    <div class="work-items-container">
        <search-box class="search-box" @search="searchText = $event"></search-box>
        <work-item-creator class="work-item-creator"></work-item-creator>

        <interruption-item-editor v-if="interruptionStore.editingItem"
            class="interruption-item-editor"
            :item="interruptionStore.editingItem"
            @create="onInterruptionCreate($event)"
            @update="onInterruptionUpdate($event)"
            @delete="onInterruptionDeleteStart($event)"
            @start="onInterruptionStart($event.id)"
            @stop="eventStore.startIdling()">
        </interruption-item-editor>

        <task-item-editor v-if="taskStore.editingItem"
            class="task-item-editor"
            :item="taskStore.editingItem"
            @create="onTaskCreate($event)"
            @update="onTaskUpdate($event)"
            @delete="onTaskDeleteStart($event)"
            @start="onTaskStart($event.id)"
            @stop="eventStore.startIdling()">
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
import { mapStores } from 'pinia';

import { useDialogStore } from '../../stores/dialog/dialog.store';
import { useEventStore } from '../../stores/event/event.store';
import { useInterruptionStore } from '../../stores/interruption/interruption.store';
import { useTaskStore } from '../../stores/task/task.store';
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

@Options({
    components: {
        SearchBox,
        InterruptionItemEditor,
        InterruptionItemList,
        TaskItemEditor,
        TaskItemList,
        WorkItemCreator
    },
    computed: {
        ...mapStores(useDialogStore, useEventStore, useInterruptionStore, useTaskStore)
    }
})
export default class WorkItems extends Vue {
    public searchText = '';
    public eventStore!: ReturnType<typeof useEventStore>;
    public interruptionStore!: ReturnType<typeof useInterruptionStore>;
    public taskStore!: ReturnType<typeof useTaskStore>;
    private dialogStore!: ReturnType<typeof useDialogStore>;

    public created(): void {
        this.initialize();
    }

    public async initialize(): Promise<void> {
        await Promise.all([
            this.eventStore.loadOngoingEventSummary(),
            this.interruptionStore.loadSummaries(),
            this.taskStore.loadSummaries()
        ]);

        if (this.eventStore.isWorking) {
            this.openActiveWorkItem();
        }
        else {
            this.openAvailableWorkItem();
        }
    }

    public onInterruptionSelect(item: InterruptionItemSummaryDto): void {
        if (this.interruptionStore.editingItem?.id !== item.id) {
            this.taskStore.stopItemEdit();
            this.interruptionStore.startItemEdit(item.id);
        }
    }

    public async onInterruptionCreate(item: InterruptionItem): Promise<void> {
        if (await this.interruptionStore.createItem(item)) {
            this.interruptionStore.loadSummaries();
        }
    }

    public async onInterruptionUpdate(item: InterruptionItem): Promise<void> {
        if (await this.interruptionStore.updateItem(item)) {
            this.interruptionStore.loadSummaries();
        }
    }

    public onInterruptionDeleteStart(item: InterruptionItem): void {
        if (item.id === -1) {
            this.interruptionStore.stopItemEdit();
        }
        else {
            const title = 'The item will be permanently deleted. Proceed?';
            const data = new ConfirmationDialogOption(title, 'Delete', 'Wait NO', ButtonType.Warning, item);
            const preConfirm = this.onInterruptionDelete.bind(this);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { preConfirm });
            this.dialogStore.open(config);
        }
    }

    public onInterruptionStart(id: number): void {
        this.onWorkItemStart(() => this.eventStore.startInterruption(id));
    }

    public onTaskSelect(item: TaskItemSummaryDto): void {
        if (this.taskStore.editingItem?.id !== item.id) {
            this.interruptionStore.stopItemEdit();
            this.taskStore.startItemEdit(item.id);
        }
    }

    public async onTaskCreate(item: TaskItem): Promise<void> {
        if (await this.taskStore.createItem(item)) {
            this.taskStore.loadSummaries();
        }
    }

    public async onTaskUpdate(item: TaskItem): Promise<void> {
        if (await this.taskStore.updateItem(item)) {
            this.taskStore.loadSummaries();
        }
    }

    public onTaskDeleteStart(item: TaskItem): void {
        if (item.id === -1) {
            this.taskStore.stopItemEdit();
        }
        else {
            const title = 'The task will be permanently deleted. Proceed?';
            const data = new ConfirmationDialogOption(title, 'Delete', 'Wait NO', ButtonType.Warning, item);
            const preConfirm = this.onTaskDelete.bind(this);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { preConfirm });
            this.dialogStore.open(config);
        }
    }

    public onTaskStart(id: number): void {
        this.onWorkItemStart(() => this.eventStore.startTask(id));
    }

    private onWorkItemStart(callback: () => void): void {
        if (!this.eventStore.isBreaking) {
            callback();
        }
        else {
            const title = 'You are still taking rest now. Ready to start working right away?';
            const data = new ConfirmationDialogOption(title, 'Work, work', 'More rest then', ButtonType.Warning);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { width: '40vw', preConfirm: callback });
            this.dialogStore.open(config);
        }
    }

    private openActiveWorkItem(): void {
        if (this.interruptionStore.activeSummary) {
            this.onInterruptionSelect(this.interruptionStore.activeSummary);
        }
        else {
            this.onTaskSelect(this.taskStore.activeSummary!);
        }
    }

    private openAvailableWorkItem(): void {
        const interruptions = this.interruptionStore.filteredSummaries(this.searchText);
        const tasks = this.taskStore.filteredSummaries(this.searchText);

        if (interruptions.length) {
            this.onInterruptionSelect(interruptions[0]);
        }
        else if (tasks.length) {
            this.onTaskSelect(tasks[0]);
        }
    }

    private async onInterruptionDelete(item: InterruptionItem): Promise<void> {
        if (!await this.interruptionStore.deleteItem(item.id)) {
            return;
        }

        if (this.eventStore.isActiveWorkItem(EventType.Interruption, item.id)) {
            await this.eventStore.startIdling();
        }
    }

    private async onTaskDelete(item: TaskItem): Promise<void> {
        if (!await this.taskStore.deleteItem(item.id)) {
            return;
        }

        if (this.eventStore.isActiveWorkItem(EventType.Task, item.id)) {
            await this.eventStore.startIdling();
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
