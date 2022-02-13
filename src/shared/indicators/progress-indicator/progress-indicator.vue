<template>
    <div class="progress-indicator-container"><slot></slot></div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

class ProgressIndicatorProp {
    public progress = prop<number>({ default: 0 });
}

export default class ProgressIndicator extends Vue.with(ProgressIndicatorProp) {

}
</script>

<style lang="scss" scoped>
.progress-indicator-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);
    width: 5vh;
    min-width: 5vh;
    height: 5vh;
    min-height: 5vh;
    border: 2px dashed;
    border-radius: 50%;
    background-clip: padding-box;
    color: var(--font-colors-2-00);
    font-size: var(--font-sizes-500);
    transition: background-color 0.4s;
}
</style>
