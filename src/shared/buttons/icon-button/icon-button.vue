<template>
    <button class="icon-button-container"><slot></slot></button>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class IconButton extends Vue { }
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
}
</style>
