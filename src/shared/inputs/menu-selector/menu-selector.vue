<template>
    <div class="menu-selector-container">
        <router-link v-for="option in options"
            class="menu-option"
            :to="{ name: option.route }"
            :key="option.route">

            <component class="icon" :is="option.icon"></component>
            <span>{{ option.name }}</span>
        </router-link>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { MenuSelectionOption } from '../../../core/models/options/menu-selection-option';

class MenuSelectorProp {
    public options = prop<MenuSelectionOption[]>({ default: [] });
}

export default class MenuSelector extends Vue.with(MenuSelectorProp) { }
</script>

<style lang="scss" scoped>
.menu-selector-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);

    .menu-option {
        @include flex-column(center, center);
        width: 5rem;
        height: 5rem;
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
            font-size: var(--font-sizes-800);
        }
    }
}
</style>
