<template>
    <button class="raised-button-container">
        <div class="content-wrapper">
            <slot></slot>
        </div>
    </button>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class RaisedButton extends Vue { }
</script>

<style lang="scss" scoped>
.raised-button-container {
    @import '../../../styles/animations.scss';

    padding: 0;
    border: none;
    outline: none;
    color: inherit;
    font-size: inherit;
    border-radius: 5px;

    @include raise(
        var(--primary-colors-10-00),
        var(--primary-colors-9-00),
        0 0 0 0 rgba(0, 0, 0, 0.35),
        0 0 6px 1px rgba(0, 0, 0, 0.35),
        0.3s,
        0.5s,
        none
    );

    &:hover {
        cursor: pointer;
    }

    .content-wrapper {
        box-sizing: border-box;
        padding: 0.75vh 1.75vh;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
        background-color: var(--primary-colors-9-00);
        transition: background-color 0.3s;
        @include animate-opacity(0, 1, 0.3s, 0.7s);
    }
}
</style>
