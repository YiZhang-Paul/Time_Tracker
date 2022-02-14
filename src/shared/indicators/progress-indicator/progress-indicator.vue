<template>
    <div class="progress-indicator-container">
        <div class="progress-wrapper">
            <div class="progress" :style="progressStyles"></div>
        </div>

        <div class="content"><slot></slot></div>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { StyleConfigs } from '../../../core/models/generic/style-configs';

class ProgressIndicatorProp {
    public progress = prop<number>({ default: 0 });
}

export default class ProgressIndicator extends Vue.with(ProgressIndicatorProp) {
    get progressStyles(): StyleConfigs {
        return {
            height: `${this.progress}%`,
            opacity: Math.max(0.5, this.progress / 100 * 0.8)
        };
    }
}
</script>

<style lang="scss" scoped>
.progress-indicator-container {
    @import '../../../styles/presets.scss';

    position: relative;
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

    .content, .progress-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }

    .content {
        @include flex-row(center, center);
    }

    .progress-wrapper {
        overflow: hidden;

        .progress {
            position: absolute;
            bottom: 0;
            width: 100%;
            transition: height 0.5s, opacity 0.5s;
        }
    }
}
</style>
