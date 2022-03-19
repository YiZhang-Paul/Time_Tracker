<template>
    <div class="login-input-panel-container">
        <img class="logo" src="../../../assets/icons/logo.png" />
        <span class="name">Ticking</span>
        <sign-in-panel class="sign-in-panel"></sign-in-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import SignInPanel from './sign-in-panel/sign-in-panel.vue';

@Options({
    components: {
        SignInPanel
    }
})
export default class LoginInputPanel extends Vue { }
</script>

<style lang="scss" scoped>
.login-input-panel-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, space-between);
    box-sizing: border-box;
    padding: 5% 0 9.5% 0;
    box-shadow: -1px 0 5px 2px var(--form-colors-login-panel-0-02);
    background-color: var(--form-colors-login-panel-0-00);

    .logo {
        width: 30%;
    }

    .name {
        color: var(--font-colors-0-00);
        font-size: var(--font-sizes-600);
    }

    .sign-in-panel {
        width: 100%;
        height: 100%;
    }
}
</style>
