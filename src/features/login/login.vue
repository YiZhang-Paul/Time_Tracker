<template>
    <div class="login-container">
        <div class="login-panel">
            <show-case-panel class="show-case"></show-case-panel>
            <login-input-panel class="login-input"></login-input-panel>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import ShowCasePanel from './show-case-panel/show-case-panel.vue';
import LoginInputPanel from './login-input-panel/login-input-panel.vue';

@Options({
    components: {
        ShowCasePanel,
        LoginInputPanel
    }
})
export default class Login extends Vue { }
</script>

<style lang="scss" scoped>
.login-container {
    @import '../../styles/presets.scss';
    @import '../../styles/animations.scss';

    @include flex-column(center);
    z-index: 999;

    .login-panel {
        @include flex-row();
        width: 65%;
        height: 87.5%;
        border-radius: 15px;
        box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        @include animate-property(opacity, 0, 1, 0.75s);

        .show-case {
            width: 67.5%;
            height: 100%;
        }

        .login-input {
            width: 32.5%;
            height: 100%;
        }
    }
}
</style>
