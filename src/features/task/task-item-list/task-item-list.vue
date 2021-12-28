<template>
    <div class="task-item-list-container">
        <div class="card-wrapper" v-for="(item, index) of items" :key="index">
            <task-item-card class="task-item-card"
                :style="{ 'animation-delay': `${0.08 + index * 0.025}s` }"
                :item="item">
            </task-item-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from '../../../store';
import { TaskItem } from '../../../core/models/task/task-item';

import TaskItemCard from './task-item-card/task-item-card.vue';

@Options({
    components: {
        TaskItemCard
    }
})
export default class TaskItemList extends Vue {
    get items(): TaskItem[] {
        return store.task.getters(store.task.getter.TaskItems);
    }
}
</script>

<style lang="scss" scoped>
.task-item-list-container {
    display: flex;
    flex-direction: column;

    .card-wrapper {
        margin-bottom: 2vh;
        padding: 0.5vh 0 0.5vh 1vh;
        overflow-x: hidden;
        animation: fade-in 0.3s ease forwards;
    }

    .task-item-card {
        margin-left: 100%;
        animation: move-to-left-by-margin 0.3s ease forwards;
    }
}
</style>
