<template>
    <div class="range-slider-container" :class="{ disabled: isDisabled }">
        <span>{{ boundaryStart }}</span>

        <div class="slider-base" ref="sliderBase">
            <div class="selection" :style="selectionStyle"></div>

            <div class="handle handle-start"
                :class="{ active: activeHandle === 'start' }"
                :style="{ left: `calc(${selectionStyle.left} - 0.75rem)` }"
                @mousedown="onHandleClick('start')">

                <menu-up class="icon" />
            </div>

            <div class="handle handle-end"
                :class="{ active: activeHandle === 'end' }"
                :style="{ right: `calc(${selectionStyle.right} - 0.75rem)` }"
                @mousedown="onHandleClick('end')">

                <menu-down class="icon" />
            </div>
        </div>

        <span>{{ boundaryEnd }}</span>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { ref } from '@vue/reactivity';
import { MenuDown, MenuUp } from 'mdue';

import { Range } from '../../../core/models/generic/range';
import { StyleConfigs } from '../../../core/models/generic/style-configs';

class RangeSliderProp {
    public modelValue = prop<Range<number>>({ default: new Range(0, 100) });
    public boundary = prop<Range<number>>({ default: new Range(0, 100) });
    public transform = prop<(_: number) => string>({ default: null });
    public isDisabled = prop<boolean>({ default: false });
}

@Options({
    components: {
        MenuDown,
        MenuUp
    },
    watch: {
        modelValue(): void {
            this.selection = ref({ ...this.modelValue }).value;
        }
    },
    emits: [
        'update:modelValue'
    ]
})
export default class RangeSlider extends Vue.with(RangeSliderProp) {
    public selection = ref({ ...this.modelValue }).value;
    public activeHandle: 'start' | 'end' | null = null;

    get boundaryStart(): string {
        return this.transform ? this.transform(this.boundary.start) : this.boundary.start.toString();
    }

    get boundaryEnd(): string {
        return this.transform ? this.transform(this.boundary.end) : this.boundary.end.toString();
    }

    get selectionStyle(): StyleConfigs {
        const { start, end } = this.boundary;
        const total = end - start;

        return {
            left: `${(this.selection.start - start) / total * 100}%`,
            right: `${100 - (this.selection.end - start) / total * 100}%`
        };
    }

    public mounted(): void {
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    public beforeUnmount(): void {
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMove);
    }

    public onHandleClick(type: 'start' | 'end'): void {
        this.activeHandle = type;
    }

    public onMouseMove({ clientX }: MouseEvent): void {
        if (!this.activeHandle) {
            return;
        }

        const { start, end } = this.boundary;
        const { width, left } = (this.$refs.sliderBase as HTMLElement).getBoundingClientRect();
        const total = end - start;
        const percentage = Math.min(Math.max(0, clientX - left), width) / width;

        if (this.activeHandle === 'start') {
            const max = (this.selection.end - start) / total;
            this.selection.start = total * Math.min(max, percentage) + start;
        }
        else {
            const min = (this.selection.start - start) / total;
            this.selection.end = total * Math.max(min, percentage) + start;
        }

        this.$emit('update:modelValue', this.selection);
    }

    public onMouseUp(): void {
        this.activeHandle = null;
    }
}
</script>

<style lang="scss" scoped>
.range-slider-container {
    @import '../../../styles/presets.scss';

    $container-height: 6vh;
    $base-height: 1.5vh;
    $handle-height: calc((#{$container-height} - #{$base-height}) / 2);

    @include flex-row(center, space-between);
    height: $container-height;
    color: var(--font-colors-5-00);
    font-size: var(--font-sizes-200);

    &.disabled {
        pointer-events: none;

        .slider-base {

            .selection {
                background-color: var(--primary-colors-3-00);
            }

            .handle {
                opacity: 0;
            }
        }
    }

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
            transition: background-color 0.3s;
        }

        .handle {
            @include flex-column(center, center);
            position: absolute;
            width: 1.5rem;
            height: $handle-height;
            color: var(--font-colors-3-00);
            transition: opacity 0.3s, color 0.3s;

            &:hover, &.active {
                cursor: pointer;
                color: var(--context-colors-info-0-00);
            }

            .icon {
                font-size: var(--font-sizes-600);
            }

            &.handle-start {
                top: 100%;
            }

            &.handle-end {
                bottom: 100%;
            }
        }
    }
}
</style>
