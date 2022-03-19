<template>
    <div class="show-case-panel-container">
        <category-summary-display v-for="(item, index) in items"
            class="item"
            :title="item.title"
            :icon="item.icon"
            :key="index">

            <span class="description">{{ item.description }}</span>
        </category-summary-display>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { ChartTimelineVariant, Flash, Heart } from 'mdue';

import { IconConfig } from '../../../core/models/generic/icon-config';
import CategorySummaryDisplay from '../../../shared/displays/category-summary-display/category-summary-display.vue';

@Options({
    components: {
        CategorySummaryDisplay
    }
})
export default class ShowCasePanel extends Vue {
    public readonly items = [
        {
            icon: new IconConfig(markRaw(Flash), 'var(--item-type-colors-interruption-0-00)'),
            title: 'Manage tasks and progress',
            description: 'choose the best workflow for you - pomodoro technique, old school to-do list or hybrid mode.'
        },
        {
            icon: new IconConfig(markRaw(ChartTimelineVariant), 'var(--context-colors-info-0-00)'),
            title: 'Track your time',
            description: 'always feeling short on time? gain more insights on how you are spending your time.'
        },
        {
            icon: new IconConfig(markRaw(Heart), 'var(--context-colors-warning-0-00)'),
            title: 'Build habits and healthy life style',
            description: 'Rome wasn\'t built in a day - good habits and work-life balance are essential to your long term goals!'
        }
    ];
}
</script>

<style lang="scss" scoped>
.show-case-panel-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, center);

    background: linear-gradient(
        115deg,
        var(--primary-colors-5-00) -10%,
        var(--primary-colors-10-00) 62.5%
    );

    .item {
        $icon-dimension: 9.5vh;
        $gap: 3.5vh;

        width: 67.5%;

        &:not(:last-of-type) {
            margin-bottom: 10%;
        }

        &::v-deep(.icon) {
            width: $icon-dimension;
            height: $icon-dimension;
            border-radius: 5px;
            box-shadow: none;
            font-size: var(--font-sizes-800);

            background: linear-gradient(
                45deg,
                var(--primary-colors-5-00) 0%,
                var(--primary-colors-5-00) 50%,
                var(--primary-colors-4-00) 50%,
                var(--primary-colors-4-00) 100%
            );
        }

        &::v-deep(.content) {
            margin-left: $gap;
            width: calc(100% - #{$gap} - #{$icon-dimension});
        }

        &::v-deep(.title) {
            font-size: var(--font-sizes-600);
        }

        .description {
            color: var(--font-colors-4-00);
        }
    }
}
</style>
