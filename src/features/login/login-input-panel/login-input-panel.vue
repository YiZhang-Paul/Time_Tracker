<template>
    <div class="login-input-panel-container">
        <template v-if="active !== 'signInSuccess'">
            <img class="logo" src="../../../assets/icons/logo.png" />
            <span class="name">Ticking</span>
        </template>

        <sign-in-panel v-if="active === 'signIn'"
            class="login-panel"
            @unverified="active = 'unverified'"
            @signIn="active = 'signInSuccess'"
            @select:recover="active = 'recover'"
            @select:signUp="active = 'signUp'">
        </sign-in-panel>

        <sign-in-success-panel v-if="active === 'signInSuccess'"
            class="login-panel"
            @finished="openViewsSelector()">
        </sign-in-success-panel>

        <sign-up-panel v-if="active === 'signUp'"
            class="login-panel"
            @signUp="active = 'signUpSuccess'"
            @select:signIn="active = 'signIn'">
        </sign-up-panel>

        <sign-up-success-panel v-if="active === 'signUpSuccess'"
            class="login-panel"
            @select:signIn="active = 'signIn'">
        </sign-up-success-panel>

        <account-recover-panel v-if="active === 'recover'"
            class="login-panel"
            @select:signIn="active = 'signIn'">
        </account-recover-panel>

        <unverified-notice-panel v-if="active === 'unverified'"
            class="login-panel"
            @select:signIn="active = 'signIn'">
        </unverified-notice-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import SignInPanel from './sign-in-panel/sign-in-panel.vue';
import SignInSuccessPanel from './sign-in-success-panel/sign-in-success-panel.vue';
import SignUpPanel from './sign-up-panel/sign-up-panel.vue';
import SignUpSuccessPanel from './sign-up-success-panel/sign-up-success-panel.vue';
import AccountRecoverPanel from './account-recover-panel/account-recover-panel.vue';
import UnverifiedNoticePanel from './unverified-notice-panel/unverified-notice-panel.vue';

@Options({
    components: {
        SignInPanel,
        SignInSuccessPanel,
        SignUpPanel,
        SignUpSuccessPanel,
        AccountRecoverPanel,
        UnverifiedNoticePanel
    }
})
export default class LoginInputPanel extends Vue {
    public active = 'signIn';

    public openViewsSelector(): void {
        this.$router.push('/views');
    }
}
</script>

<style lang="scss" scoped>
.login-input-panel-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, space-between);
    box-sizing: border-box;
    padding: 4% 0 9% 0;
    box-shadow: -1px 0 5px 2px var(--form-colors-login-panel-0-02);
    background-color: var(--form-colors-login-panel-0-00);

    .logo {
        width: 12.5vh;
        min-height: 12.5vh;
    }

    .name {
        color: var(--font-colors-0-00);
        font-size: var(--font-sizes-600);
    }

    .login-panel {
        width: 100%;
        height: 100%;
    }
}
</style>
