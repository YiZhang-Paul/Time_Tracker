<template>
    <div class="form-input-container">
        <input :type="type" :placeholder="placeholder" />
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../core/models/generic/icon-config';

class FormInputProp {
    public type = prop<string>({ default: 'text' });
    public icon = prop<IconConfig>({ default: null });
    public placeholder = prop<string>({ default: 'enter here...' });
}

export default class FormInput extends Vue.with(FormInputProp) { }
</script>

<style lang="scss" scoped>
.form-input-container {

    input {
        padding: 0.75vh 0;
        width: 100%;
        border: none;
        border-radius: 50px;
        box-shadow: inset 0 1px 4px 1px rgba(0, 0, 0, 0.3);
        text-align: center;
        font-size: inherit;
        font-family: inherit;
    }
}
</style>
