<template>
    <div class="toggle-selector-container">
        <div class="toggle-wrapper"
            :class="{ active: modelValue }"
            @click="$emit('update:modelValue', !modelValue)">

            <div class="toggle"></div>
        </div>

        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

class ToggleSelectorProp {
    public modelValue = prop<boolean>({ default: false });
}

@Options({
    emits: [
        'update:modelValue'
    ]
})
export default class ToggleSelector extends Vue.with(ToggleSelectorProp) { }
</script>

<style lang="scss" scoped>
.toggle-selector-container {
    @import '../../../styles/presets.scss';

    $dimension: 2vh;

    @include flex-row(center, center);

    .toggle-wrapper {
        @include flex-row(center);
        position: relative;
        margin-right: 0.75vh;
        width: calc(#{$dimension} * 2);
        height: calc(#{$dimension} * 0.9);
        border-radius: 15px;
        background-color: var(--primary-colors-7-00);
        transition: background-color 0.3s;

        &:hover {
            cursor: pointer;
        }

        &.active {
            background-color: var(--primary-colors-5-00);

            .toggle {
                right: 0;
                background-color: var(--context-colors-info-0-00);
            }
        }

        .toggle {
            position: absolute;
            right: calc(100% - #{$dimension});
            width: $dimension;
            height: $dimension;
            border-radius: 50%;
            background-color: var(--primary-colors-5-00);
            box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
            transition: right 0.2s, background-color 0.3s;
        }
    }
}
</style>
