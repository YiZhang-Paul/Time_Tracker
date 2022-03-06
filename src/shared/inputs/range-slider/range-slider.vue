<template>
    <div class="range-slider-container">
        <span>{{ boundaryStart }}</span>

        <div class="slider-base">
            <div class="selection" :style="selectionStyle"></div>

            <div class="handle handle-start" :style="{ left: `calc(${selectionStyle.left} - 1rem)` }">
                <menu-up class="icon" />
                <span>{{ selectionStart }}</span>
            </div>

            <div class="handle handle-end" :style="{ right: `calc(${selectionStyle.right} - 1rem)` }">
                <span>{{ selectionEnd }}</span>
                <menu-down class="icon" />
            </div>
        </div>

        <span>{{ boundaryEnd }}</span>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { MenuDown, MenuUp } from 'mdue';

import { Range } from '../../../core/models/generic/range';
import { StyleConfigs } from '../../../core/models/generic/style-configs';

class RangeSliderProp {
    public boundary = prop<Range<number>>({ default: new Range(0, 100) });
    public selected = prop<Range<number>>({ default: new Range(0, 100) });
    public transform = prop<(_: number) => string>({ default: null });
}

@Options({
    components: {
        MenuDown,
        MenuUp
    }
})
export default class RangeSlider extends Vue.with(RangeSliderProp) {
    public selection = { ...this.selected };

    get boundaryStart(): string {
        return this.transform ? this.transform(this.boundary.start) : this.boundary.start.toString();
    }

    get boundaryEnd(): string {
        return this.transform ? this.transform(this.boundary.end) : this.boundary.end.toString();
    }

    get selectionStart(): string {
        return this.transform ? this.transform(this.selection.start) : this.selection.start.toString();
    }

    get selectionEnd(): string {
        return this.transform ? this.transform(this.selection.end) : this.selection.end.toString();
    }

    get selectionStyle(): StyleConfigs {
        const { start, end } = this.boundary;
        const total = end - start;

        return {
            left: `${(this.selection.start - start) / total * 100}%`,
            right: `${100 - (this.selection.end - start) / total * 100}%`
        };
    }

    public created(): void {
        if (this.boundary.start > this.boundary.end || this.selected.start > this.selected.end) {
            throw new Error('Invalid range.');
        }

        if (this.selected.end > this.boundary.end || this.selected.start < this.boundary.start) {
            throw new Error('Selection must fall within boundary.');
        }
    }
}
</script>

<style lang="scss" scoped>
.range-slider-container {
    @import '../../../styles/presets.scss';

    $container-height: 9vh;
    $base-height: 2vh;
    $handle-height: calc((#{$container-height} - #{$base-height}) / 2);

    @include flex-row(center, space-between);
    height: $container-height;
    color: var(--font-colors-5-00);
    font-size: var(--font-sizes-200);

    .slider-base {
        position: relative;
        margin: 0 1vh;
        width: 100%;
        height: $base-height;
        background-color: var(--primary-colors-8-00);

        .selection {
            position: absolute;
            height: 100%;
            box-shadow: 0 0 6px 1px var(--primary-colors-2-03);
            background-color: var(--primary-colors-1-00);
        }

        .handle {
            @include flex-column(center, center);
            position: absolute;
            width: 2rem;
            height: $handle-height;
            color: var(--font-colors-3-00);
            transition: color 0.3s;

            &:hover {
                cursor: pointer;
                color: var(--context-colors-info-0-00);
            }

            .icon {
                font-size: var(--font-sizes-500);
            }

            &.handle-start {
                top: 100%;

                span {
                    margin-top: -0.5vh;
                }
            }

            &.handle-end {
                bottom: 100%;

                span {
                    margin-bottom: -0.5vh;
                }
            }
        }
    }
}
</style>
