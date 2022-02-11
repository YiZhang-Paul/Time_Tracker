<template>
    <button class="expand-icon-button-container" :class="{ active: isActive }">
        <slot></slot>
        <span>{{ text }}</span>
    </button>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

class ExpandIconButtonProp {
    public text = prop<string>({ default: '' });
    public isActive = prop<boolean>({ default: false });
}

export default class ExpandIconButton extends Vue.with(ExpandIconButtonProp) { }
</script>

<style lang="scss" scoped>
.expand-icon-button-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-row(center, center);
    min-width: 3vh;
    height: 3vh;
    border: none;
    outline: none;
    border-radius: 1.5vh;
    background-color: var(--primary-colors-5-00);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);
    transition: all 0.3s;

    &:hover {
        cursor: pointer;
    }

    &.active {
        padding-right: 1.15vh;

        span {
            display: inline-block;
            margin-left: 0.35vh;
        }
    }

    span {
        display: none;
        font-size: var(--font-sizes-200);
        @include animate-opacity(0, 1, 0.2s, 0.1s);
    }
}
</style>
