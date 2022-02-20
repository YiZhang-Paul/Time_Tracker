<template>
    <div class="view-selector-container">
        <router-link v-for="option in options"
            class="view-option"
            :to="{ name: option.route }"
            :key="option.route">

            <component class="icon" :is="option.icon"></component>
            <span>{{ option.name }}</span>
        </router-link>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { ViewSelectionOption } from '../../../core/models/options/view-selection-option';

class ViewSelectorProp {
    public options = prop<ViewSelectionOption[]>({ default: [] });
}

export default class ViewSelector extends Vue.with(ViewSelectorProp) { }
</script>

<style lang="scss" scoped>
.view-selector-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);

    .view-option {
        @include flex-column(center, center);
        width: 3.5rem;
        height: 3.5rem;
        color: var(--font-colors-0-00);
        text-decoration: none;
        transition: color 0.3s;

        &:hover {
            color: var(--context-colors-suggestion-0-00);
        }

        &.router-link-active {
            color: var(--context-colors-info-0-00);
        }

        &:not(:last-of-type) {
            margin-right: 0.25vh;
        }

        .icon {
            font-size: var(--font-sizes-700);
        }
    }
}
</style>
