<template>
    <div class="form-input-container">
        <div class="error-text">
            <div v-if="errorText" class="status"></div>
            <span v-if="errorText" class="message">{{ errorText }}</span>
        </div>

        <div class="input" :class="{ invalid: errorText }">
            <component v-if="icon"
                class="icon"
                :class="{ active: content }"
                :is="icon.component"
                :style="{ color: icon.color }">
            </component>

            <input v-model="content"
                :type="type"
                :placeholder="placeholder"
                :maxlength="maxLength"
                @blur="touched = true"
                @update:modelValue="$emit('update:modelValue', $event)" />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../core/models/generic/icon-config';

class FormInputProp {
    public modelValue = prop<string>({ default: '' });
    public icon = prop<IconConfig>({ default: null });
    public type = prop<string>({ default: 'text' });
    public maxLength = prop<number>({ default: 140 });
    public placeholder = prop<string>({ default: 'enter here...' });
    public validator = prop<(_: string) => string>({ default: null });
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
    public touched = false;
    public content = this.modelValue;

    get errorText(): string {
        if (!this.touched) {
            return '';
        }

        return this.validator ? this.validator(this.content) : '';
    }
}
</script>

<style lang="scss" scoped>
.form-input-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column(center);

    .error-text {
        @include flex-row(center);
        width: 90%;
        height: 1.5rem;

        .status {
            margin-right: 5px;
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
            box-shadow: 0 0 4px 1px var(--context-colors-warning-0-04);
            background-color: var(--context-colors-warning-0-00);
            @include animate-property(opacity, 0, 1, 0.6s);
        }

        .message {
            @include line-overflow(clip);
            font-size: var(--font-sizes-200);
            @include animate-property(width, 0, 100%, 0.2s, 0.3s, linear);
        }
    }

    .input {
        $border-radius: 50px;

        @include flex-row(center);
        position: relative;
        width: 100%;
        border: 2px solid transparent;
        border-radius: $border-radius;
        transition: border 0.5s;

        &.invalid {
            border: 2px solid var(--context-colors-warning-0-00);

            input {
                outline: none;
            }
        }

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
            border-radius: $border-radius;
            box-shadow: inset 0 1px 4px 1px rgba(0, 0, 0, 0.3);
            text-align: center;
            font-size: inherit;
            font-family: inherit;
        }
    }
}
</style>
