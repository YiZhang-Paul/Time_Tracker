<template>
    <div class="task-item-list-container">
        <span v-if="totalUnresolved || totalResolved" class="list-counter">
            <span>{{ totalUnresolved }} unresolved</span>
            <span> / </span>
            <span>{{ totalResolved }} resolved</span>
        </span>

        <div class="card-wrapper" v-if="taskStore.activeSummary">
            <task-item-card class="task-item-card"
                :class="getItemCardClasses(taskStore.activeSummary)"
                :item="taskStore.activeSummary"
                :isSelected="selectedItemId === taskStore.activeSummary.id"
                :isActive="true"
                @click="$emit('select', taskStore.activeSummary)">
            </task-item-card>
        </div>

        <overlay-scrollbar-panel class="card-wrappers">
            <div class="card-wrapper" v-for="(item, index) of items" :key="index">
                <task-item-card class="task-item-card"
                    :class="getItemCardClasses(item)"
                    :item="item"
                    :isSelected="selectedItemId === item.id"
                    :isResolved="!showUnresolved"
                    :isActive="isActive(item)"
                    @click="$emit('select', item)">
                </task-item-card>
            </div>
        </overlay-scrollbar-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useEventStore } from '../../../../stores/event/event.store';
import { useTaskStore } from '../../../../stores/task/task.store';
import { ItemSummariesDto } from '../../../../core/dtos/item-summaries-dto';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { ClassConfigs } from '../../../../core/models/generic/class-configs';
import { EventType } from '../../../../core/enums/event-type.enum';
import OverlayScrollbarPanel from '../../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import TaskItemCard from './task-item-card/task-item-card.vue';

class TaskItemListProp {
    public searchText = prop<string>({ default: '' });
}

@Options({
    components: {
        OverlayScrollbarPanel,
        TaskItemCard
    },
    watch: {
        items(): void {
            setTimeout(() => this.animateItemCards());
        }
    },
    emits: [
        'select'
    ],
    computed: {
        ...mapStores(useEventStore, useTaskStore)
    }
})
/* istanbul ignore next */
export default class TaskItemList extends Vue.with(TaskItemListProp) {
    public showUnresolved = true;
    private eventStore!: ReturnType<typeof useEventStore>;
    private taskStore!: ReturnType<typeof useTaskStore>;
    private animated = new Set<number>();

    get totalUnresolved(): number {
        return this.filteredSummaries.unresolved.length;
    }

    get totalResolved(): number {
        return this.filteredSummaries.resolved.length;
    }

    get items(): TaskItemSummaryDto[] {
        if (!this.showUnresolved) {
            return this.filteredSummaries.resolved;
        }

        const { unresolved } = this.filteredSummaries;
        const active = this.taskStore.activeSummary;

        return active ? unresolved.filter(_ => _.id !== active.id) : unresolved;
    }

    get filteredSummaries(): ItemSummariesDto<TaskItemSummaryDto> {
        return this.taskStore.filteredSummaries(this.searchText);
    }

    get selectedItemId(): number {
        return this.taskStore.editingItem?.id ?? -1;
    }

    public mounted(): void {
        this.animateItemCards();
    }

    public getItemCardClasses(item: TaskItemSummaryDto): ClassConfigs {
        return {
            animated: this.animated.has(item.id),
            selected: this.selectedItemId === item.id
        };
    }

    public isActive(item: TaskItemSummaryDto): boolean {
        return this.eventStore.isActiveWorkItem(EventType.Task, item.id);
    }

    private animateItemCards(): void {
        let total = 0;

        if (this.taskStore.activeSummary) {
            const { id } = this.taskStore.activeSummary;
            this.animated.delete(id);
            setTimeout(() => this.animated.add(id));
        }

        for (const { id } of this.items) {
            if (!this.animated.has(id)) {
                setTimeout(() => this.animated.add(id), 200 + total++ * 25);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.task-item-list-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(flex-end);

    .list-counter {
        margin-bottom: 0.25rem;
        color: var(--font-colors-4-00);

        & > span:first-of-type {
            color: var(--context-colors-suggestion-0-00);
        }

        & > span:last-of-type {
            color: var(--context-colors-success-0-00);
        }
    }

    .card-wrappers {
        @include flex-column();
        width: 100%;
        height: 100%;
    }

    .card-wrapper {
        box-sizing: border-box;
        margin-bottom: 1rem;
        padding: 0.5vh 0 0.5vh 1vh;
        width: 100%;
        min-height: 5.25rem;
        overflow-x: hidden;
        scroll-snap-align: start;

        .task-item-card {
            margin-left: 110%;
            transition: margin-left 0.3s, color 0.3s;
            @include animate-opacity(0, 1, 0.3s);

            &.animated {
                margin-left: 17.5%;
            }

            &.animated.selected {
                margin-left: 0;
            }
        }
    }
}
</style>
