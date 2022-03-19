<template>
    <div class="login-input-panel-container">
        <img src="../../../assets/icons/logo.png" />
        <form-input class="form-input" :placeholder="'Email'"></form-input>
        <form-input class="form-input" :type="'password'" :placeholder="'Password'"></form-input>

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
import { Options, Vue } from 'vue-class-component';

import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../../shared/inputs/form-input/form-input.vue';

@Options({
    components: {
        FlatButton,
        FormInput
    }
})
export default class LoginInputPanel extends Vue { }
</script>

<style lang="scss" scoped>
.login-input-panel-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, space-around);
    box-shadow: -1px 0 5px 2px var(--form-colors-login-panel-0-02);
    background-color: var(--form-colors-login-panel-0-00);

    img {
        width: 35%;
    }

    .form-input {
        width: 65%;
    }

    .actions {
        @include flex-column(center);
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
