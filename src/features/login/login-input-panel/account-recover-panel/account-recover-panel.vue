<template>
    <div class="account-recover-panel-container">
        <div class="inputs">
            <form-input class="form-input"
                v-model="email"
                @update:modelValue="showSuccessMessage = false"
                :icon="emailIcon"
                :type="'email'"
                :maxLength="320"
                :placeholder="'Enter your registered email'"
                :validator="validateEmail">
            </form-input>

            <div v-if="showSuccessMessage" class="success-message">
                <check class="icon" />
                <span>password reset link has been sent to your email.</span>
            </div>
        </div>

        <div class="fill"></div>

        <div class="actions">
            <flat-button class="reset-button" @click="onRecover()">Reset</flat-button>

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
import { At, Check } from 'mdue';

import { IconConfig } from '../../../../core/models/generic/icon-config';
import FlatButton from '../../../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../../../shared/inputs/form-input/form-input.vue';

@Options({
    components: {
        Check,
        FlatButton,
        FormInput
    },
    emits: [
        'recover',
        'signIn'
    ]
})
export default class AccountRecoverPanel extends Vue {
    public readonly emailIcon = new IconConfig(markRaw(At), 'var(--font-colors-7-00)');
    public showSuccessMessage = false;
    public email = '';

    public validateEmail(email: string): string {
        if (!email?.trim()) {
            return 'email not provided';
        }

        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email) ? '' : 'invalid email address';
    }

    public onRecover(): void {
        this.$emit('recover', this.email);
        this.showSuccessMessage = true;
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
        margin-top: 5vh;
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

        .reset-button {
            padding: 1vh 0;
            width: 42.5%;
            border-radius: 50px;
            box-shadow: 0 0 4px 1px var(--form-colors-recover-button-0-02);
            background-color: var(--form-colors-recover-button-1-00);
            color: var(--font-colors-0-00);
            transition: background-color 0.3s;

            &:hover {
                background-color: var(--form-colors-recover-button-0-00);
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
