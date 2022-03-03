<template>
    <div class="tooltip-panel-container">
        <div class="tooltip-content" :class="tooltipClasses">{{ content }}</div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { ClassConfigs } from '../../../core/models/generic/class-configs';

class TooltipPanelProp {
    public content = prop<string>({ default: '' });
    public position = prop<'top' | 'bottom' | 'left' | 'right'>({ default: 'top' });
}

export default class TooltipPanel extends Vue.with(TooltipPanelProp) {
    get tooltipClasses(): ClassConfigs {
        return {
            [this.position]: true,
            visible: Boolean(this.content)
        };
    }
}
</script>

<style lang="scss" scoped>
.tooltip-panel-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    position: relative;

    &:hover .tooltip-content.visible {
        display: block;
    }

    .tooltip-content {
        $gap: 0.75vh;

        z-index: 999;
        display: none;
        position: absolute;
        padding: 0.5vh 1vh;
        max-width: 25vw;
        border-radius: 4px;
        background-color: var(--context-colors-info-4-00);
        color: var(--font-colors-0-00);
        font-size: var(--font-sizes-300);
        @include line-overflow();
        @include animate-property(opacity, 0, 1, 0.4s, 0.1s);

        &.top {
            bottom: calc(100% + #{$gap});
        }

        &.bottom {
            top: calc(100% + #{$gap});
        }

        &.left {
            right: calc(100% + #{$gap});
        }

        &.right {
            left: calc(100% + #{$gap});
        }
    }
}
</style>
