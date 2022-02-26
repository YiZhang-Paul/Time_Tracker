<template>
    <div class="completion-indicator-container">
        <span v-if="description" class="description">{{ description }}</span>

        <div class="completion-base">
            <div class="completion" :style="completionStyle"></div>
            <span>{{ completionText }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { StyleConfigs } from '../../../core/models/generic/style-configs';

class CompletionIndicatorProp {
    public description = prop<string>({ default: '' });
    public percentage = prop<number>({ default: 0 });
}

@Options({
    watch: {
        percentage(): void {
            this.updateCompletion();
        }
    }
})
export default class CompletionIndicator extends Vue.with(CompletionIndicatorProp) {
    private completion = 0;

    get completionStyle(): StyleConfigs {
        let type = 'success';
        const boxShadow = '1px 0 4px 1px rgba(0, 0, 0, 0.3)';

        if (this.completion < 75) {
            type = this.completion < 25 ? 'warning' : 'suggestion';
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

    $font-size: var(--font-sizes-400);

    @include flex-column(flex-start, center);
    color: var(--font-colors-2-00);
    font-size: $font-size;

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
        background-color: var(--primary-colors-2-00);

        .completion {
            min-width: 15px;
            height: 100%;
            border-radius: $border-radius;
            transition: width 0.7s 0.3s, background-color 0.3s 0.3s, box-shadow 0.3s 0.3s, opacity 0.3s;
        }

        span {
            position: absolute;
            left: calc(100% + 1vh);
            @include animate-opacity(0, 1, 0.5s, 0.5s);
        }
    }
}
</style>
