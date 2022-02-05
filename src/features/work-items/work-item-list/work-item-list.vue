<template>
    <div class="work-item-list-container">
        <item-list-base class="interruption-item-list"
            :summaries="interruptionItemSummaries"
            :activeSummary="interruptionStore.activeSummary"
            :selectedId="selectedInterruptionItemId"
            :type="eventType.Interruption"
            :isRightToLeft="true"
            @select="$emit('select:interruption', $event)">
        </item-list-base>

        <item-list-base class="task-item-list"
            :summaries="taskItemSummaries"
            :activeSummary="taskStore.activeSummary"
            :selectedId="selectedTaskItemId"
            :type="eventType.Task"
            @select="$emit('select:task', $event)">
        </item-list-base>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { ItemSummariesDto } from '../../../core/dtos/item-summaries-dto';
import { InterruptionItemSummaryDto } from '../../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../../core/dtos/task-item-summary-dto';
import { EventType } from '../../../core/enums/event-type.enum';

import ItemListBase from './item-list-base/item-list-base.vue';

class WorkItemListProp {
    public searchText = prop<string>({ default: '' });
}

@Options({
    components: {
        ItemListBase
    },
    emits: [
        'select:interruption',
        'select:task'
    ],
    computed: {
        ...mapStores(useInterruptionStore, useTaskStore)
    }
})
export default class WorkItemList extends Vue.with(WorkItemListProp) {
    public readonly eventType = EventType;
    public interruptionStore!: ReturnType<typeof useInterruptionStore>;
    public taskStore!: ReturnType<typeof useTaskStore>;

    get interruptionItemSummaries(): ItemSummariesDto<InterruptionItemSummaryDto> {
        return this.interruptionStore.filteredSummaries(this.searchText);
    }

    get taskItemSummaries(): ItemSummariesDto<TaskItemSummaryDto> {
        return this.taskStore.filteredSummaries(this.searchText);
    }

    get selectedInterruptionItemId(): number {
        return this.interruptionStore.editingItem?.id ?? -1;
    }

    get selectedTaskItemId(): number {
        return this.taskStore.editingItem?.id ?? -1;
    }
}
</script>

<style lang="scss" scoped>
.work-item-list-container {
    position: relative;

    .interruption-item-list, .task-item-list {
        position: absolute;
        top: 0;
        width: 20%;
        height: 100%;
    }

    .interruption-item-list {
        left: 0;
    }

    .task-item-list {
        right: 0;
    }
}
</style>
