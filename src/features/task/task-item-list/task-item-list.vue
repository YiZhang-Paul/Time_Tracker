<template>
    <div class="task-item-list-container">
        <div class="card-wrapper" v-for="(item, index) of items" :key="index">
            <task-item-card class="task-item-card"
                :class="getItemCardClasses(item)"
                :item="item"
                :isActive="activeId === item.id"
                @click="$emit('select', item)">
            </task-item-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from '../../../store';
import { TaskItemSummaryDto } from '../../../core/dtos/task-item-summary-dto';
import { ClassConfigs } from '../../../core/models/generic/class-configs';

import TaskItemCard from './task-item-card/task-item-card.vue';

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
export default class TaskItemList extends Vue {
    private animated = new Set<number>();

    get items(): TaskItemSummaryDto[] {
        return store.task.getters(store.task.getter.Items);
    }

    get activeId(): number {
        return store.task.getters(store.task.getter.EditingItem)?.id ?? -1;
    }

    public mounted(): void {
        this.animateItemCards();
    }

    public getItemCardClasses(item: TaskItemSummaryDto): ClassConfigs {
        return {
            animated: this.animated.has(item.id),
            active: this.activeId === item.id
        };
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
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column();

    .card-wrapper {
        margin-bottom: 2vh;
        padding: 0.5vh 0 0.5vh 1vh;
        overflow-x: hidden;
        @include animate-opacity(0, 1, 0.3s);
    }

    .task-item-card {
        margin-left: 110%;
        transition: margin-left 0.3s;

        &.animated {
            margin-left: 20%;
        }

        &.animated.active {
            margin-left: 0;
        }
    }
}
</style>
