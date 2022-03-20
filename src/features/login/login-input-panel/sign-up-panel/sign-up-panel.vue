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

        <div class="password-strength">
            <span class="text">password strength: {{ passwordStrength.value }}</span>

            <div class="bar">
                <div :class="['level', `level-${passwordStrength.id + 1}`]"></div>
            </div>
        </div>

        <div class="password-checks">
            <div v-for="(check, index) in passwordChecks" class="check" :key="index">
                <div class="status" :class="{ valid: check.status }"></div>
                <span>{{ check.criterion }}</span>
            </div>
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
import { passwordStrength, Result as PasswordStrength } from 'check-password-strength';
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
    private readonly minPasswordLength = 8;

    get passwordStrength(): PasswordStrength<string> {
        return passwordStrength(this.password);
    }

    get passwordChecks(): { criterion: string, status: boolean }[] {
        return [
            {
                criterion: 'at least one upper case letter',
                status: /[A-Z]/.test(this.password)
            },
            {
                criterion: 'at least one special character',
                status: /\W/.test(this.password.replace(/\s/g, ''))
            },
            {
                criterion: `at least ${this.minPasswordLength} characters without spaces`,
                status: this.password.length >= this.minPasswordLength && !/\s/.test(this.password)
            }
        ];
    }

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
        if (!password?.trim()) {
            return 'please provide a password';
        }

        return this.passwordChecks.every(_ => _.status) ? '' : 'password does not meet expectations';
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

    $inputs-width: 67.5%;

    @include flex-column(center, space-between);
    @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

    .inputs, .actions {
        @include flex-column(center);
    }

    .inputs {
        margin-top: 0.75vh;
        width: $inputs-width;

        .form-input {
            width: 100%;

            &:first-of-type {
                margin-bottom: 0.5vh;
            }

            &::v-deep(.error-text) {
                color: var(--font-colors-1-00);
            }
        }
    }

    .password-strength, .password-checks {
        @include flex-column();
        width: calc(#{$inputs-width} * 0.9);
        color: var(--font-colors-1-00);
        font-size: var(--font-sizes-300);
    }

    .password-strength {

        .text {
            margin: 0.75vh 0;
        }

        .bar {
            $border-radius: 15px;

            margin-bottom: 1vh;
            width: 100%;
            height: 1vh;
            border-radius: $border-radius;
            background-color: var(--primary-colors-1-00);

            .level {
                height: 100%;
                border-radius: $border-radius;
                transition: width 0.5s, background-color 0.5s;

                &.level-1 {
                    width: 25%;
                    box-shadow: 0 0 7px 2px var(--context-colors-warning-0-04);
                    background-color: var(--context-colors-warning-0-00);
                }

                &.level-2 {
                    width: 50%;
                    box-shadow: 0 0 7px 2px var(--context-colors-suggestion-0-04);
                    background-color: var(--context-colors-suggestion-0-00);
                }

                &.level-3 {
                    width: 75%;
                    box-shadow: 0 0 7px 2px var(--context-colors-info-0-04);
                    background-color: var(--context-colors-info-0-00);
                }

                &.level-4 {
                    width: 100%;
                    box-shadow: 0 0 7px 2px var(--context-colors-success-0-04);
                    background-color: var(--context-colors-success-0-00);
                }
            }
        }
    }

    .password-checks {

        .check {
            @include flex-row(center);
            margin-top: 3px;

            .status {
                margin-right: 5px;
                width: 0.75rem;
                height: 0.75rem;
                border-radius: 50%;
                box-shadow: 0 0 4px 1px var(--context-colors-warning-0-04);
                background-color: var(--context-colors-warning-0-00);
                transition: box-shadow 0.3s, background-color 0.3s;

                &.valid {
                    box-shadow: 0 0 4px 1px var(--context-colors-success-0-04);
                    background-color: var(--context-colors-success-0-00);
                }
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
