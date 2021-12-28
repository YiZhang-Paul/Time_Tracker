<template>
    <div class="task-item-list-container">
        <task-item-card class="task-item-card"
            v-for="item of items"
            :key="item.id"
            :item="item">
        </task-item-card>
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

    .task-item-card {
        margin-bottom: 2vh;
    }
}
</style>
