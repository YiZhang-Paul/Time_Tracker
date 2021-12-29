<template>
    <div class="task-item-list-container">
        <div class="card-wrapper" v-for="(item, index) of items" :key="index">
            <task-item-card class="task-item-card"
                :style="{ 'animation-delay': `${0.08 + index * 0.025}s` }"
                :item="item"
                @click="$emit('select', item)">
            </task-item-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from '../../../store';
import { TaskItemSummaryDto } from '../../../core/dtos/task-item-summary-dto';

import TaskItemCard from './task-item-card/task-item-card.vue';

@Options({
    components: {
        TaskItemCard
    },
    emits: [
        'select'
    ]
})
export default class TaskItemList extends Vue {
    get items(): TaskItemSummaryDto[] {
        return store.task.getters(store.task.getter.Items);
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
        @include animate-margin(left, 100%, 0, 0.3s);
    }
}
</style>
