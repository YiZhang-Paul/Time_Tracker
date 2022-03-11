<template>
    <div class="time-input-container">
        <input type="text" v-model="hour" />
        <span>:</span>
        <input type="text" v-model="minute" />
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
            this.hour = this.modelValue.getHours();
            this.minute = this.modelValue.getMinutes();
        }
    },
    emits: [
        'update:modelValue'
    ]
})
export default class TimeInput extends Vue.with(TimeInputProp) {
    public hour = this.modelValue.getHours();
    public minute = this.modelValue.getMinutes();
}
</script>

<style lang="scss" scoped>
.time-input-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center);
    padding: 3px 10px;

    input {
        padding: 0;
        width: 1rem;
        outline: none;
        border: none;
        background-color: transparent;
        color: inherit;
        text-align: center;
        font-family: inherit;
        font-size: inherit;
    }
}
</style>
