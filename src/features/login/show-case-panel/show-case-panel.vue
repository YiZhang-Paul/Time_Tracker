<template>
    <div class="show-case-panel-container">
        <div v-for="(item, index) in items" class="item" :key="index">
            <div class="icon">
                <component :is="item.icon.component" :style="{ color: item.icon.color }"></component>
            </div>

            <div class="content">
                <span class="title">{{ item.title }}</span>
                <span class="description">{{ item.description }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Vue } from 'vue-class-component';
import { ChartTimelineVariant, Flash, Heart } from 'mdue';

import { IconConfig } from '../../../core/models/generic/icon-config';

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
    @import '../../../styles/animations.scss';

    @include flex-column(center, center);

    background: linear-gradient(
        115deg,
        var(--primary-colors-5-00) -10%,
        var(--primary-colors-10-00) 62.5%
    );

    .item {
        $icon-dimension: 9.5vh;
        $gap: 3.5vh;

        @include flex-row(center);
        width: 67.5%;

        &:not(:last-of-type) {
            margin-bottom: 10%;
        }

        .icon {
            @include flex-row(center, center);
            position: relative;
            width: $icon-dimension;
            height: $icon-dimension;
            border-radius: 5px;
            overflow: hidden;
            font-size: var(--font-sizes-850);
            @include animate-property(opacity, 0, 1, 0.3s, 0.5s);

            &::before {
                content: '';
                background-color: var(--primary-colors-1-08);
                @include gloss-effect(45%, 200%, 6s);
            }

            &::after {
                content: '';
                background-color: var(--primary-colors-1-08);
                @include gloss-effect(7.5%, 200%, 6s, 55%);
            }

            background: linear-gradient(
                45deg,
                var(--primary-colors-5-00) 0%,
                var(--primary-colors-5-00) 50%,
                var(--primary-colors-4-00) 50%,
                var(--primary-colors-4-00) 100%
            );
        }

        .content {
            @include flex-column(flex-start, space-between);
            margin-left: $gap;
            width: calc(100% - #{$gap} - #{$icon-dimension});
            font-size: var(--font-sizes-450);

            .title {
                margin-bottom: 8px;
                overflow: hidden;
                @include line-overflow(clip);
                color: var(--font-colors-0-00);
                font-size: var(--font-sizes-600);
                @include animate-property(width, 0, 100%, 0.8s, 0.8s);
            }

            .description {
                color: var(--font-colors-4-00);
                @include animate-property(opacity, 0, 1, 0.3s, 1.5s);
            }
        }
    }
}
</style>
