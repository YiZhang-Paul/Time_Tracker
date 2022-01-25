<template>
    <div class="interruption-item-card-container" :class="{ selected: isSelected, active: isActive }">
        <span class="name">{{ item.name }}</span>

        <div class="progress-indicator">
            <priority-indicator :priority="item.priority"></priority-indicator>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { InterruptionItemSummaryDto } from '../../../../../core/dtos/interruption-item-summary-dto';
import PriorityIndicator from '../../../../../shared/indicators/priority-indicator/priority-indicator.vue';

class InterruptionItemCardProp {
    public item = prop<InterruptionItemSummaryDto>({ default: null });
    public isSelected = prop<boolean>({ default: false });
    public isActive = prop<boolean>({ default: false });
}

@Options({
    components: {
        PriorityIndicator
    }
})
export default class InterruptionItemCard extends Vue.with(InterruptionItemCardProp) { }
</script>

<style lang="scss" scoped>
.interruption-item-card-container {
    @import '../../../../../styles/presets.scss';

    $height: 7.5vh;

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
            background-color: var(--item-type-colors-interruption-2-02);
        }
    }

    &.active {
        color: var(--context-colors-suggestion-0-00);
    }

    .name {
        margin-right: 1vh;
    }

    .progress-indicator {
        $margin: 0.75vh;

        @include flex-row(center, center);
        margin-right: $margin;
        width: calc(#{$height} - #{$margin} * 2);
        height: calc(#{$height} - #{$margin} * 2);
        border: 2px dashed var(--item-type-colors-interruption-1-00);
        border-radius: 50%;
        background-clip: padding-box;
        font-size: var(--font-sizes-600);
        transition: background-color 0.4s;
    }
}
</style>
