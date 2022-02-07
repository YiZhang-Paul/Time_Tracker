<template>
    <div class="work-items-container">
        <div class="actions-bar">
            <search-box class="search-box" @search="searchText = $event"></search-box>
            <work-item-creator class="work-item-creator"></work-item-creator>
        </div>

        <work-item-list class="work-item-list"
            :searchText="searchText"
            @select:interruption="onInterruptionSelect($event)"
            @select:task="onTaskSelect($event)">
        </work-item-list>

        <work-item-editor class="work-item-editor"
            @close:interruption="interruptionStore.stopItemEdit()"
            @close:task="taskStore.stopItemEdit()"
            @create:interruption="onInterruptionCreate($event)"
            @create:task="onTaskCreate($event)"
            @update:interruption="onInterruptionUpdate($event)"
            @update:task="onTaskUpdate($event)"
            @delete:interruption="onInterruptionDeleteStart($event)"
            @delete:task="onTaskDeleteStart($event)"
            @start:interruption="onInterruptionStart($event.id)"
            @start:task="onTaskStart($event.id)"
            @stop:interruption="eventStore.startIdling()"
            @stop:task="eventStore.startIdling()"
            @resolve:interruption="onInterruptionResolve($event)"
            @resolve:task="onTaskResolve($event)"
            @unresolve:interruption="onInterruptionUnresolve($event)"
            @unresolve:task="onTaskUnresolve($event)">
        </work-item-editor>
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

import WorkItemCreator from './work-item-creator/work-item-creator.vue';
import WorkItemList from './work-item-list/work-item-list.vue';
import WorkItemEditor from './work-item-editor/work-item-editor.vue';

@Options({
    components: {
        SearchBox,
        WorkItemCreator,
        WorkItemList,
        WorkItemEditor
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

    public async onInterruptionResolve(item: InterruptionItem): Promise<void> {
        if (!await this.interruptionStore.resolveItem(item)) {
            return;
        }

        await this.interruptionStore.loadSummaries();

        if (this.interruptionStore.editingItem?.id === item.id) {
            this.interruptionStore.startItemEdit(item.id, false);
        }

        if (this.eventStore.isActiveWorkItem(EventType.Interruption, item.id)) {
            await this.eventStore.startIdling();
        }
    }

    public async onInterruptionUnresolve(item: InterruptionItem): Promise<void> {
        if (!await this.interruptionStore.unresolveItem(item)) {
            return;
        }

        await this.interruptionStore.loadSummaries();

        if (this.interruptionStore.editingItem?.id === item.id) {
            this.interruptionStore.startItemEdit(item.id, false);
        }
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

    public async onTaskResolve(item: TaskItem): Promise<void> {
        if (!await this.taskStore.resolveItem(item)) {
            return;
        }

        await this.taskStore.loadSummaries();

        if (this.taskStore.editingItem?.id === item.id) {
            this.taskStore.startItemEdit(item.id, false);
        }

        if (this.eventStore.isActiveWorkItem(EventType.Task, item.id)) {
            await this.eventStore.startIdling();
        }
    }

    public async onTaskUnresolve(item: TaskItem): Promise<void> {
        if (!await this.taskStore.unresolveItem(item)) {
            return;
        }

        await this.taskStore.loadSummaries();

        if (this.taskStore.editingItem?.id === item.id) {
            this.taskStore.startItemEdit(item.id, false);
        }
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
        const interruptions = this.interruptionStore.filteredSummaries(this.searchText).unresolved;
        const tasks = this.taskStore.filteredSummaries(this.searchText).unresolved;

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
    @import '../../styles/presets.scss';
    @import '../../styles/animations.scss';

    $border-gap: 1.5vh;

    @include flex-column(center, center);
    box-sizing: border-box;
    position: relative;

    .actions-bar, .work-item-editor {
        $width: 50%;

        position: absolute;
        left: calc(50% - #{$width} / 2);
        width: $width;
    }

    .actions-bar {
        $creator-dimension: 5.5vh;

        @include flex-row(center, space-between);
        box-sizing: border-box;
        padding: 0 1vh;
        top: $border-gap;
        height: 9%;

        .search-box {
            width: calc(100% - 2vh - #{$creator-dimension});
            height: 100%;
        }

        .work-item-creator {
            width: $creator-dimension;
            height: $creator-dimension;
            @include animate-opacity(0, 1, 0.3s, 0.8s);
        }
    }

    .work-item-list {
        position: absolute;
        top: 15%;
        width: calc(100% - #{$border-gap} * 2);
        height: 38.5rem;
        max-height: 77.5%;
    }

    .work-item-editor {
        bottom: 12.5vh;
        height: 70%;
    }
}
</style>
