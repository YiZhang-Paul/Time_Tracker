<template>
    <div class="work-items-container">
        <work-item-list class="work-item-list"
            :searchText="searchText"
            @select:interruption="onInterruptionSelect($event)"
            @select:task="onTaskSelect($event)">
        </work-item-list>

        <div class="content">
            <div class="actions-bar">
                <work-item-creator class="work-item-creator"></work-item-creator>
                <search-box class="search-box" @search="searchText = $event"></search-box>
            </div>

            <work-item-editor class="work-item-editor"
                v-model:isSaved="isEditingItemSaved"
                @close:interruption="onInterruptionClose()"
                @close:task="onTaskClose()"
                @create:interruption="onInterruptionCreate($event)"
                @create:task="onTaskCreate($event)"
                @update:interruption="onInterruptionUpdate($event)"
                @update:task="onTaskUpdate($event)"
                @delete:interruption="onInterruptionDeleteStart($event)"
                @delete:task="onTaskDeleteStart($event)"
                @pending:interruption="onInterruptionPending($event)"
                @pending:task="onTaskPending($event)"
                @start:interruption="onInterruptionStart($event.id)"
                @start:task="onTaskStart($event.id)"
                @resolve:interruption="onInterruptionResolve($event)"
                @resolve:task="onTaskResolve($event)">
            </work-item-editor>
        </div>
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
    public isEditingItemSaved = true;
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
            this.onEditingItemChange(() => {
                this.isEditingItemSaved = true;
                this.taskStore.stopItemEdit();
                this.interruptionStore.startItemEdit(item.id);
            });
        }
    }

    public onInterruptionClose(): void {
        this.onEditingItemChange(() => {
            this.isEditingItemSaved = true;
            this.interruptionStore.stopItemEdit();
        });
    }

    public async onInterruptionCreate(item: InterruptionItem): Promise<void> {
        if (await this.interruptionStore.createItem(item)) {
            this.isEditingItemSaved = true;
            this.interruptionStore.loadSummaries();
        }
    }

    public async onInterruptionUpdate(item: InterruptionItem): Promise<void> {
        if (await this.interruptionStore.updateItem(item)) {
            this.isEditingItemSaved = true;
            this.interruptionStore.loadSummaries();
        }
    }

    public onInterruptionDeleteStart(item: InterruptionItem): void {
        if (item.id === -1) {
            this.interruptionStore.stopItemEdit();
        }
        else {
            this.onWorkItemDelete(item, async() => {
                if (await this.interruptionStore.deleteItem(item.id)) {
                    await this.onWorkItemConcluded(EventType.Interruption, item.id);
                }
            });
        }
    }

    public async onInterruptionPending(item: InterruptionItem): Promise<void> {
        if (this.eventStore.isActiveWorkItem(EventType.Interruption, item.id)) {
            await this.eventStore.startIdling();
        }
        else if (await this.interruptionStore.unresolveItem(item)) {
            this.isEditingItemSaved = true;
            await this.reloadInterruptions(item.id);
        }
    }

    public onInterruptionStart(id: number): void {
        this.onWorkItemStart(async() => {
            if (await this.eventStore.startInterruption(id)) {
                await this.reloadInterruptions(id);
            }
        });
    }

    public onInterruptionResolve(item: InterruptionItem): void {
        this.onWorkItemResolve(item, async() => {
            if (await this.interruptionStore.resolveItem(item)) {
                this.isEditingItemSaved = true;
                await this.reloadInterruptions(item.id);
                await this.onWorkItemConcluded(EventType.Interruption, item.id);
            }
        });
    }

    public onTaskSelect(item: TaskItemSummaryDto): void {
        if (this.taskStore.editingItem?.id !== item.id) {
            this.onEditingItemChange(() => {
                this.isEditingItemSaved = true;
                this.interruptionStore.stopItemEdit();
                this.taskStore.startItemEdit(item.id);
            });
        }
    }

    public onTaskClose(): void {
        this.onEditingItemChange(() => {
            this.isEditingItemSaved = true;
            this.taskStore.stopItemEdit();
        });
    }

    public async onTaskCreate(item: TaskItem): Promise<void> {
        if (await this.taskStore.createItem(item)) {
            this.isEditingItemSaved = true;
            this.taskStore.loadSummaries();
        }
    }

    public async onTaskUpdate(item: TaskItem): Promise<void> {
        if (await this.taskStore.updateItem(item)) {
            this.isEditingItemSaved = true;
            this.taskStore.loadSummaries();
        }
    }

    public onTaskDeleteStart(item: TaskItem): void {
        if (item.id === -1) {
            this.taskStore.stopItemEdit();
        }
        else {
            this.onWorkItemDelete(item, async() => {
                if (await this.taskStore.deleteItem(item.id)) {
                    await this.onWorkItemConcluded(EventType.Task, item.id);
                }
            });
        }
    }

    public async onTaskPending(item: TaskItem): Promise<void> {
        if (this.eventStore.isActiveWorkItem(EventType.Task, item.id)) {
            await this.eventStore.startIdling();
        }
        else if (await this.taskStore.unresolveItem(item)) {
            this.isEditingItemSaved = true;
            await this.reloadTasks(item.id);
        }
    }

    public onTaskStart(id: number): void {
        this.onWorkItemStart(async() => {
            if (await this.eventStore.startTask(id)) {
                await this.reloadTasks(id);
            }
        });
    }

    public onTaskResolve(item: TaskItem): void {
        this.onWorkItemResolve(item, async() => {
            if (await this.taskStore.resolveItem(item)) {
                this.isEditingItemSaved = true;
                await this.reloadTasks(item.id);
                await this.onWorkItemConcluded(EventType.Task, item.id);
            }
        });
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

    private async reloadInterruptions(id: number): Promise<void> {
        await this.interruptionStore.loadSummaries();

        if (this.interruptionStore.editingItem?.id === id) {
            this.interruptionStore.startItemEdit(id, false);
        }
    }

    private async reloadTasks(id: number): Promise<void> {
        await this.taskStore.loadSummaries();

        if (this.taskStore.editingItem?.id === id) {
            this.taskStore.startItemEdit(id, false);
        }
    }

    private onEditingItemChange(callback: () => void): void {
        if (this.isEditingItemSaved) {
            callback();
        }
        else {
            const title = 'You have unsaved changes. Discard?';
            const data = new ConfirmationDialogOption(title, 'Discard', 'Wait NO', ButtonType.Warning);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { width: '25vw', preConfirm: callback });
            this.dialogStore.open(config);
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

    private onWorkItemResolve(item: InterruptionItem | TaskItem, callback: () => void): void {
        if (item.checklists.every(_ => _.isCompleted)) {
            callback();
        }
        else {
            const title = 'Checklist not completed yet. Mark item as resolved anyway?';
            const data = new ConfirmationDialogOption(title, 'Resolve', 'Wait NO', ButtonType.Warning);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { width: '40vw', preConfirm: callback });
            this.dialogStore.open(config);
        }
    }

    private onWorkItemDelete(item: InterruptionItem | TaskItem, callback: () => void): void {
        const title = 'The item will be permanently deleted. Proceed?';
        const data = new ConfirmationDialogOption(title, 'Delete', 'Wait NO', ButtonType.Warning, item);
        const config = new DialogConfig(markRaw(ConfirmationDialog), data, { preConfirm: callback });
        this.dialogStore.open(config);
    }

    private async onWorkItemConcluded(type: EventType, id: number): Promise<void> {
        if (this.eventStore.isActiveWorkItem(type, id)) {
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

    .work-item-list {
        position: absolute;
        top: 12.5%;
        width: calc(100% - #{$border-gap} * 2);
        height: 78%;
    }

    .content {
        $width: 60%;
        $actions-height: 5vh;

        @include flex-column(center, space-between);
        position: absolute;
        left: calc(50% - #{$width} / 2);
        top: $border-gap;
        width: $width;
        height: 87.5%;

        .actions-bar, .work-item-editor {
            width: 100%;
        }

        .actions-bar {
            @include flex-row(center);
            box-sizing: border-box;
            padding: 0 0.5vh;

            .work-item-creator {
                width: calc(#{$actions-height} * 0.8);
                height: calc(#{$actions-height} * 0.8);
                @include animate-property(opacity, 0, 1, 0.3s, 0.8s);
            }

            .search-box {
                margin-left: 1.25vh;
                width: 45%;
                height: $actions-height;
            }
        }

        .work-item-editor {
            height: calc(100% - 1.5vh - #{$actions-height});
        }
    }
}
</style>
