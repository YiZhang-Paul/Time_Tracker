<template>
    <div class="task-item-card-container" :class="{ selected: isSelected, active: isActive }">
        <progress-indicator class="progress-indicator" :progress="progress">
            <span v-if="!isResolved">{{ item.effort }}</span>
            <check-bold v-if="isResolved" class="resolved-icon" />
        </progress-indicator>

        <span class="name">{{ item.name }}</span>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { CheckBold } from 'mdue';

import { TaskItemSummaryDto } from '../../../../../core/dtos/task-item-summary-dto';
import ProgressIndicator from '../../../../../shared/indicators/progress-indicator/progress-indicator.vue';

class TaskItemCardProp {
    public item = prop<TaskItemSummaryDto>({ default: null });
    public isSelected = prop<boolean>({ default: false });
    public isResolved = prop<boolean>({ default: false });
    public isActive = prop<boolean>({ default: false });
}

@Options({
    components: {
        CheckBold,
        ProgressIndicator
    }
})
export default class TaskItemCard extends Vue.with(TaskItemCardProp) {
    get progress(): number {
        return this.isResolved ? 100 : this.item.progress * 100;
    }
}
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
            background-color: var(--item-type-colors-task-2-01);
        }
    }

    &.active {
        color: var(--context-colors-suggestion-0-00);
    }

    &.selected .name {
        max-width: calc(92.5% - #{$name-margin} - #{$indicator-dimension} - #{$indicator-margin} * 2);
    }

    .progress-indicator {
        margin-left: $indicator-margin;
        width: $indicator-dimension;
        min-width: $indicator-dimension;
        height: $indicator-dimension;
        min-height: $indicator-dimension;
        border-color: var(--item-type-colors-task-0-00);

        ::v-deep(.progress) {
            background-color: var(--item-type-colors-task-1-00);
        }

        .resolved-icon {
            color: var(--context-colors-success-0-00);
            font-size: var(--font-sizes-600);
        }
    }

    .name {
        @include line-clamp-vertical();
        margin-left: $name-margin;
        max-width: calc(80% - #{$name-margin} - #{$indicator-dimension} - #{$indicator-margin} * 2);
        transition: max-width 0.3s;
    }
}
</style>
