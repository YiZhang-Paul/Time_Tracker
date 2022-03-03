<template>
    <div class="completion-indicator-container" :class="{ disabled: isDisabled }">
        <span v-if="description" class="description">{{ description }}</span>

        <div class="completion-base">
            <div class="completion" :style="completionStyle"></div>
            <span class="percentage">{{ completionText }}</span>

            <div v-if="completion > 105" class="marker" :style="{ left: `${100 / completion * 100}%` }">
                <div></div>
                <span>100%</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { StyleConfigs } from '../../../core/models/generic/style-configs';

class CompletionIndicatorProp {
    public description = prop<string>({ default: '' });
    public percentage = prop<number>({ default: 0 });
    public isDisabled = prop<boolean>({ default: false });
    public isHigherPreferred = prop<boolean>({ default: true });
}

@Options({
    watch: {
        percentage(): void {
            this.updateCompletion();
        }
    }
})
export default class CompletionIndicator extends Vue.with(CompletionIndicatorProp) {
    public completion = 0;
    private readonly types = ['warning', 'suggestion', 'success'];

    get completionStyle(): StyleConfigs {
        let type = this.types[2];
        const boxShadow = '2px 0 4px 1px rgba(0, 0, 0, 0.3)';

        if (this.completion < 75) {
            type = this.completion < 25 ? this.types[0] : this.types[1];
        }

        return {
            width: `${Math.min(this.completion, 100)}%`,
            'box-shadow': `${boxShadow}, 0 0 5px 1px var(--context-colors-${type}-0-04)`,
            'background-color': `var(--context-colors-${type}-0-00)`,
            opacity: this.completion ? 1 : 0
        };
    }

    get completionText(): string {
        return `${Math.round(this.completion * 10) / 10}%`;
    }

    public mounted(): void {
        if (!this.isHigherPreferred) {
            this.types.reverse();
        }

        this.updateCompletion();
    }

    private updateCompletion(): void {
        setTimeout(() => this.completion = Math.max(0, this.percentage) * 100);
    }
}
</script>

<style lang="scss" scoped>
.completion-indicator-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $font-size: var(--font-sizes-300);

    @include flex-column(flex-start, center);
    color: var(--font-colors-2-00);
    font-size: $font-size;

    &.disabled {
        color: var(--context-colors-disabled-0-00);

        .completion-base {
            background-color: var(--context-colors-disabled-1-00);
        }
    }

    .description {
        margin-bottom: 0.75vh;
    }

    .completion-base {
        $border-radius: 15px;

        @include flex-row(center);
        position: relative;
        width: 100%;
        height: calc(#{$font-size} * 0.7);
        border-radius: $border-radius;
        background-color: var(--primary-colors-1-00);

        .completion {
            min-width: 15px;
            height: 100%;
            border-radius: $border-radius;
            transition: width 0.8s 0.2s, background-color 0.3s 0.2s, box-shadow 0.3s 0.2s, opacity 0.3s;
        }

        .percentage {
            position: absolute;
            left: calc(100% + 1vh);
            @include animate-property(opacity, 0, 1, 0.5s, 0.5s);
        }
    }

    .marker {
        @include flex-column(center, center);
        position: absolute;
        top: 0;
        transition: left 0.3s 0.2s;
        @include animate-property(opacity, 0, 1, 0.3s, 0.5s);

        div {
            width: 1px;
            height: calc(#{$font-size} * 0.9);
            background-color: var(--primary-colors-1-00);
        }

        span {
            position: absolute;
            top: 100%;
            font-size: var(--font-sizes-100);
        }
    }
}
</style>
