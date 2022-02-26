<template>
    <div class="tab-group-container">
        <button v-for="(option, index) in modelValue"
            :class="{ active: option.isActive }"
            :style="{ color: option.isActive ? option.icon.color : null }"
            :key="index"
            @click="onSelect(index)">

            <component :is="option.icon.component"></component>
            <span>{{ option.name }}</span>
        </button>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { FilterGroupOption } from '../../../core/models/options/filter-group-option';

class TabGroupProp {
    public modelValue = prop<FilterGroupOption[]>({ default: [] });
}

@Options({
    emits: [
        'update:modelValue'
    ]
})
export default class TabGroup extends Vue.with(TabGroupProp) {
    public onSelect(index: number): void {
        if (!this.modelValue[index].isActive) {
            const updated = this.modelValue.map((_, i) => ({ ..._, isActive: index === i }));
            this.$emit('update:modelValue', updated);
        }
    }
}
</script>

<style lang="scss" scoped>
.tab-group-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);

    button {
        @include flex-row(center, center);
        padding: 0 6px;
        height: 3vh;
        border: none;
        border-left: 2px solid var(--font-colors-7-00);
        outline: none;
        background-color: var(--primary-colors-5-00);
        color: var(--font-colors-3-00);
        font-size: var(--font-sizes-400);
        transition: background-color 0.3s, color 0.3s;

        &:hover {
            cursor: pointer;
            background-color: var(--context-colors-info-5-00);
            color: var(--font-colors-0-00);
        }

        &.active {
            box-shadow: 0 0 6px 1px var(--context-colors-info-4-03);
            background-color: var(--context-colors-info-4-00);
        }

        &:first-of-type {
            padding-left: 10px;
            border: none;
            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;
        }

        &:last-of-type {
            padding-right: 10px;
            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;
        }

        span {
            margin-left: 3px;
            font-size: var(--font-sizes-200);
        }
    }
}
</style>
