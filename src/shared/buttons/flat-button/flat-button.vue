<template>
    <button class="flat-button-container"><slot></slot></button>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class FlatButton extends Vue { }
</script>

<style lang="scss" scoped>
.flat-button-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);
    box-sizing: border-box;
    padding: 0.75vh 2vh;
    min-width: 3vw;
    height: 3vh;
    border: none;
    outline: none;
    border-radius: 5px;
    background-color: var(--primary-colors-5-00);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-200);

    &:hover {
        cursor: pointer;
    }
}
</style>
