<template>
    <tooltip-panel class="icon-button-container"
        :class="{ disabled: isDisabled }"
        :content="tooltip"
        :position="tooltipPosition">

        <slot></slot>
    </tooltip-panel>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import TooltipPanel from '../../panels/tooltip-panel/tooltip-panel.vue';

class IconButtonProp {
    public tooltip = prop<string>({ default: '' });
    public tooltipPosition = prop<'top' | 'bottom' | 'left' | 'right'>({ default: 'top' });
    public isDisabled = prop<boolean>({ default: false });
}

@Options({
    components: {
        TooltipPanel
    }
})
export default class IconButton extends Vue.with(IconButtonProp) { }
</script>

<style lang="scss" scoped>
.icon-button-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);
    width: 3vh;
    height: 3vh;
    border: none;
    outline: none;
    border-radius: 50%;
    background-color: var(--primary-colors-5-00);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-400);

    &:hover {
        cursor: pointer;
    }

    &.disabled {
        pointer-events: none;
        background-color: var(--context-colors-disabled-1-00);
        color: var(--font-colors-5-00);
    }
}
</style>
