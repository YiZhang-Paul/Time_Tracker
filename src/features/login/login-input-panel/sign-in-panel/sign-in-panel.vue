<template>
    <div class="sign-in-panel-container">
        <div class="inputs">
            <form-input class="form-input"
                ref="emailInput"
                v-model="credentials.email"
                :icon="emailIcon"
                :type="'email'"
                :maxLength="320"
                :placeholder="'Email'"
                :validator="validateEmail"
                :isReadonly="isLoading"
                @update:modelValue="errorMessage = ''">
            </form-input>

            <form-input class="form-input"
                ref="passwordInput"
                v-model="credentials.password"
                :icon="passwordIcon"
                :type="'password'"
                :maxLength="20"
                :placeholder="'Password'"
                :validator="validatePassword"
                :isReadonly="isLoading"
                @update:modelValue="errorMessage = ''">
            </form-input>

            <a v-if="!isLoading && !errorMessage" @click="$emit('select:recover')">
                Forgot your password?
            </a>
        </div>

        <div v-if="!isLoading && errorMessage" class="error-message">
            <alert class="icon" />
            <span>{{ errorMessage }}, did you </span>
            <a @click="$emit('select:recover')">forget your password?</a>
        </div>

        <div class="fill"></div>

        <div v-if="!isLoading" class="actions">
            <flat-button class="login-button"
                :isDisabled="isLoginDisabled()"
                @click="onSignIn()">

                Login
            </flat-button>

            <div class="sign-up-message">
                <span>New to ticking?</span>
                <a @click="$emit('select:signUp')">Sign up</a>
            </div>
        </div>

        <loading-spinner v-if="isLoading" class="spinner"></loading-spinner>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { Alert, At, Lock } from 'mdue';

import { useUserStore } from '../../../../stores/user/user.store';
import { Credentials } from '../../../../core/models/authentication/credentials';
import { IconConfig } from '../../../../core/models/generic/icon-config';
import { AuthenticationResult } from '../../../../core/enums/authentication-result.enum';
import FlatButton from '../../../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../../../shared/inputs/form-input/form-input.vue';
import LoadingSpinner from '../../../../shared/indicators/loading-spinner/loading-spinner.vue';

@Options({
    components: {
        Alert,
        FlatButton,
        FormInput,
        LoadingSpinner
    },
    emits: [
        'unverified',
        'signIn',
        'select:recover',
        'select:signUp'
    ],
    computed: {
        ...mapStores(useUserStore)
    }
})
export default class SignInPanel extends Vue {
    public readonly emailIcon = new IconConfig(markRaw(At), 'var(--font-colors-7-00)');
    public readonly passwordIcon = new IconConfig(markRaw(Lock), 'var(--font-colors-7-00)');
    public errorMessage = '';
    public isLoading = false;
    public credentials = new Credentials();
    private userStore!: ReturnType<typeof useUserStore>;

    public mounted(): void {
        document.addEventListener('keyup', this.onKeyup);
    }

    public beforeUnmount(): void {
        document.removeEventListener('keyup', this.onKeyup);
    }

    public validateEmail(email: string): string {
        if (!email?.trim()) {
            return 'email not provided';
        }

        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email) ? '' : 'invalid email address';
    }

    public validatePassword(password: string): string {
        return password?.trim() ? '' : 'password not provided';
    }

    public isLoginDisabled(): boolean {
        const { emailInput, passwordInput } = this.$refs as { emailInput: FormInput, passwordInput: FormInput };
        const isValidEmail = Boolean(emailInput) && !emailInput.isInvalid;
        const isValidPassword = Boolean(passwordInput) && !passwordInput.isInvalid;

        return !isValidEmail || !isValidPassword;
    }

    public async onKeyup(event: KeyboardEvent): Promise<void> {
        if (!this.isLoginDisabled() && event.key === 'Enter') {
            await this.onSignIn();
        }
    }

    public async onSignIn(): Promise<void> {
        this.isLoading = true;
        const result = await this.userStore.signIn(this.credentials);

        if (result !== AuthenticationResult.Failed) {
            this.errorMessage = '';
            this.credentials = new Credentials();
            this.$emit(result === AuthenticationResult.Succeed ? 'signIn' : 'unverified');
        }
        else {
            this.errorMessage = 'invalid credentials';
        }

        this.isLoading = false;
    }
}
</script>

<style lang="scss" scoped>
.sign-in-panel-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center, space-between);
    @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

    a {
        text-decoration: underline;
        color: var(--font-colors-1-00);
        transition: color 0.3s;

        &:hover {
            cursor: pointer;
            color: var(--font-colors-0-00);
        }
    }

    .inputs, .actions {
        @include flex-column(center);
    }

    .inputs {
        margin-top: 0.75vh;
        width: 67.5%;

        .form-input {
            width: 100%;

            &:first-of-type {
                margin-bottom: 0.5vh;
            }

            &::v-deep(.error-text) {
                color: var(--font-colors-1-00);
            }
        }

        a {
            align-self: flex-end;
            margin-top: 1vh;
            margin-right: 1.25vh;
            font-size: var(--font-sizes-200);
            @include animate-property(opacity, 0, 1, 0.5s, 0.5s);
        }
    }

    .error-message {
        @include flex-row(center);
        margin-top: 1vh;
        color: var(--context-colors-suggestion-0-00);
        font-size: var(--font-sizes-200);
        @include animate-property(opacity, 0, 1, 0.4s, 0.3s);

        .icon {
            margin-right: 3px;
            font-size: var(--font-sizes-300);
        }

        a {
            margin-left: 0.5vh;
        }
    }

    .fill {
        height: 100%;
    }

    .actions {
        width: 100%;

        .login-button {
            padding: 1vh 0;
            width: 42.5%;
            border-radius: 50px;
            transition: background-color 0.3s;

            &:hover {
                background-color: var(--form-colors-login-button-0-00);
            }

            &:not(.disabled) {
                box-shadow: 0 0 4px 1px var(--form-colors-login-button-0-02);
                background-color: var(--form-colors-login-button-1-00);
                color: var(--font-colors-0-00);
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

    .spinner {
        margin-bottom: 30%;
    }
}
</style>
