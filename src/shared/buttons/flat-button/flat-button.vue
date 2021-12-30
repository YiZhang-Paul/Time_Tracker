<template>
    <button class="flat-button-container">
        <div class="content-wrapper">
            <slot></slot>
        </div>
    </button>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class FlatButton extends Vue { }
</script>

<style lang="scss" scoped>
.flat-button-container {
    @import '../../../styles/animations.scss';

    $border-radius: 5px;

    padding: 0;
    border: none;
    outline: none;
    color: inherit;
    font-size: inherit;
    border-radius: $border-radius;
    background-color: transparent;

    &:hover {
        cursor: pointer;
    }

    .content-wrapper {
        box-sizing: border-box;
        padding: 0.75vh 1.75vh;
        width: 100%;
        height: 100%;
        border-radius: $border-radius;
        transition: color 0.3s;
        @include animate-opacity(0, 1, 0.3s, 0.6s);
    }
}
</style>
