<template>
    <div class="task-item-card-container" :class="{ selected: isSelected, active: isActive }">
        <div class="progress-indicator">
            <span>{{ item.effort }}</span>
        </div>

        <span class="name">{{ item.name }}</span>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { TaskItemSummaryDto } from '../../../../../core/dtos/task-item-summary-dto';

class TaskItemCardProp {
    public item = prop<TaskItemSummaryDto>({ default: null });
    public isSelected = prop<boolean>({ default: false });
    public isActive = prop<boolean>({ default: false });
}

export default class TaskItemCard extends Vue.with(TaskItemCardProp) { }
</script>

<style lang="scss" scoped>
.task-item-card-container {
    @import '../../../../../styles/presets.scss';

    $height: 7.5vh;
    $name-margin: 1vh;
    $indicator-margin: 0.75vh;
    $indicator-dimension: calc(#{$height} - #{$indicator-margin} * 2);

    @include flex-row(center);
    box-sizing: border-box;
    width: 100%;
    height: $height;
    border-radius: 45px 0 0 45px;
    background: linear-gradient(90deg, var(--primary-colors-9-00) 0%, var(--primary-colors-10-00) 85%);
    box-shadow: -4px 0 6px 1px rgba(0, 0, 0, 0.3);
    color: var(--font-colors-0-00);

    &:hover, &.selected {
        cursor: pointer;
        background: linear-gradient(90deg, var(--primary-colors-7-00) 0%, var(--primary-colors-10-00) 85%);

        .progress-indicator {
            background-color: var(--item-type-colors-task-2-02);
        }
    }

    &.active {
        color: var(--context-colors-suggestion-0-00);
        text-shadow: 0 0 3px var(--context-colors-suggestion-0-00);
    }

    &.selected .name {
        max-width: calc(97.5% - #{$name-margin} - #{$indicator-dimension} - #{$indicator-margin} * 2);
    }

    .progress-indicator {
        @include flex-row(center, center);
        margin-left: $indicator-margin;
        width: $indicator-dimension;
        min-width: $indicator-dimension;
        height: $indicator-dimension;
        min-height: $indicator-dimension;
        border: 2px dashed var(--item-type-colors-task-1-00);
        border-radius: 50%;
        background-clip: padding-box;
        font-size: var(--font-sizes-500);
        transition: background-color 0.4s;
    }

    .name {
        @include line-clamp-vertical();
        margin-left: $name-margin;
        max-width: calc(80% - #{$name-margin} - #{$indicator-dimension} - #{$indicator-margin} * 2);
        transition: max-width 0.3s;
    }
}
</style>
