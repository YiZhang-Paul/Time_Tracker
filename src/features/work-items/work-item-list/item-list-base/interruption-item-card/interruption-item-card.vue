<template>
    <div class="interruption-item-card-container" :class="{ selected: isSelected, active: isActive }">
        <span class="name">{{ item.name }}</span>

        <progress-indicator class="progress-indicator" :progress="progress">
            <template v-if="!isActive">
                <priority-indicator v-if="!isResolved"
                    class="indicator-content"
                    :priority="item.priority">
                </priority-indicator>

                <check-bold v-if="isResolved" class="resolved-icon indicator-content" />
            </template>

            <lightbulb-on v-if="isActive" class="active-icon indicator-content" />
        </progress-indicator>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { CheckBold, LightbulbOn } from 'mdue';

import { InterruptionItemSummaryDto } from '../../../../../core/dtos/interruption-item-summary-dto';
import PriorityIndicator from '../../../../../shared/indicators/priority-indicator/priority-indicator.vue';
import ProgressIndicator from '../../../../../shared/indicators/progress-indicator/progress-indicator.vue';

class InterruptionItemCardProp {
    public item = prop<InterruptionItemSummaryDto>({ default: null });
    public isSelected = prop<boolean>({ default: false });
    public isResolved = prop<boolean>({ default: false });
    public isActive = prop<boolean>({ default: false });
}

@Options({
    components: {
        CheckBold,
        LightbulbOn,
        PriorityIndicator,
        ProgressIndicator
    }
})
export default class InterruptionItemCard extends Vue.with(InterruptionItemCardProp) {
    get progress(): number {
        return this.isResolved ? 100 : this.item.progress * 100;
    }
}
</script>

<style lang="scss" scoped>
.interruption-item-card-container {
    @import '../../../../../styles/presets.scss';
    @import '../../../../../styles/animations.scss';

    $height: 7.5vh;
    $name-margin: 1vh;
    $indicator-margin: 0.75vh;
    $indicator-dimension: calc(#{$height} - #{$indicator-margin} * 2);

    @include flex-row(center, flex-end);
    box-sizing: border-box;
    width: 100%;
    height: $height;
    border-radius: 0 45px 45px 0;
    background: linear-gradient(270deg, var(--primary-colors-9-00) 0%, var(--primary-colors-10-00) 85%);
    box-shadow: 4px 0 6px 1px rgba(0, 0, 0, 0.3);
    color: var(--font-colors-0-00);

    &:hover, &.selected {
        cursor: pointer;
        background: linear-gradient(270deg, var(--primary-colors-7-00) 0%, var(--primary-colors-10-00) 85%);

        .progress-indicator {
            background-color: var(--item-type-colors-interruption-2-01);
        }
    }

    &.active {
        color: var(--context-colors-suggestion-0-00);
    }

    .name {
        @include line-clamp-vertical();
        margin-right: $name-margin;
        max-width: calc(92.5% - #{$name-margin} - #{$indicator-dimension} - #{$indicator-margin} * 2);
        transition: max-width 0.3s;
    }

    .progress-indicator {
        margin-right: $indicator-margin;
        width: $indicator-dimension;
        min-width: $indicator-dimension;
        height: $indicator-dimension;
        min-height: $indicator-dimension;
        border-color: var(--item-type-colors-interruption-0-00);
        font-size: var(--font-sizes-600);

        ::v-deep(.progress) {
            background-color: var(--item-type-colors-interruption-1-00);
        }

        .indicator-content {
            @include animate-property(opacity, 0, 1, 0.3s);
        }

        .resolved-icon {
            color: var(--context-colors-success-0-00);
        }

        .active-icon {
            color: var(--context-colors-suggestion-0-00);
        }
    }
}
</style>
