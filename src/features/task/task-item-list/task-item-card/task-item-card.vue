<template>
    <div class="task-item-card-container">
        <div class="progress-indicator">
            <span>{{ item.id }}</span>
        </div>

        <span class="name">{{ item.name }}</span>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { TaskItem } from '../../../../core/models/task/task-item';

class TaskItemCardProp {
    public item = prop<TaskItem>({ default: null });
}

export default class TaskItemCard extends Vue.with(TaskItemCardProp) { }
</script>

<style lang="scss" scoped>
.task-item-card-container {
    $height: 7.5vh;

    box-sizing: border-box;
    display: flex;
    align-items: center;
    width: 100%;
    height: $height;
    border-radius: 45px 0 0 45px;
    background: linear-gradient(90deg, var(--primary-colors-9-00) 0%, var(--primary-colors-10-00) 85%);
    box-shadow: -4px 0 6px 1px rgba(0, 0, 0, 0.3);
    color: var(--font-colors-0-00);

    .progress-indicator {
        $margin: 0.75vh;

        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: $margin;
        width: calc(#{$height} - #{$margin} * 2);
        height: calc(#{$height} - #{$margin} * 2);
        border: 2px dashed #17878D;
        border-radius: 50%;
        font-size: var(--font-sizes-500);
    }

    .name {
        margin-left: 1vh;
    }
}
</style>
