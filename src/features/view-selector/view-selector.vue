<template>
    <div class="view-selector-container">
        <div class="column">
            <div class="selector"></div>
        </div>

        <div class="column">
            <div class="selector placeholder"></div>
            <div class="selector histories"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class ViewSelector extends Vue { }
</script>

<style lang="scss" scoped>
.view-selector-container {
    @import '../../styles/presets.scss';

    $gap: 5vh;

    @include flex-row(flex-start, center);
    box-sizing: border-box;
    z-index: 999;
    padding-top: $gap;
    background-color: var(--primary-colors-10-00);

    .column {
        @include flex-column(center, space-between);
        width: 20%;
        height: 70%;

        &:not(:first-of-type) {
            margin-left: $gap;
        }

        .selector {
            width: 100%;
            height: 100%;
            background-color: orange;
        }

        .placeholder, .histories {
            height: calc(50% - #{$gap} / 2);
        }
    }
}
</style>
