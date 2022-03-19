<template>
    <div class="form-input-container">
        <div class="input">
            <component v-if="icon"
                class="icon"
                :class="{ active: content }"
                :is="icon.component"
                :style="{ color: icon.color }">
            </component>

            <input v-model="content"
                :type="type"
                :placeholder="placeholder"
                @update:modelValue="$emit('update:modelValue', $event)" />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../core/models/generic/icon-config';

class FormInputProp {
    public icon = prop<IconConfig>({ default: null });
    public type = prop<string>({ default: 'text' });
    public modelValue = prop<string>({ default: '' });
    public placeholder = prop<string>({ default: 'enter here...' });
}

@Options({
    watch: {
        modelValue(): void {
            this.content = this.modelValue;
        }
    },
    emits: [
        'update:modelValue'
    ]
})
export default class FormInput extends Vue.with(FormInputProp) {
    public content = this.modelValue;
}
</script>

<style lang="scss" scoped>
.form-input-container {
    @import '../../../styles/presets.scss';

    .input {
        @include flex-row(center);
        position: relative;
        width: 100%;

        .icon {
            position: absolute;
            left: 1.25vh;
            font-size: var(--font-sizes-600);
            opacity: 0.3;
            transition: opacity 0.5s;

            &.active {
                opacity: 1;
            }
        }

        input {
            padding: 1vh 0;
            width: 100%;
            border: none;
            border-radius: 50px;
            box-shadow: inset 0 1px 4px 1px rgba(0, 0, 0, 0.3);
            text-align: center;
            font-size: inherit;
            font-family: inherit;
        }
    }
}
</style>
