<template>
    <div class="task-item-list-container">
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

import { createStore } from '../../../../store';
import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { ClassConfigs } from '../../../../core/models/generic/class-configs';
import { EventType } from '../../../../core/enums/event-type.enum';

import TaskItemCard from './task-item-card/task-item-card.vue';

const store = container.get<ReturnType<typeof createStore>>(types.Store);

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
    ]
})
export default class TaskItemList extends Vue.with(TaskItemListProp) {
    private animated = new Set<number>();

    get items(): TaskItemSummaryDto[] {
        const text = this.searchText?.toLowerCase()?.trim() ?? '';
        const items = store.task.getters(store.task.getter.Summaries)(text);
        const active = store.task.getters(store.task.getter.ActiveSummary);

        if (!active) {
            return items;
        }

        return [active, ...items.filter(_ => _.id !== active.id)];
    }

    get selectedItemId(): number {
        return store.task.getters(store.task.getter.EditingItem)?.id ?? -1;
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
        const key = store.event.getter.IsActiveWorkItem;

        return store.event.getters(key)(EventType.Task, item.id);
    }

    private animateItemCards(): void {
        const elements = document.querySelectorAll('.task-item-card');

        for (let i = 0, j = 0; i < elements.length; ++i) {
            const { id } = this.items[i];

            if (!this.animated.has(id)) {
                setTimeout(() => this.animated.add(id), 200 + j++ * 25);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.task-item-list-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column();

    .card-wrapper {
        margin-bottom: 2vh;
        padding: 0.5vh 0 0.5vh 1vh;
        overflow-x: hidden;
        @include animate-opacity(0, 1, 0.3s);
    }

    .task-item-card {
        margin-left: 110%;
        transition: margin-left 0.3s, color 0.3s;

        &.animated {
            margin-left: 20%;
        }

        &.animated.selected {
            margin-left: 0;
        }
    }
}
</style>
