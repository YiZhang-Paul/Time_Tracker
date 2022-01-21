<template>
    <div class="work-items-container">
        <search-box class="search-box" @search="searchText = $event"></search-box>
        <work-item-creator class="work-item-creator"></work-item-creator>

        <interruption-item-editor v-if="interruptionState.editingItem"
            class="interruption-item-editor"
            :item="interruptionState.editingItem"
            @create="onInterruptionCreate($event)"
            @update="onInterruptionUpdate($event)"
            @delete="onInterruptionDeleteStart($event)"
            @start="eventState.startInterruption($event.id)"
            @stop="eventState.startIdling()">
        </interruption-item-editor>

        <task-item-editor v-if="taskState.editingItem"
            class="task-item-editor"
            :item="taskState.editingItem"
            @create="onTaskCreate($event)"
            @update="onTaskUpdate($event)"
            @delete="onTaskDeleteStart($event)"
            @start="eventState.startTask($event.id)"
            @stop="eventState.startIdling()">
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
import { InterruptionStateService } from '../../core/services/states/interruption-state/interruption-state.service';
import { TaskStateService } from '../../core/services/states/task-state/task-state.service';
import { EventStateService } from '../../core/services/states/event-state/event-state.service';
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
        ...mapStores(useDialogStore)
    }
})
export default class WorkItems extends Vue {
    public searchText = '';
    public interruptionState = container.get<InterruptionStateService>(types.InterruptionStateService);
    public taskState = container.get<TaskStateService>(types.TaskStateService);
    public eventState = container.get<EventStateService>(types.EventStateService);
    private dialogStore!: ReturnType<typeof useDialogStore>;

    public async created(): Promise<void> {
        await Promise.all([
            this.eventState.loadOngoingEventSummary(),
            this.interruptionState.loadSummaries(),
            this.taskState.loadSummaries()
        ]);

        if (this.eventState.isWorking) {
            this.openActiveWorkItem();
        }
        else {
            this.openAvailableWorkItem();
        }
    }

    public onInterruptionSelect(item: InterruptionItemSummaryDto): void {
        if (this.interruptionState.editingItem?.id !== item.id) {
            this.taskState.stopItemEdit();
            this.interruptionState.startItemEdit(item.id);
        }
    }

    public async onInterruptionCreate(item: InterruptionItem): Promise<void> {
        if (await this.interruptionState.createItem(item)) {
            this.interruptionState.loadSummaries();
        }
    }

    public async onInterruptionUpdate(item: InterruptionItem): Promise<void> {
        if (await this.interruptionState.updateItem(item)) {
            this.interruptionState.loadSummaries();
        }
    }

    public onInterruptionDeleteStart(item: InterruptionItem): void {
        if (item.id === -1) {
            this.interruptionState.stopItemEdit();
        }
        else {
            const title = 'The item will be permanently deleted. Proceed?';
            const data = new ConfirmationDialogOption(title, 'Delete', 'Wait NO', ButtonType.Warning, item);
            const preConfirm = this.onInterruptionDelete.bind(this);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { preConfirm });
            this.dialogStore.open(config);
        }
    }

    public onTaskSelect(item: TaskItemSummaryDto): void {
        if (this.taskState.editingItem?.id !== item.id) {
            this.interruptionState.stopItemEdit();
            this.taskState.startItemEdit(item.id);
        }
    }

    public async onTaskCreate(item: TaskItem): Promise<void> {
        if (await this.taskState.createItem(item)) {
            this.taskState.loadSummaries();
        }
    }

    public async onTaskUpdate(item: TaskItem): Promise<void> {
        if (await this.taskState.updateItem(item)) {
            this.taskState.loadSummaries();
        }
    }

    public onTaskDeleteStart(item: TaskItem): void {
        if (item.id === -1) {
            this.taskState.stopItemEdit();
        }
        else {
            const title = 'The task will be permanently deleted. Proceed?';
            const data = new ConfirmationDialogOption(title, 'Delete', 'Wait NO', ButtonType.Warning, item);
            const preConfirm = this.onTaskDelete.bind(this);
            const config = new DialogConfig(markRaw(ConfirmationDialog), data, { preConfirm });
            this.dialogStore.open(config);
        }
    }

    private openActiveWorkItem(): void {
        if (this.interruptionState.activeSummary) {
            this.onInterruptionSelect(this.interruptionState.activeSummary);
        }
        else {
            this.onTaskSelect(this.taskState.activeSummary!);
        }
    }

    private openAvailableWorkItem(): void {
        const interruptions = this.interruptionState.searchSummaries(this.searchText);
        const tasks = this.taskState.searchSummaries(this.searchText);

        if (interruptions.length) {
            this.onInterruptionSelect(interruptions[0]);
        }
        else if (tasks.length) {
            this.onTaskSelect(tasks[0]);
        }
    }

    private async onInterruptionDelete(item: InterruptionItem): Promise<void> {
        if (!await this.interruptionState.deleteItem(item.id)) {
            return;
        }

        if (this.eventState.isActiveWorkItem(EventType.Interruption, item.id)) {
            await this.eventState.startIdling();
        }
    }

    private async onTaskDelete(item: TaskItem): Promise<void> {
        if (!await this.taskState.deleteItem(item.id)) {
            return;
        }

        if (this.eventState.isActiveWorkItem(EventType.Task, item.id)) {
            await this.eventState.startIdling();
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
