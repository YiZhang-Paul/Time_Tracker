<template>
    <div class="task-item-card-container" :class="{ active: isActive }">
        <div class="progress-indicator">
            <span>{{ item.effort }}</span>
        </div>

        <span class="name">{{ item.name }}</span>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';

class TaskItemCardProp {
    public item = prop<TaskItemSummaryDto>({ default: null });
    public isActive = prop<boolean>({ default: false });
}

export default class TaskItemCard extends Vue.with(TaskItemCardProp) { }
</script>

<style lang="scss" scoped>
.task-item-card-container {
    @import '../../../../styles/presets.scss';

    $height: 7.5vh;

    @include flex-row(center);
    box-sizing: border-box;
    width: 100%;
    height: $height;
    border-radius: 45px 0 0 45px;
    background: linear-gradient(90deg, var(--primary-colors-9-00) 0%, var(--primary-colors-10-00) 85%);
    box-shadow: -4px 0 6px 1px rgba(0, 0, 0, 0.3);
    color: var(--font-colors-0-00);

    &:hover, &.active {
        cursor: pointer;
        background: linear-gradient(90deg, var(--primary-colors-7-00) 0%, var(--primary-colors-10-00) 85%);

        .progress-indicator {
            background-color: var(--secondary-colors-2-02);
        }
    }

    .progress-indicator {
        $margin: 0.75vh;

        @include flex-row(center, center);
        margin-left: $margin;
        width: calc(#{$height} - #{$margin} * 2);
        height: calc(#{$height} - #{$margin} * 2);
        border: 2px dashed #17878D;
        border-radius: 50%;
        background-clip: padding-box;
        font-size: var(--font-sizes-500);
        transition: background-color 0.4s;
    }

    .name {
        margin-left: 1vh;
    }
}
</style>
