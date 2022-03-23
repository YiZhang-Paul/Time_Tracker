<template>
    <div class="account-recover-panel-container">
        <div class="inputs">
            <form-input class="form-input"
                ref="emailInput"
                v-model="email"
                :icon="emailIcon"
                :type="'email'"
                :maxLength="320"
                :placeholder="'Enter your registered email'"
                :validator="validateEmail"
                @update:modelValue="result = null">
            </form-input>

            <div v-if="result"
                class="success-message"
                :class="{ failure: result && !result.isSuccess }">

                <check v-if="result.isSuccess" class="icon" />
                <alert v-if="!result.isSuccess" class="icon" />
                <span>{{ result.message }}</span>
            </div>
        </div>

        <div class="fill"></div>

        <div v-if="!isLoading" class="actions">
            <flat-button class="recover-button"
                :isDisabled="isRecoverDisabled()"
                @click="onRecover()">

                Recover
            </flat-button>

            <div class="sign-in-message">
                <span>Have an account?</span>
                <a @click="$emit('select:signIn')">Sign in</a>
            </div>
        </div>

        <loading-spinner v-if="isLoading" class="spinner"></loading-spinner>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { Alert, At, Check } from 'mdue';

import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { IconConfig } from '../../../../core/models/generic/icon-config';
import { AuthenticationService } from '../../../../core/services/authentication/authentication.service';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import FlatButton from '../../../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../../../shared/inputs/form-input/form-input.vue';
import LoadingSpinner from '../../../../shared/indicators/loading-spinner/loading-spinner.vue';

@Options({
    components: {
        Alert,
        Check,
        FlatButton,
        FormInput,
        LoadingSpinner
    },
    emits: [
        'select:signIn'
    ]
})
export default class AccountRecoverPanel extends Vue {
    public readonly emailIcon = new IconConfig(markRaw(At), 'var(--font-colors-7-00)');
    public email = '';
    public isLoading = false;
    public result: { isSuccess: boolean; message: string } | null = null;
    private readonly authenticationService = container.get<AuthenticationService>(types.AuthenticationService);

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

    public isRecoverDisabled(): boolean {
        const { emailInput } = this.$refs as { emailInput: FormInput };

        return !emailInput || emailInput.isInvalid;
    }

    public async onKeyup(event: KeyboardEvent): Promise<void> {
        if (!this.isRecoverDisabled() && event.key === 'Enter') {
            await this.onRecover();
        }
    }

    public async onRecover(): Promise<void> {
        this.isLoading = true;
        this.result = null;
        await TimeUtility.wait(2000);

        if (await this.authenticationService.recover(this.email)) {
            this.result = { isSuccess: true, message: 'password reset link has been sent to your email.' };
        }
        else {
            this.result = { isSuccess: false, message: 'password reset link was not sent, please try again.' };
        }

        this.isLoading = false;
    }
}
</script>

<style lang="scss" scoped>
.account-recover-panel-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center, space-between);
    @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

    .inputs, .actions {
        @include flex-column(center);
    }

    .inputs {
        margin-top: 20%;
        width: 67.5%;

        .form-input {
            width: 100%;

            &::v-deep(.error-text) {
                color: var(--font-colors-1-00);
            }
        }

        .success-message {
            @include flex-row(center);
            margin-top: 1vh;
            color: var(--context-colors-success-0-00);
            font-size: var(--font-sizes-200);
            @include animate-property(opacity, 0, 1, 0.4s, 0.3s);

            &.failure {
                color: var(--context-colors-suggestion-0-00);
            }

            .icon {
                margin-right: 3px;
                font-size: var(--font-sizes-300);
            }
        }
    }

    .fill {
        height: 100%;
    }

    .actions {
        width: 100%;

        .recover-button {
            padding: 1vh 0;
            width: 42.5%;
            border-radius: 50px;
            transition: background-color 0.3s;

            &:hover {
                background-color: var(--form-colors-recover-button-0-00);
            }

            &:not(.disabled) {
                box-shadow: 0 0 4px 1px var(--form-colors-recover-button-0-02);
                background-color: var(--form-colors-recover-button-1-00);
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

    .spinner {
        margin-bottom: 30%;
    }
}
</style>
