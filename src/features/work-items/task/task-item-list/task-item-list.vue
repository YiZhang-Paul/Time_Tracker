<template>
    <div class="task-item-list-container">
        <span v-if="items.length" class="list-counter">{{ totalItems }}</span>

        <div class="card-wrapper" v-for="(item, index) of items" :key="index">
            <task-item-card class="task-item-card"
                :class="getItemCardClasses(item)"
                :item="item"
                :isSelected="selectedItemId === item.id"
                :isActive="isActive(item)"
                @click="$emit('select', item)">
            </task-item-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useEventStore } from '../../../../stores/event/event.store';
import { useTaskStore } from '../../../../stores/task/task.store';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { ClassConfigs } from '../../../../core/models/generic/class-configs';
import { EventType } from '../../../../core/enums/event-type.enum';

import TaskItemCard from './task-item-card/task-item-card.vue';

class TaskItemListProp {
    public searchText = prop<string>({ default: '' });
}

@Options({
    components: {
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
    private eventStore!: ReturnType<typeof useEventStore>;
    private taskStore!: ReturnType<typeof useTaskStore>;
    private animated = new Set<number>();

    get totalItems(): string {
        return `${this.items.length} task${this.items.length > 1 ? 's' : ''}`;
    }

    get items(): TaskItemSummaryDto[] {
        const text = this.searchText?.toLowerCase().trim() ?? '';
        const items = this.taskStore.filteredSummaries(text);
        const active = this.taskStore.activeSummary;

        if (!active) {
            return items;
        }

        return [active, ...items.filter(_ => _.id !== active.id)];
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
        color: var(--font-colors-4-00);
    }

    .card-wrapper {
        box-sizing: border-box;
        margin-bottom: 2vh;
        padding: 0.5vh 0 0.5vh 1vh;
        width: 100%;
        overflow-x: hidden;
        @include animate-opacity(0, 1, 0.3s);
    }

    .task-item-card {
        margin-left: 110%;
        transition: margin-left 0.3s, color 0.3s;

        &.animated {
            margin-left: 17.5%;
        }

        &.animated.selected {
            margin-left: 0;
        }
    }
}
</style>
