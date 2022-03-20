<template>
    <div class="sign-up-panel-container">
        <div class="inputs">
            <form-input class="form-input"
                ref="emailInput"
                v-model="email"
                :icon="emailIcon"
                :type="'email'"
                :maxLength="320"
                :placeholder="'Email'"
                :validator="validateEmail">
            </form-input>

            <form-input class="form-input"
                ref="passwordInput"
                v-model="password"
                :icon="passwordIcon"
                :type="'password'"
                :maxLength="20"
                :placeholder="'Password'"
                :validator="validatePassword">
            </form-input>
        </div>

        <div class="fill"></div>

        <div class="actions">
            <flat-button class="sign-up-button" :isDisabled="isSignUpDisabled()">Sign up</flat-button>

            <div class="sign-in-message">
                <span>Have an account?</span>
                <a @click="$emit('signIn')">Sign in</a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { At, Lock } from 'mdue';

import { IconConfig } from '../../../../core/models/generic/icon-config';
import FlatButton from '../../../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../../../shared/inputs/form-input/form-input.vue';

@Options({
    components: {
        FlatButton,
        FormInput
    },
    emits: [
        'signIn'
    ]
})
export default class SignUpPanel extends Vue {
    public readonly emailIcon = new IconConfig(markRaw(At), 'var(--font-colors-7-00)');
    public readonly passwordIcon = new IconConfig(markRaw(Lock), 'var(--font-colors-7-00)');
    public email = '';
    public password = '';

    public mounted(): void {
        const { emailInput, passwordInput } = this.$refs as { emailInput: FormInput, passwordInput: FormInput };
        emailInput.isTouched = true;
        passwordInput.isTouched = true;
    }

    public validateEmail(email: string): string {
        if (!email?.trim()) {
            return 'please provide an email';
        }

        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email) ? '' : 'invalid email address';
    }

    public validatePassword(password: string): string {
        return password?.trim() ? '' : 'please provide a password';
    }

    public isSignUpDisabled(): boolean {
        const { emailInput, passwordInput } = this.$refs as { emailInput: FormInput, passwordInput: FormInput };
        const isValidEmail = Boolean(emailInput) && !emailInput.isInvalid;
        const isValidPassword = Boolean(passwordInput) && !passwordInput.isInvalid;

        return !isValidEmail || !isValidPassword;
    }
}
</script>

<style lang="scss" scoped>
.sign-up-panel-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center, space-between);
    @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

    .inputs, .actions {
        @include flex-column(center);
    }

    .inputs {
        margin-top: 0.75vh;
        width: 67.5%;

        .form-input {
            width: 100%;

            &:first-of-type {
                margin-bottom: 0.25vh;
            }

            &::v-deep(.error-text) {
                color: var(--font-colors-1-00);
            }
        }
    }

    .fill {
        height: 100%;
    }

    .actions {
        width: 100%;

        .sign-up-button {
            padding: 1vh 0;
            width: 42.5%;
            border-radius: 50px;
            transition: background-color 0.3s;

            &:hover {
                background-color: var(--form-colors-sign-up-button-0-00);
            }

            &:not(.disabled) {
                box-shadow: 0 0 4px 1px var(--form-colors-sign-up-button-0-02);
                background-color: var(--form-colors-sign-up-button-1-00);
                color: var(--font-colors-0-00);
            }
        }

        .sign-in-message {
            @include flex-row(center);
            margin-top: 1.5vh;
            color: var(--font-colors-1-00);

            a {
                margin-left: 0.5vh;
                text-decoration: underline;
                transition: color 0.3s;

                &:hover {
                    cursor: pointer;
                    color: var(--font-colors-0-00);
                }
            }
        }
    }
}
</style>
