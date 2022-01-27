<template>
    <div class="selection-group-container">
        <span v-if="!isComponent(selected)" @click="showOptions = !showOptions">{{ selected }}</span>

        <div v-if="showOptions" class="options">
            <div v-for="(option, index) in options" class="option" :key="index" @click="onSelect(option)">
                <span v-if="!isComponent(option)">{{ option }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { DynamicComponentOption } from '../../../core/models/options/dynamic-component-option';

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

        if (this.selected === '' && this.options.length) {
            this.selected = this.options[0];
        }
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
}
</script>

<style lang="scss" scoped>
.selection-group-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);
    position: relative;

    .options {
        @include flex-column(center, center);
        position: absolute;
        left: calc(100% + 0.75vh);

        .option {
            $dimension: 3vh;

            @include flex-row(center, center);
            min-width: $dimension;
            min-height: $dimension;
            border: 1px solid red;

            &:not(:last-of-type) {
                margin-bottom: 0.5vh;
            }
        }
    }
}
</style>
