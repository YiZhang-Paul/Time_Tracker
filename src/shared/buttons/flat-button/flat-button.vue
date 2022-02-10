<template>
    <button class="flat-button-container" :class="{ disabled: isDisabled }"><slot></slot></button>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

class FlatButtonProp {
    public isDisabled = prop<boolean>({ default: false });
}

export default class FlatButton extends Vue.with(FlatButtonProp) { }
</script>

<style lang="scss" scoped>
.flat-button-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);
    box-sizing: border-box;
    padding: 0.75vh 2vh;
    min-width: 3vw;
    min-height: 3vh;
    border: none;
    outline: none;
    border-radius: 5px;
    background-color: var(--primary-colors-5-00);
    color: inherit;
    font-size: inherit;

    &:hover {
        cursor: pointer;
    }

    &.disabled {
        pointer-events: none;
        background-color: var(--context-colors-disabled-1-00);
        box-shadow: none;
        color: var(--font-colors-5-00);
    }
}
</style>
