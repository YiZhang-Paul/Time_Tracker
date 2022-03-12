<template>
    <div class="time-input-container">
        <input type="text" v-model="hour" @input="setHour($event.target.value)" maxlength="2" />
        <span>:</span>
        <input type="text" v-model="minute" @input="setMinute($event.target.value)" maxlength="2" />
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

class TimeInputProp {
    public modelValue = prop<Date>({ default: new Date() });
    public min = prop<Date>({ default: null });
    public max = prop<Date>({ default: null });
}

@Options({
    watch: {
        modelValue(): void {
            this.setHour(this.modelValue.getHours(), false, false);
            this.setMinute(this.modelValue.getMinutes(), false, false);
        }
    },
    emits: [
        'update:modelValue'
    ]
})
export default class TimeInput extends Vue.with(TimeInputProp) {
    public hour = '00';
    public minute = '00';
    private hourDebounce: number | null = null;
    private minuteDebounce: number | null = null;

    get hourRange(): [number, number] {
        return [this.min?.getHours() ?? 0, this.max?.getHours() ?? 23];
    }

    get minuteRange(): [number, number] {
        const [min, max] = this.hourRange;

        if (min === max) {
            return [this.min?.getMinutes() ?? 0, this.max?.getMinutes() ?? 59];
        }

        if (Number(this.hour) === min) {
            return [this.min?.getMinutes() ?? 0, 59];
        }

        if (Number(this.hour) === max) {
            return [0, this.max?.getMinutes() ?? 59];
        }

        return [0, 59];
    }

    public created(): void {
        this.setHour(this.modelValue.getHours(), false, false);
        this.setMinute(this.modelValue.getMinutes(), false, false);
    }

    public setHour(hour: number | string, emit = true, debounce = true): void {
        this.hour = this.hour.replace(/\D/g, '');

        if (this.hourDebounce) {
            clearTimeout(this.hourDebounce);
        }

        this.hourDebounce = setTimeout(() => {
            this.hour = this.formatValue(hour, ...this.hourRange);

            if (emit) {
                const updated = new Date(this.modelValue).setHours(Number(this.hour));
                this.$emit('update:modelValue', new Date(updated));
            }
        }, debounce ? 1000 : 1);
    }

    public setMinute(minute: number | string, emit = true, debounce = true): void {
        this.minute = this.minute.replace(/\D/g, '');

        if (this.minuteDebounce) {
            clearTimeout(this.minuteDebounce);
        }

        this.minuteDebounce = setTimeout(() => {
            this.minute = this.formatValue(minute, ...this.minuteRange);

            if (emit) {
                const updated = new Date(this.modelValue).setMinutes(Number(this.minute));
                this.$emit('update:modelValue', new Date(updated));
            }
        }, debounce ? 1000 : 1);
    }

    private formatValue(raw: number | string, min: number, max: number): string {
        let value = Number(raw);

        if (isNaN(value) || value < min) {
            value = min;
        }
        else if (value > max) {
            value = max;
        }

        return `${value < 10 ? '0' : ''}${value}`;
    }
}
</script>

<style lang="scss" scoped>
.time-input-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center);
    padding: 3px 10px;

    input {
        padding: 0;
        width: 1.1rem;
        outline: none;
        border: none;
        background-color: transparent;
        color: inherit;
        font-family: inherit;
        font-size: inherit;

        &:first-of-type {
            text-align: right;
        }
    }
}
</style>
