<template>
    <div class="login-input-panel-container">
        <img class="logo" src="../../../assets/icons/logo.png" />

        <div class="inputs">
            <form-input class="form-input"
                v-model="email"
                :icon="emailIcon"
                :type="'email'"
                :placeholder="'Email'">
            </form-input>

            <form-input class="form-input"
                v-model="password"
                :icon="passwordIcon"
                :type="'password'"
                :placeholder="'Password'">
            </form-input>

            <a>Forgot your password?</a>
        </div>

        <div class="fill"></div>

        <div class="actions">
            <flat-button class="login-button">Login</flat-button>

            <div class="sign-up-message">
                <span>New to ticking?</span>
                <a>Sign up</a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { At, Lock } from 'mdue';

import { IconConfig } from '../../../core/models/generic/icon-config';
import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../../shared/inputs/form-input/form-input.vue';

@Options({
    components: {
        FlatButton,
        FormInput
    }
})
export default class LoginInputPanel extends Vue {
    public readonly emailIcon = new IconConfig(markRaw(At), 'var(--font-colors-8-00)');
    public readonly passwordIcon = new IconConfig(markRaw(Lock), 'var(--font-colors-8-00)');
    public email = '';
    public password = '';
}
</script>

<style lang="scss" scoped>
.login-input-panel-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, space-between);
    box-sizing: border-box;
    padding: 5% 0 7.5% 0;
    box-shadow: -1px 0 5px 2px var(--form-colors-login-panel-0-02);
    background-color: var(--form-colors-login-panel-0-00);

    a {
        text-decoration: underline;
        color: var(--font-colors-1-00);
        transition: color 0.3s;

        &:hover {
            cursor: pointer;
            color: var(--font-colors-0-00);
        }
    }

    .logo {
        width: 35%;
    }

    .inputs, .actions {
        @include flex-column(center);
    }

    .inputs {
        margin-top: 5vh;
        width: 67.5%;

        .form-input {
            width: 100%;

            &:first-of-type {
                margin-bottom: 3.5vh;
            }
        }

        a {
            align-self: flex-end;
            margin-top: 1vh;
            margin-right: 1.25vh;
            font-size: var(--font-sizes-300);
        }
    }

    .fill {
        height: 100%;
    }

    .actions {
        width: 100%;

        .login-button {
            padding: 1vh 0;
            width: 47.5%;
            border-radius: 50px;
            box-shadow: 0 0 4px 1px var(--form-colors-login-button-0-02);
            background-color: var(--form-colors-login-button-1-00);
            color: var(--font-colors-0-00);
            font-size: var(--font-sizes-500);
            transition: background-color 0.3s;

            &:hover {
                background-color: var(--form-colors-login-button-0-00);
            }
        }

        .sign-up-message {
            @include flex-row(center);
            margin-top: 1.5vh;
            color: var(--font-colors-1-00);

            a {
                margin-left: 0.5vh;
            }
        }
    }
}
</style>
