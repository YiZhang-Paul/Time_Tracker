<template>
    <div v-if="icon" class="category-summary-display-container">
        <div class="icon">
            <component :is="icon.component" :style="{ color: icon.color }"></component>
        </div>

        <div class="content">
            <span class="title">{{ title }}</span>
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../core/models/generic/icon-config';

class CategorySummaryDisplayProp {
    public title = prop<string>({ default: '' });
    public icon = prop<IconConfig>({ default: null });
}

export default class CategorySummaryDisplay extends Vue.with(CategorySummaryDisplayProp) { }
</script>

<style lang="scss" scoped>
.category-summary-display-container {
    @import '../../../styles/presets.scss';

    $icon-dimension: 5.75vh;
    $gap: 1.5vh;

    @include flex-row(center);

    .icon {
        @include flex-row(center, center);
        width: $icon-dimension;
        height: $icon-dimension;
        border-radius: 10px;
        box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.35);
        background-color: var(--context-colors-info-8-00);
        font-size: var(--font-sizes-700);
    }

    .content {
        @include flex-column(flex-start, space-between);
        margin-left: $gap;
        width: calc(100% - #{$gap} - #{$icon-dimension});
        font-size: var(--font-sizes-450);

        .title {
            margin-bottom: 4px;
            color: var(--font-colors-0-00);
        }
    }
}
</style>
