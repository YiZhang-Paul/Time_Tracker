<template>
    <div class="selection-group-container" ref="container" @click="showOptions = !showOptions">
        <component v-if="isComponent(selected)" :is="selected.component" v-bind="selected.properties"></component>
        <span v-if="!isComponent(selected)">{{ selected }}</span>

        <div v-if="showOptions" class="options">
            <div v-for="(option, index) in options"
                class="option"
                :class="{ selected: !isComponent(selected) && selected === option }"
                :key="index"
                @click.stop="onSelect(option)">

                <component v-if="isComponent(option)" :is="option.component" v-bind="option.properties"></component>
                <span v-if="!isComponent(option)">{{ option }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { DynamicComponentOption } from '../../../core/models/options/dynamic-component-option';
import { DomUtility } from '../../../core/utilities/dom-utility/dom-utility';

class SelectionGroupProp {
    public options = prop<string[] | DynamicComponentOption<unknown>[]>({ default: [] });
    public selectedOption = prop<string | DynamicComponentOption<unknown>>({ default: '' });
}

@Options({
    watch: {
        selectedOption(): void {
            this.selected = this.selectedOption;
        }
    },
    emits: [
        'select'
    ]
})
export default class SelectionGroup extends Vue.with(SelectionGroupProp) {
    public selected: string | DynamicComponentOption<unknown> = '';
    public showOptions = false;

    public mounted(): void {
        this.selected = this.selectedOption;
        document.addEventListener('click', this.checkClickOutside);

        if (this.selected === '' && this.options.length) {
            this.selected = this.options[0];
        }
    }

    public beforeUnmount(): void {
        document.removeEventListener('click', this.checkClickOutside);
    }

    public isComponent(option: string | DynamicComponentOption<unknown>): boolean {
        return option instanceof DynamicComponentOption;
    }

    public onSelect(option: string | DynamicComponentOption<unknown>): void {
        this.showOptions = false;

        if (option !== this.selected) {
            this.selected = option;
            this.$emit('select', option);
        }
    }

    private checkClickOutside(event: Event): void {
        if (DomUtility.isClickOutside(event, this.$refs.container as HTMLElement)) {
            this.showOptions = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.selection-group-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-row(center, center);
    position: relative;
    cursor: pointer;

    .options {
        @include flex-row(center, center);
        position: absolute;
        bottom: calc(100% + 1.75vh);
        @include animate-opacity(0, 1, 0.2s);

        .option {
            $dimension: 3.5vh;

            @include flex-row(center, center);
            min-width: $dimension;
            min-height: $dimension;
            border-radius: 5px;
            border: 2px solid var(--context-colors-info-1-00);
            background-color: var(--primary-colors-9-00);
            transition: all 0.2s;

            &.selected {
                color: var(--context-colors-info-1-00);
            }

            &:not(:last-of-type) {
                margin-right: 0.5vh;
            }

            &:hover {
                background-color: var(--primary-colors-6-00);
                color: var(--context-colors-suggestion-0-00);
            }
        }
    }
}
</style>
