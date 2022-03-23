<template>
    <div class="login-input-panel-container">
        <img class="logo" src="../../../assets/icons/logo.png" />
        <span class="name">Ticking</span>

        <sign-in-panel v-if="active === 'signIn'"
            class="login-panel"
            @recover="active = 'recover'"
            @signUp="active = 'signUp'"
            @signIn="onSignIn($event)">
        </sign-in-panel>

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
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { Credentials } from '../../../core/models/generic/credentials';
import { AuthenticationService } from '../../../core/services/authentication/authentication.service';

import SignInPanel from './sign-in-panel/sign-in-panel.vue';
import SignUpPanel from './sign-up-panel/sign-up-panel.vue';
import SignUpSuccessPanel from './sign-up-success-panel/sign-up-success-panel.vue';
import AccountRecoverPanel from './account-recover-panel/account-recover-panel.vue';

@Options({
    components: {
        SignInPanel,
        SignUpPanel,
        SignUpSuccessPanel,
        AccountRecoverPanel
    }
})
export default class LoginInputPanel extends Vue {
    public active = 'signIn';
    private readonly authenticationService = container.get<AuthenticationService>(types.AuthenticationService);

    public async onSignIn(credentials: Credentials): Promise<void> {
        await this.authenticationService.signIn(credentials);
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
        width: 30%;
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
